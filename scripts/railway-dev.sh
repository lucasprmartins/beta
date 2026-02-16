#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/ui.sh"
setup_root

# ─── Banner ──────────────────────────────────────────────────────────────────

banner "Railway Dev"

# ─── Pré-requisitos ─────────────────────────────────────────────────────────

if ! command -v railway &> /dev/null; then
  erro "Railway CLI não está instalado. Instale em: https://docs.railway.com/guides/cli"
fi

# ─── Coleta de informações ──────────────────────────────────────────────────

pergunta "Nome do ambiente ${DIM}(ex: proj-1-pr-4)${RESET}:"
read -p "    > " ENV_NAME
if [ -z "$ENV_NAME" ]; then
  erro "Nome do ambiente é obrigatório."
fi

# ─── Vincular ambiente ──────────────────────────────────────────────────────

echo ""
info "Vinculando ao ambiente '$ENV_NAME'..."
railway link -e "$ENV_NAME"

# ─── Resumo ──────────────────────────────────────────────────────────────────

rodape "Ambiente alterado para ${BOLD}$ENV_NAME${RESET}!"

echo -e "  ${DIM}Agora você pode executar:${RESET}"
echo -e "  ${DIM}  bun env    ${RESET}Configurar .env local"
echo -e "  ${DIM}  bun seed   ${RESET}Popular banco com dados de teste"
echo ""
