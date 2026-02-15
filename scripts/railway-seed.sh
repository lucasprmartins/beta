#!/usr/bin/env bash
set -euo pipefail

BOLD="\033[1m"
DIM="\033[2m"
GREEN="\033[32m"
RED="\033[31m"
RESET="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo -e "${BOLD}  Railway Seed${RESET}"
echo -e "${DIM}  ─────────────────────────────────${RESET}"
echo ""

if ! command -v railway &> /dev/null; then
  echo -e "  ${RED}✗${RESET} Railway CLI não está instalado."
  echo -e "  ${DIM}Instale em: https://docs.railway.com/guides/cli${RESET}"
  exit 1
fi

STATUS=$(railway status 2>&1 || true)

if echo "$STATUS" | grep -q "production"; then
  echo -e "  ${RED}✗${RESET} Você está no ambiente de ${BOLD}production${RESET}."
  echo -e "  ${DIM}Execute 'bun railway:dev' para mudar para um ambiente de PR.${RESET}"
  exit 1
fi

echo -e "  ${DIM}Executando seed...${RESET}"
railway run bun db:seed

echo ""
echo -e "${DIM}  ─────────────────────────────────${RESET}"
echo -e "  ${GREEN}✓${RESET} Seed concluído!"
echo ""
