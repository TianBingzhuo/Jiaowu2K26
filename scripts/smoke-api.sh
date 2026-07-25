#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${J2K26_SMOKE_PORT:-31126}"
BASE="http://127.0.0.1:${PORT}/api/v1"
LOG_FILE="$(mktemp)"
export CARGO_TARGET_DIR="${CARGO_TARGET_DIR:-${HOME}/.cache/jiaowu2k26/target}"
READY_ATTEMPTS="${J2K26_SMOKE_READY_ATTEMPTS:-120}"
READY_INTERVAL_SECONDS="${J2K26_SMOKE_READY_INTERVAL_SECONDS:-0.25}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
  rm -f "${LOG_FILE}"
}
trap cleanup EXIT

cd "${ROOT}"

# Build before starting the readiness clock. A clean GitHub runner can spend
# longer compiling than the service itself needs to become ready; counting that
# time as server startup made the smoke test flaky while every Rust test passed.
cargo build --quiet --locked --manifest-path app/Cargo.toml --bin j2k26-api

API_BIN="${CARGO_TARGET_DIR}/debug/j2k26-api"
if [[ -x "${API_BIN}.exe" ]]; then
  API_BIN="${API_BIN}.exe"
fi
if [[ ! -x "${API_BIN}" ]]; then
  echo "Built API binary was not found at ${API_BIN}." >&2
  exit 1
fi

J2K26_DATABASE_URL='sqlite::memory:' \
J2K26_BIND="127.0.0.1:${PORT}" \
"${API_BIN}" >"${LOG_FILE}" 2>&1 &
SERVER_PID=$!

READY=false
for _ in $(seq 1 "${READY_ATTEMPTS}"); do
  if curl --fail --silent "${BASE}/health" >/dev/null; then
    READY=true
    break
  fi
  if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
    echo 'API process exited before becoming ready.' >&2
    cat "${LOG_FILE}" >&2
    exit 1
  fi
  sleep "${READY_INTERVAL_SECONDS}"
done

if [[ "${READY}" != true ]]; then
  echo "API did not become ready after ${READY_ATTEMPTS} attempts at ${READY_INTERVAL_SECONDS}s intervals." >&2
  cat "${LOG_FILE}" >&2
  exit 1
fi

HEALTH="$(curl --fail --silent "${BASE}/health")"
[[ "${HEALTH}" == *'"status":"ok"'* ]]
[[ "${HEALTH}" == *'"data_mode":"fixture"'* ]]

OBJECT_ID='generated-bst-search-001'
OBJECT_URL="${BASE}/generated-objects/${OBJECT_ID}"

START="$(curl --fail --silent --request POST "${OBJECT_URL}/reviews" \
  --header 'content-type: application/json' \
  --data '{"schema_version":"1.0.0","actor_id":"teacher-smoke","expected_revision":0,"action":{"type":"start_review"}}')"
[[ "${START}" == *'"review_state":"review"'* ]]

APPROVE="$(curl --fail --silent --request POST "${OBJECT_URL}/reviews" \
  --header 'content-type: application/json' \
  --data '{"schema_version":"1.0.0","actor_id":"teacher-smoke","expected_revision":1,"action":{"type":"approve"}}')"
[[ "${APPROVE}" == *'"review_state":"approved"'* ]]

PUBLISH="$(curl --fail --silent --request POST "${OBJECT_URL}/publish" \
  --header 'content-type: application/json' \
  --data '{"schema_version":"1.0.0","actor_id":"teacher-smoke","expected_revision":2}')"
[[ "${PUBLISH}" == *'"review_state":"published"'* ]]

REPLAY="$(curl --fail --silent "${OBJECT_URL}/replay")"
[[ "${REPLAY}" == *'"action":"start_review"'* ]]
[[ "${REPLAY}" == *'"action":"approve"'* ]]
[[ "${REPLAY}" == *'"action":"publish"'* ]]
[[ "${REPLAY}" == *'"published_versions":['* ]]

echo 'Verified live API: health → review → approve → publish → replay (fixture + in-memory SQLite).'
