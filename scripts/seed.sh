#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/ui.sh"
setup_root

# ─── Banner ──────────────────────────────────────────────────────────────────

banner "Database Seed"

# ─── Detectar Railway ────────────────────────────────────────────────────────

USA_RAILWAY=false

if command -v railway &> /dev/null; then
  STATUS=$(railway status 2>&1 || true)
  if ! echo "$STATUS" | grep -q "No linked project found"; then
    USA_RAILWAY=true
  fi
fi

# ─── Executar seed ───────────────────────────────────────────────────────────

if [ "$USA_RAILWAY" = true ]; then
  if echo "$STATUS" | grep -q "production"; then
    erro "Você está no ambiente de ${BOLD}production${RESET}. Execute 'bun env:railway' para mudar para um ambiente de desenvolvimento, stating ou PR."
  fi

  info "Executando seed via Railway..."
  railway run turbo -F @app/infra db:seed
else
  aviso "Railway não configurado, executando seed local"
  info "Executando seed..."
  turbo -F @app/infra db:seed
fi

# ─── Resumo ──────────────────────────────────────────────────────────────────

rodape "Seed concluído!"
