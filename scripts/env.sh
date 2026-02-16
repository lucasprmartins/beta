#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/ui.sh"
setup_root

# ─── Banner ──────────────────────────────────────────────────────────────────

banner "Setup de Ambiente"

# ─── Copiar .env ─────────────────────────────────────────────────────────────

cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
sucesso "Arquivos .env copiados"

sedi 's/\r$//' apps/server/.env apps/web/.env

# ─── Gerar secrets ───────────────────────────────────────────────────────────

SECRET=$(openssl rand -base64 32)
sedi "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$SECRET|" apps/server/.env
sucesso "BETTER_AUTH_SECRET gerado"

# ─── Configurar DATABASE_URL via Railway ─────────────────────────────────────

if command -v railway &> /dev/null; then
  DB_URL=$(railway variables --kv --service=postgres 2>/dev/null | grep '^DATABASE_PUBLIC_URL=' | cut -d'=' -f2-)
  if [ -n "$DB_URL" ]; then
    sedi "s|^DATABASE_URL=.*|DATABASE_URL=$DB_URL|" apps/server/.env
    sucesso "DATABASE_URL configurado via Railway"
  else
    aviso "DATABASE_URL não encontrado no Railway"
  fi
else
  aviso "Railway CLI não encontrado, pulando DATABASE_URL"
fi

# ─── Limpar comentários e linhas vazias ──────────────────────────────────────

sedi '/^# Apenas/,$d' apps/server/.env
sedi '/^# Apenas/,$d' apps/web/.env
sedi '/^#/d;/^$/d' apps/server/.env
sedi '/^#/d;/^$/d' apps/web/.env

# ─── Resumo ──────────────────────────────────────────────────────────────────

rodape "Ambiente configurado!"
