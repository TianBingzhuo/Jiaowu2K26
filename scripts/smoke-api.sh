#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${J2K26_SMOKE_PORT:-31126}"
BASE="http://127.0.0.1:${PORT}/api/v1"
LOG_FILE="$(mktemp)"
export CARGO_TARGET_DIR="${CARGO_TARGET_DIR:-${HOME}/.cache/jiaowu2k26/target}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
  rm -f "${LOG_FILE}"
}
trap cleanup EXIT

cd "${ROOT}"
J2K26_DATABASE_URL='sqlite::memory:' \
J2K26_BIND="127.0.0.1:${PORT}" \
cargo run --quiet --locked --manifest-path app/Cargo.toml --bin j2k26-api >"${LOG_FILE}" 2>&1 &
SERVER_PID=$!

for _ in $(seq 1 80); do
  if curl --fail --silent "${BASE}/health" >/dev/null; then
    break
  fi
  if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
    cat "${LOG_FILE}" >&2
    exit 1
  fi
  sleep 0.25
done

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
