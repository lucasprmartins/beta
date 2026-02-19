#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/ui.sh"
setup_root

# ─── Banner ──────────────────────────────────────────────────────────────────

banner "Configurar Ambiente"

# ─── Railway (link + ambiente) ────────────────────────────────────────────────

if ! command -v railway &> /dev/null; then
  erro "Railway CLI não está instalado. Instale em: https://docs.railway.com/guides/cli"
fi

STATUS_JSON=$(railway status --json 2>&1 || true)

if echo "$STATUS_JSON" | grep -q "No linked project found"; then
  aviso "Nenhum projeto Railway vinculado. Linkando automaticamente..."
  echo ""
  bash "$SCRIPT_DIR/railway.sh"
  echo ""
  STATUS_JSON=$(railway status --json 2>&1 || true)
fi

if ! echo "$STATUS_JSON" | bun -e "JSON.parse(await Bun.stdin.text())" &> /dev/null; then
  erro "Falha ao obter status do Railway. Verifique se está autenticado: railway login"
fi

sucesso "Projeto detectado."

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

echo ""

# ─── Criar .env se não existir ───────────────────────────────────────────────

CRIOU_SERVER=false
if [ ! -f apps/server/.env ]; then
  cat > apps/server/.env << 'ENV'
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3001
LOG_LEVEL=debug
ENV
  CRIOU_SERVER=true
  sucesso "apps/server/.env criado"
else
  info "apps/server/.env já existe, mantendo"
fi

if [ ! -f apps/web/.env ]; then
  cat > apps/web/.env << 'ENV'
VITE_SERVER_URL=http://localhost:3000
ENV
  sucesso "apps/web/.env criado"
else
  info "apps/web/.env já existe, mantendo"
fi

# ─── Gerar BETTER_AUTH_SECRET (apenas na criação) ────────────────────────────

if [ "$CRIOU_SERVER" = true ]; then
  SECRET=$(openssl rand -base64 32)
  sedi "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$SECRET|" apps/server/.env
  sucesso "BETTER_AUTH_SECRET gerado"
else
  info "BETTER_AUTH_SECRET mantido (já existente)"
fi

# ─── Configurar DATABASE_URL via Railway ─────────────────────────────────────

DB_URL=$(railway variables --kv --service=postgres 2>/dev/null | grep '^DATABASE_PUBLIC_URL=' | cut -d'=' -f2-)
if [ -n "$DB_URL" ]; then
  sedi "s|^DATABASE_URL=.*|DATABASE_URL=$DB_URL|" apps/server/.env
  sucesso "DATABASE_URL configurado via Railway"
else
  aviso "DATABASE_URL não encontrado no Railway, aguarde o deploy."
fi

# ─── Resumo ──────────────────────────────────────────────────────────────────

rodape "Ambiente configurado!"