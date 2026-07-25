#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="${ROOT}/.data/university2k26-v09/api.wsl.pid"

if [[ ! -f "${PID_FILE}" ]]; then
  exit 0
fi

pid="$(tr -d '[:space:]' < "${PID_FILE}")"
if [[ "${pid}" =~ ^[0-9]+$ ]] &&
  [[ -r "/proc/${pid}/exe" ]] &&
  [[ "$(basename "$(readlink "/proc/${pid}/exe")")" == "j2k26-api" ]]; then
  kill -TERM "${pid}" 2>/dev/null || true
  for _ in {1..40}; do
    if ! kill -0 "${pid}" 2>/dev/null; then
      break
    fi
    sleep 0.05
  done
fi

rm -f "${PID_FILE}"
