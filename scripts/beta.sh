#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/ui.sh"
setup_root

# ─── Banner ──────────────────────────────────────────────────────────────────

banner "Beta — Setup de Projeto"

# ─── Pré-requisitos ──────────────────────────────────────────────────────────

titulo "Verificando pré-requisitos"

if ! command -v bun &> /dev/null; then
  erro "Bun não está instalado. Instale em: https://bun.sh"
fi
sucesso "Bun encontrado"

if ! command -v gh &> /dev/null; then
  erro "GitHub CLI não está instalado. Instale em: https://cli.github.com"
fi
sucesso "GitHub CLI encontrado"

if ! gh auth status &> /dev/null; then
  erro "GitHub CLI não está autenticado. Execute: gh auth login"
fi
sucesso "GitHub CLI autenticado"

# ─── Coleta de informações ───────────────────────────────────────────────────

titulo "Informações do projeto"

pergunta "Nome do projeto:"
read -p "    > " NOME_PROJETO
if [ -z "$NOME_PROJETO" ]; then
  erro "Nome do projeto é obrigatório."
fi

if ! [[ "$NOME_PROJETO" =~ ^[a-zA-Z0-9._-]+$ ]]; then
  erro "Nome inválido. Use apenas letras, números, hífens, pontos e underscores."
fi

echo ""

USA_N8N=false
USA_RAILWAY=false

if pergunta_sn "Usar n8n?"; then
  USA_N8N=true
fi

if pergunta_sn "Usar Railway?"; then
  USA_RAILWAY=true
fi

# ─── Dados n8n (condicional) ─────────────────────────────────────────────────

N8N_URL=""
N8N_API_KEY=""
N8N_TAG=""

if [ "$USA_N8N" = true ]; then
  echo ""
  pergunta "Configuração n8n:"
  read -p "    N8N_URL: " N8N_URL
  read -p "    N8N_API_KEY: " N8N_API_KEY
  read -p "    N8N_PROJECT_TAG: " N8N_TAG
fi

# ─── Dados Railway (condicional) ─────────────────────────────────────────────

RAILWAY_WORKSPACE=""
RAILWAY_TEMPLATE=""

if [ "$USA_RAILWAY" = true ]; then
  echo ""

  if ! command -v railway &> /dev/null; then
    erro "Railway CLI não está instalado. Instale em: https://docs.railway.com/guides/cli"
  fi
  sucesso "Railway CLI encontrado"

  echo ""
  pergunta "Nome do workspace:"
  read -p "    > " RAILWAY_WORKSPACE
  if [ -z "$RAILWAY_WORKSPACE" ]; then
    erro "Nome do workspace é obrigatório."
  fi

  echo ""
  pergunta "Código do template ${DIM}[edQPdo]${RESET}:"
  read -p "    > " RAILWAY_TEMPLATE
  RAILWAY_TEMPLATE="${RAILWAY_TEMPLATE:-edQPdo}"
fi

# ─── Setup Git + GitHub ─────────────────────────────────────────────────────

titulo "Configurando repositório"

rm -rf .git
git init --quiet
sucesso "Repositório Git inicializado"

USUARIO=$(gh api user --jq '.login')
ORGS=$(gh api user/orgs --jq '.[].login' 2>/dev/null || true)

echo ""
pergunta "Selecione o owner do repositório:"
echo ""

OPCOES=("$USUARIO (pessoal)")
INDEX=1
echo -e "    ${BOLD}${INDEX})${RESET} $USUARIO ${DIM}(pessoal)${RESET}"

if [ -n "$ORGS" ]; then
  while IFS= read -r org; do
    INDEX=$((INDEX + 1))
    OPCOES+=("$org")
    echo -e "    ${BOLD}${INDEX})${RESET} $org"
  done <<< "$ORGS"
fi

echo ""
read -p "    Selecione [1]: " SELECAO
SELECAO="${SELECAO:-1}"

if ! [[ "$SELECAO" =~ ^[0-9]+$ ]] || [ "$SELECAO" -lt 1 ] || [ "$SELECAO" -gt "$INDEX" ]; then
  erro "Seleção inválida. Escolha entre 1 e $INDEX."
fi

if [ "$SELECAO" -eq 1 ]; then
  OWNER="$USUARIO"
else
  OWNER="${OPCOES[$((SELECAO - 1))]}"
fi

echo ""
info "Criando repositório $OWNER/$NOME_PROJETO..."
gh repo create "$OWNER/$NOME_PROJETO" --private --source=. --remote=origin
sucesso "Repositório criado: $OWNER/$NOME_PROJETO"

# ─── Deploy Railway (condicional) ────────────────────────────────────────────

if [ "$USA_RAILWAY" = true ]; then
  titulo "Deploy Railway"

  info "Criando projeto..."
  railway init -n "$NOME_PROJETO" -w "$RAILWAY_WORKSPACE"

  info "Aplicando template..."
  railway deploy -t "$RAILWAY_TEMPLATE"

  sleep 10 &
  spinner $! "Aguardando projeto ficar disponível..."
  sucesso "Projeto disponível"

  info "Abrindo dashboard..."
  railway open

  sucesso "Deploy Railway iniciado"
fi

# ─── Limpeza condicional ─────────────────────────────────────────────────────

titulo "Limpeza"

if [ "$USA_N8N" = false ]; then
  rm -rf n8n/
  sucesso "Diretório n8n/ removido"
fi

if [ "$USA_RAILWAY" = false ]; then
  rm -f scripts/railway-dev.sh railway.json
  sucesso "Scripts Railway removidos"
fi

# ─── Atualizar package.json ──────────────────────────────────────────────────

info "Atualizando package.json..."

NOME_PROJETO="$NOME_PROJETO" USA_N8N="$USA_N8N" USA_RAILWAY="$USA_RAILWAY" bun -e "
import { readFileSync, writeFileSync } from 'fs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
pkg.name = process.env.NOME_PROJETO;
if (process.env.USA_N8N === 'false') { delete pkg.scripts['n8n:pull']; delete pkg.scripts['n8n:push']; }
if (process.env.USA_RAILWAY === 'false') { delete pkg.scripts['railway:dev']; }
delete pkg.scripts['beta'];
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"
sucesso "package.json atualizado"

# ─── Configurar n8n/.env (condicional) ───────────────────────────────────────

if [ "$USA_N8N" = true ]; then
  mkdir -p n8n
  {
    printf 'N8N_URL=%s\n' "$N8N_URL"
    printf 'N8N_API_KEY=%s\n' "$N8N_API_KEY"
    printf 'N8N_PROJECT_TAG=%s\n' "$N8N_TAG"
  } > n8n/.env
  sucesso "n8n/.env configurado"
fi

# ─── Auto-remoção ────────────────────────────────────────────────────────────

rm -f scripts/beta.sh
sucesso "Script beta removido"

# ─── Commit inicial + push ───────────────────────────────────────────────────

titulo "Finalizando"

BRANCH=$(git branch --show-current)
git add .
git commit --quiet -m "feat: setup inicial do projeto"
git push --quiet -u origin "$BRANCH"
sucesso "Commit inicial enviado para origin/$BRANCH"

# ─── Resumo final ────────────────────────────────────────────────────────────

rodape "Projeto ${BOLD}$NOME_PROJETO${RESET} criado com sucesso!"

echo -e "  ${DIM}Owner:${RESET}    $OWNER"
echo -e "  ${DIM}n8n:${RESET}      $([ "$USA_N8N" = true ] && echo "ativado" || echo "removido")"
echo -e "  ${DIM}Railway:${RESET}  $([ "$USA_RAILWAY" = true ] && echo "ativado" || echo "removido")"

banner "Próximos passos"

echo -e "  1. ${BOLD}bun env${RESET}       ${DIM}— configurar variáveis de ambiente${RESET}"
if [ "$USA_RAILWAY" = true ]; then
  echo -e "  2. ${BOLD}bun seed${RESET}      ${DIM}— popular banco de dados${RESET}"
  echo -e "  3. ${BOLD}bun cleanup${RESET}   ${DIM}— remover exemplos${RESET}"
else
  echo -e "  2. ${BOLD}bun cleanup${RESET}   ${DIM}— remover exemplos${RESET}"
fi
echo ""
