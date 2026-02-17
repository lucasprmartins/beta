#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/ui.sh"
setup_root

# ─── Banner ──────────────────────────────────────────────────────────────────

banner "Ambiente Railway"

# ─── Pré-requisitos ─────────────────────────────────────────────────────────

if ! command -v railway &> /dev/null; then
  erro "Railway CLI não está instalado. Instale em: https://docs.railway.com/guides/cli"
fi

STATUS_JSON=$(railway status --json 2>&1 || true)

if echo "$STATUS_JSON" | grep -q "No linked project found"; then
  erro "Nenhum projeto Railway vinculado. Execute 'railway link' primeiro."
fi

sucesso "Projeto detectado."

# ─── Selecionar ambiente ────────────────────────────────────────────────────

echo ""
pergunta "Selecione o ambiente:"
echo ""

ENVS=$(echo "$STATUS_JSON" | bun -e "
  const data = JSON.parse(await Bun.stdin.text());
  for (const e of data.environments.edges) console.log(e.node.name);
")

OPCOES=()
INDEX=0
while IFS= read -r env; do
  INDEX=$((INDEX + 1))
  OPCOES+=("$env")
  echo "${BOLD}${INDEX})${RESET} $env"
done <<< "$ENVS"

if [ "$INDEX" -eq 0 ]; then
  erro "Nenhum ambiente encontrado no projeto."
fi

echo ""
read -p "> Selecione [1]: " SELECAO
SELECAO="${SELECAO:-1}"

if ! [[ "$SELECAO" =~ ^[0-9]+$ ]] || [ "$SELECAO" -lt 1 ] || [ "$SELECAO" -gt "$INDEX" ]; then
  erro "Seleção inválida. Escolha entre 1 e $INDEX."
fi

ENV_NAME="${OPCOES[$((SELECAO - 1))]}"

railway environment "$ENV_NAME"

# ─── Configurar .env ────────────────────────────────────────────────────────

echo ""
info "Atualizando variáveis de ambiente..."
bash "$SCRIPT_DIR/env-local.sh"
