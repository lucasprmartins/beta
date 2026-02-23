#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/ui.sh"
setup_root

# ─── Banner ──────────────────────────────────────────────────────────────────

banner "Setup de Projeto"

# ─── Pré-requisitos ──────────────────────────────────────────────────────────

titulo "Verificando pré-requisitos"

if ! command -v gh &> /dev/null; then
  erro "GitHub CLI não está instalado. Instale em: https://cli.github.com"
fi
sucesso "GitHub CLI instalado"

if ! gh auth status &> /dev/null; then
  erro "GitHub CLI não está autenticado. Execute: gh auth login"
fi
sucesso "GitHub CLI autenticado"

# ─── Coleta de informações ───────────────────────────────────────────────────

titulo "Informações do projeto"

pergunta "Nome do projeto:"
read -p "> " NOME_PROJETO
if [ -z "$NOME_PROJETO" ]; then
  erro "Nome do projeto é obrigatório."
fi

if ! [[ "$NOME_PROJETO" =~ ^[a-zA-Z0-9._-]+$ ]]; then
  erro "Nome inválido. Use apenas letras, números, hífens, pontos e underscores."
fi

echo ""

USA_S3=false
USA_N8N=false
USA_RAILWAY=false

if pergunta_sn "Usar Storage S3?"; then
  USA_S3=true
fi

if pergunta_sn "Usar n8n?"; then
  USA_N8N=true
fi

if pergunta_sn "Usar Railway?"; then
  USA_RAILWAY=true
fi

# ─── Dados Railway (condicional) ─────────────────────────────────────────────

RAILWAY_WORKSPACE=""
RAILWAY_TEMPLATE=""

if [ "$USA_RAILWAY" = true ]; then
  echo ""

  if ! command -v railway &> /dev/null; then
    aviso "Railway CLI não está instalado."
    info "Instale em: https://docs.railway.com/guides/cli"
    echo ""
    erro "Instale o Railway CLI e execute o setup novamente."
  fi
  sucesso "Railway CLI instalado"

  if ! railway whoami &> /dev/null; then
    aviso "Railway CLI não está autenticado."
    info "Execute: railway login"
    echo ""
    erro "Autentique o Railway CLI e execute o setup novamente."
  fi
  sucesso "Railway CLI autenticado"

  echo ""
  pergunta "Nome do workspace:"
  read -p "> " RAILWAY_WORKSPACE
  if [ -z "$RAILWAY_WORKSPACE" ]; then
    erro "Nome do workspace é obrigatório."
  fi

  if [ "$USA_S3" = true ]; then
    RAILWAY_TEMPLATE="XGuIs7"
  else
    RAILWAY_TEMPLATE="edQPdo"
  fi
fi

# ─── Limpeza condicional ─────────────────────────────────────────────────────

titulo "Limpeza"

if [ "$USA_N8N" = false ]; then
  rm -rf n8n/
  rm -f packages/infra/src/integrations/n8n.ts
  sedi '/N8N_WEBHOOK/d' packages/infra/src/env.ts
  sedi '/n8n Webhooks/d;/N8N_WEBHOOK/d' apps/server/.env.example
  sedi '/^### n8n/,$d' .claude/rules/server/infra.md
  sedi '/bun n8n/d' .claude/settings.json
  sedi '/"files"/,/}/d' biome.jsonc
  sucesso "Diretório n8n/ e referências removidos"
fi

if [ "$USA_S3" = false ]; then
  rm -f packages/infra/src/integrations/storage.ts
  rm -f packages/infra/src/integrations/storage-cors.ts
  sedi '/S3_/d' packages/infra/src/env.ts
  sedi '/Buckets S3/d;/S3_/d' apps/server/.env.example
  sedi -e '/^### Storage S3/,/^### [^S]/{' -e '/^### [^S]/!d' -e '}' .claude/rules/server/infra.md
  sedi '/@aws-sdk/d' packages/infra/package.json
  sedi '/"storage"/d' packages/infra/package.json
  sedi '/"storage"/d' package.json
  sedi '/Storage.*AWS SDK S3/d' .claude/CLAUDE.md
  sucesso "Storage S3 e referências removidos"
fi

if [ "$USA_S3" = true ]; then
  sedi 's/bun db:migrate/bun db:migrate \&\& bun storage/g' apps/server/railway.json
  sucesso "Storage adicionado ao preDeployCommand"
fi

if [ "$USA_RAILWAY" = false ]; then
  rm -f scripts/railway.sh railway.json apps/server/railway.json apps/web/railway.json

  # env.sh: remover bloco Railway (link + ambiente) e DATABASE_URL via Railway
  sedi '/Railway.*link.*ambiente/,/^echo ""/d' scripts/env.sh
  sedi '/DATABASE_URL via Railway/,/^fi$/d' scripts/env.sh

  # seed.sh: substituir por versão simplificada (sem Railway)
  cat > scripts/seed.sh << 'SEED'
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/ui.sh"
setup_root

banner "Database Seed"

info "Executando seed..."
turbo -F @app/infra db:seed

rodape "Seed concluído!"
SEED

  sucesso "Scripts Railway e referências removidos"
fi

# ─── Substituir README.md ────────────────────────────────────────────────────

cat > README.md << EOF
# $NOME_PROJETO

<!-- Adicione aqui a descrição do seu projeto -->
EOF
sucesso "README.md substituído"

# ─── Atualizar package.json ──────────────────────────────────────────────────

info "Atualizando package.json..."

NOME_PROJETO="$NOME_PROJETO" USA_S3="$USA_S3" USA_N8N="$USA_N8N" USA_RAILWAY="$USA_RAILWAY" bun -e "
import { readFileSync, writeFileSync } from 'fs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
pkg.name = process.env.NOME_PROJETO;
if (process.env.USA_N8N === 'false') { delete pkg.scripts['n8n:pull']; delete pkg.scripts['n8n:push']; }
if (process.env.USA_RAILWAY === 'false') { delete pkg.scripts['railway']; }
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"
sucesso "package.json atualizado"

# ─── Instalar dependências ───────────────────────────────────────────────────

titulo "Instalando dependências"

bun install
echo ""
sucesso "Dependências instaladas"

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
echo "${BOLD}${INDEX})${RESET} $USUARIO ${DIM}(pessoal)${RESET}"

if [ -n "$ORGS" ]; then
  while IFS= read -r org; do
    INDEX=$((INDEX + 1))
    OPCOES+=("$org")
    echo "${BOLD}${INDEX})${RESET} $org"
  done <<< "$ORGS"
fi

echo ""
read -p "> Selecione [1]: " SELECAO
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
if gh repo view "$OWNER/$NOME_PROJETO" &> /dev/null; then
  git remote add origin "https://github.com/$OWNER/$NOME_PROJETO.git" 2>/dev/null || true
  sucesso "Repositório $OWNER/$NOME_PROJETO já existe, reutilizando"
else
  info "Criando repositório $OWNER/$NOME_PROJETO..."
  gh repo create "$OWNER/$NOME_PROJETO" --private --source=. --remote=origin
  sucesso "Repositório criado: $OWNER/$NOME_PROJETO"
fi

# ─── Gerar config.json ─────────────────────────────────────────────────────

info "Gerando config.json..."

NOME_PROJETO="$NOME_PROJETO" OWNER="$OWNER" USA_S3="$USA_S3" USA_N8N="$USA_N8N" USA_RAILWAY="$USA_RAILWAY" RAILWAY_WORKSPACE="$RAILWAY_WORKSPACE" bun -e "
import { writeFileSync } from 'fs';
const config = { name: process.env.NOME_PROJETO, owner: process.env.OWNER };
if (process.env.USA_S3 === 'true') config.storage = true;
if (process.env.USA_N8N === 'true') config.n8n = true;
if (process.env.USA_RAILWAY === 'true') config.railway = { workspace: process.env.RAILWAY_WORKSPACE };
writeFileSync('config.json', JSON.stringify(config, null, 2) + '\n');
"
sucesso "config.json gerado"

# ─── Deploy Railway (condicional) ────────────────────────────────────────────

if [ "$USA_RAILWAY" = true ]; then
  titulo "Deploy Railway"

  if railway status &> /dev/null; then
    sucesso "Projeto Railway já existe, reutilizando"
  else
    info "Criando projeto..."
    railway init -n "$NOME_PROJETO" -w "$RAILWAY_WORKSPACE"

    info "Aplicando template..."
    railway deploy -t "$RAILWAY_TEMPLATE"

    sleep 10 &
    spinner $! "Aguardando projeto ficar disponível..."
    sucesso "Projeto disponível"
  fi

  info "Abrindo dashboard no navegador..."
  railway open

  echo ""
  aviso "${BOLD}Ação manual necessária no Railway:${RESET}"
  echo ""
  info "Nos serviços ${BOLD}web${RESET}${DIM} e ${RESET}${BOLD}server${RESET}${DIM}:${RESET}"
  info "1. Settings → Source → Disconnect"
  info "2. Conecte o repo ${BOLD}$OWNER/$NOME_PROJETO${RESET}"
  info "3. Settings → Config-as-code → + Add File Path"
  info "   ${BOLD}server${RESET}${DIM}: /apps/server/railway.json${RESET}"
  info "   ${BOLD}web${RESET}${DIM}:    /apps/web/railway.json${RESET}"
  echo ""
  aviso "Não use Eject — ele cria um novo repositório"
  echo ""
  aviso "${BOLD}Essa etapa é essencial.${RESET} Sem ela, o Railway não saberá como buildar e deployar cada serviço."
  echo ""
  read -p "> Você já configurou o repositório e o Config File Path nos dois serviços? [y/N] " CONFIRMOU_RAILWAY
  if [[ ! "$CONFIRMOU_RAILWAY" =~ ^[yYsS]$ ]]; then
    erro "Configure os serviços no Railway antes de continuar."
  fi

  sucesso "Deploy Railway configurado"
fi

# ─── Auto-remoção ────────────────────────────────────────────────────────────

rm -f scripts/setup.sh
sedi '/"setup"/d' package.json
sucesso "Script setup removido"

# ─── Commit inicial + push ───────────────────────────────────────────────────

titulo "Finalizando"

BRANCH=$(git branch --show-current)
git add .
git commit --quiet -m "feat: setup inicial do projeto"
git push --quiet -u origin "$BRANCH"
sucesso "Commit inicial enviado para origin/$BRANCH"

# ─── Resumo final ────────────────────────────────────────────────────────────

rodape "Projeto ${BOLD}$NOME_PROJETO${RESET} criado com sucesso!"

echo "${DIM}Owner:${RESET}    $OWNER"
echo "${DIM}Storage:${RESET}  $([ "$USA_S3" = true ] && echo "ativado" || echo "removido")"
echo "${DIM}n8n:${RESET}      $([ "$USA_N8N" = true ] && echo "ativado" || echo "removido")"
echo "${DIM}Railway:${RESET}  $([ "$USA_RAILWAY" = true ] && echo "ativado" || echo "removido")"

banner "Próximos passos"

if [ "$USA_RAILWAY" = true ]; then
  echo "1. ${BOLD}bun env${RESET}         ${DIM}— configurar variáveis de ambiente${RESET}"
  echo "2. ${BOLD}bun db:seed${RESET}     ${DIM}— popular banco de dados${RESET}"
  echo "3. ${BOLD}bun cleanup${RESET}     ${DIM}— remover exemplos${RESET}"
else
  echo "1. ${BOLD}bun env${RESET}         ${DIM}— configurar variáveis de ambiente${RESET}"
  echo "2. ${BOLD}bun cleanup${RESET}     ${DIM}— remover exemplos${RESET}"
fi
echo ""
