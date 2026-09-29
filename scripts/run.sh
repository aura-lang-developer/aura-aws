#!/usr/bin/env bash
# ==============================================================================
# Aura Quick Launcher
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

PORT=${1:-4566}

echo "Starting Aura local cloud emulator on port :${PORT}..."
cd "${PROJECT_DIR}"
AURA_PORT=${PORT} aurac run server.aura
