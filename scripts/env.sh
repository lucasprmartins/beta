#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/ui.sh"
setup_root

# ─── Banner ──────────────────────────────────────────────────────────────────

banner "Setup de Ambiente"

# ─── Criar .env se não existir ───────────────────────────────────────────────

CRIOU_SERVER=false
if [ ! -f apps/server/.env ]; then
  cp apps/server/.env.example apps/server/.env
  sedi 's/\r$//' apps/server/.env
  sedi '/^# Apenas/,$d' apps/server/.env
  sedi '/^#/d;/^$/d' apps/server/.env
  CRIOU_SERVER=true
  sucesso "apps/server/.env criado a partir do template"
else
  info "apps/server/.env já existe, mantendo"
fi

if [ ! -f apps/web/.env ]; then
  cp apps/web/.env.example apps/web/.env
  sedi 's/\r$//' apps/web/.env
  sedi '/^# Apenas/,$d' apps/web/.env
  sedi '/^#/d;/^$/d' apps/web/.env
  sucesso "apps/web/.env criado a partir do template"
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

# ─── Configurar DATABASE_URL via Railway (sempre) ───────────────────────────

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

# ─── Resumo ──────────────────────────────────────────────────────────────────

rodape "Ambiente configurado!"
