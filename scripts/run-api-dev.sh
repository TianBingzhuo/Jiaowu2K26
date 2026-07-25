#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export CARGO_TARGET_DIR="${CARGO_TARGET_DIR:-${HOME}/.cache/university2k26/target}"
RUNTIME_ROOT="${ROOT}/.data/university2k26-v09"
PID_FILE="${RUNTIME_ROOT}/api.wsl.pid"

source "${HOME}/.cargo/env" 2>/dev/null || {
  echo "Rust is not available in Ubuntu WSL." >&2
  exit 127
}

cd "${ROOT}"
cargo build --quiet --locked --manifest-path app/Cargo.toml --bin j2k26-api
mkdir -p "${RUNTIME_ROOT}"
printf '%s\n' "$$" > "${PID_FILE}"

exec env \
  J2K26_BIND="${J2K26_BIND:-127.0.0.1:3000}" \
  J2K26_DATABASE_URL="${J2K26_DATABASE_URL:-sqlite::memory:}" \
  "${CARGO_TARGET_DIR}/debug/j2k26-api"
