#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/ui.sh"
setup_root

# ─── Banner ──────────────────────────────────────────────────────────────────

banner "Railway Link"

# ─── Pré-requisitos ──────────────────────────────────────────────────────────

if ! command -v railway &> /dev/null; then
  erro "Railway CLI não está instalado. Instale em: https://docs.railway.com/guides/cli"
fi

if [ ! -f config.json ]; then
  erro "config.json não encontrado. Execute o setup primeiro."
fi

NOME=$(bun -e "const c = await Bun.file('config.json').json(); console.log(c.name)")
WORKSPACE=$(bun -e "const c = await Bun.file('config.json').json(); console.log(c.railway?.workspace ?? '')")

if [ -z "$WORKSPACE" ]; then
  erro "Workspace Railway não configurado no config.json."
fi

# ─── Link ────────────────────────────────────────────────────────────────────

info "Vinculando projeto $NOME no workspace $WORKSPACE..."
railway link -p "$NOME" -w "$WORKSPACE"
sucesso "Projeto vinculado com sucesso"
