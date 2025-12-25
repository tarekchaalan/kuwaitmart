#!/usr/bin/env bash
set -euo pipefail

echo "======================================"
echo " Bird‑Mart Test Suite"
echo "======================================"
echo

echo "1) Unit + Integration tests"
npm run -s test
echo

echo "2) Coverage report (text + HTML in coverage/)"
npm run -s coverage
echo

echo "Done. To watch tests interactively: npm run test:watch"
echo "To open the Vitest UI: npm run test:ui"


