#!/usr/bin/env bash
# File: scripts/security/audit-keys.sh
# Responsibility: Quick local scan for accidentally committed secrets.
# Security: Uses conservative pattern matching and local-only output.

set -euo pipefail

if command -v rg >/dev/null 2>&1; then
  rg -n --hidden --glob '!node_modules' --glob '!dist' '(api[_-]?key|secret|token|BEGIN PRIVATE KEY)' .
else
  grep -RInE '(api[_-]?key|secret|token|BEGIN PRIVATE KEY)' .
fi
