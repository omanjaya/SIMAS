#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="$(cd "${ROOT_DIR}/../frontend" && pwd)"

LARAVEL_PORT="${LARAVEL_PORT:-8000}"
NEXT_PORT="${NEXT_PORT:-3000}"

cleanup() {
  if [ -n "${PHP_PID:-}" ]; then
    kill "${PHP_PID}" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT

echo "Starting Laravel backend on port ${LARAVEL_PORT}..."
(
  cd "${ROOT_DIR}"
  php artisan serve --host=0.0.0.0 --port="${LARAVEL_PORT}"
) &
PHP_PID=$!

echo "Starting Next.js frontend on port ${NEXT_PORT}..."
(
  cd "${FRONTEND_DIR}"
  npm run dev -- --hostname 0.0.0.0 --port "${NEXT_PORT}"
)
