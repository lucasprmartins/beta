#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v railway &> /dev/null; then
  echo "Erro: Railway CLI não está instalado."
  echo "Instale em: https://docs.railway.com/guides/cli"
  exit 1
fi

STATUS=$(railway status 2>&1 || true)
if ! echo "$STATUS" | grep -q "No linked project found"; then
  echo "Erro: já existe um projeto Railway vinculado a este diretório."
  echo "Use 'railway status' para ver detalhes."
  exit 1
fi

read -p "Nome do projeto: " PROJECT_NAME
if [ -z "$PROJECT_NAME" ]; then
  echo "Erro: nome do projeto é obrigatório."
  exit 1
fi

read -p "Nome do workspace: " WORKSPACE_NAME
if [ -z "$WORKSPACE_NAME" ]; then
  echo "Erro: nome do workspace é obrigatório."
  exit 1
fi

read -p "Código do template [edQPdo]: " TEMPLATE_CODE
TEMPLATE_CODE="${TEMPLATE_CODE:-edQPdo}"

echo "Criando projeto '$PROJECT_NAME' no workspace '$WORKSPACE_NAME'..."
railway init -n "$PROJECT_NAME" -w "$WORKSPACE_NAME"

echo "Aplicando template '$TEMPLATE_CODE'..."
railway deploy -t "$TEMPLATE_CODE"

echo "Aguardando projeto ficar disponível..."
sleep 10

echo "Abrindo dashboard do Railway..."
railway open

echo ""
echo "Deploy iniciado!"
echo "Aguarde o deploy finalizar no dashboard e depois execute 'bun env' para configurar o ambiente local."
