#!/usr/bin/env bash
set -euo pipefail

BOLD="\033[1m"
DIM="\033[2m"
GREEN="\033[32m"
RED="\033[31m"
CYAN="\033[36m"
RESET="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo -e "${BOLD}  Railway Dev${RESET}"
echo -e "${DIM}  ─────────────────────────────────${RESET}"
echo ""

if ! command -v railway &> /dev/null; then
  echo -e "  ${RED}✗${RESET} Railway CLI não está instalado."
  echo -e "  ${DIM}Instale em: https://docs.railway.com/guides/cli${RESET}"
  exit 1
fi

echo -e "  ${CYAN}?${RESET} Nome do ambiente ${DIM}(ex: proj-1-pr-4)${RESET}:"
read -p "    > " ENV_NAME
if [ -z "$ENV_NAME" ]; then
  echo -e "  ${RED}✗${RESET} Nome do ambiente é obrigatório."
  exit 1
fi

echo ""
echo -e "  ${DIM}Vinculando ao ambiente '$ENV_NAME'...${RESET}"
railway link -e "$ENV_NAME"

echo ""
echo -e "${DIM}  ─────────────────────────────────${RESET}"
echo -e "  ${GREEN}✓${RESET} Ambiente alterado para ${BOLD}$ENV_NAME${RESET}!"
echo ""
echo -e "  ${DIM}Agora você pode executar:${RESET}"
echo -e "  ${DIM}  bun env            ${RESET}Configurar .env local"
echo -e "  ${DIM}  bun railway:seed   ${RESET}Popular banco com dados de teste"
echo ""
