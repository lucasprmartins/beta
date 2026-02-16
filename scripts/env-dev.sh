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

STATUS_JSON=$(railway status --json 2>&1 || true)

if echo "$STATUS_JSON" | grep -q "No linked project found"; then
  erro "Nenhum projeto Railway vinculado. Execute 'bun beta' primeiro."
fi

PROJECT_ID=$(echo "$STATUS_JSON" | bun -e "
import { createInterface } from 'readline';
const rl = createInterface({ input: process.stdin });
let data = '';
for await (const line of rl) data += line;
console.log(JSON.parse(data).id);
")

sucesso "Projeto detectado."

# ─── Coleta de informações ──────────────────────────────────────────────────

echo ""
pergunta "Nome do ambiente ${DIM}(ex: proj-1-pr-4)${RESET}:"
read -p "> " ENV_NAME
if [ -z "$ENV_NAME" ]; then
  erro "Nome do ambiente é obrigatório."
fi

# ─── Vincular ambiente ──────────────────────────────────────────────────────

echo ""
info "Vinculando ao ambiente '$ENV_NAME'..."
railway link -p "$PROJECT_ID" -e "$ENV_NAME"

# ─── Resumo ──────────────────────────────────────────────────────────────────

rodape "Ambiente alterado para ${BOLD}$ENV_NAME${RESET}!"

echo -e "${DIM}Agora você pode executar:${RESET}"
echo -e "${DIM}  bun env    ${RESET}Configurar .env local"
echo -e "${DIM}  bun seed   ${RESET}Popular banco com dados de teste"
echo ""
