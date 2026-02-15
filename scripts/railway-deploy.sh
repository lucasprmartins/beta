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
echo -e "${BOLD}  Railway Deploy${RESET}"
echo -e "${DIM}  ─────────────────────────────────${RESET}"
echo ""

if ! command -v railway &> /dev/null; then
  echo -e "  ${RED}✗${RESET} Railway CLI não está instalado."
  echo -e "  ${DIM}Instale em: https://docs.railway.com/guides/cli${RESET}"
  exit 1
fi

STATUS=$(railway status 2>&1 || true)
if ! echo "$STATUS" | grep -q "No linked project found"; then
  echo -e "  ${RED}✗${RESET} Já existe um projeto Railway vinculado."
  echo -e "  ${DIM}Use 'railway status' para ver detalhes.${RESET}"
  exit 1
fi

echo -e "  ${CYAN}?${RESET} Nome do projeto:"
read -p "    > " PROJECT_NAME
if [ -z "$PROJECT_NAME" ]; then
  echo -e "  ${RED}✗${RESET} Nome do projeto é obrigatório."
  exit 1
fi

echo ""
echo -e "  ${CYAN}?${RESET} Nome do workspace:"
read -p "    > " WORKSPACE_NAME
if [ -z "$WORKSPACE_NAME" ]; then
  echo -e "  ${RED}✗${RESET} Nome do workspace é obrigatório."
  exit 1
fi

echo ""
echo -e "  ${CYAN}?${RESET} Código do template ${DIM}[edQPdo]${RESET}:"
read -p "    > " TEMPLATE_CODE
TEMPLATE_CODE="${TEMPLATE_CODE:-edQPdo}"

echo ""
echo -e "  ${DIM}Criando projeto...${RESET}"
railway init -n "$PROJECT_NAME" -w "$WORKSPACE_NAME"

echo -e "  ${DIM}Aplicando template...${RESET}"
railway deploy -t "$TEMPLATE_CODE"

echo -e "  ${DIM}Aguardando projeto ficar disponível...${RESET}"
sleep 10

echo -e "  ${DIM}Abrindo dashboard...${RESET}"
railway open

echo ""
echo -e "${DIM}  ─────────────────────────────────${RESET}"
echo -e "  ${GREEN}✓${RESET} Deploy iniciado!"
echo ""
echo -e "  ${DIM}Aguarde o deploy finalizar no dashboard"
echo -e "  e depois execute ${RESET}${BOLD}bun env${RESET}${DIM} para configurar o ambiente local.${RESET}"
echo ""
