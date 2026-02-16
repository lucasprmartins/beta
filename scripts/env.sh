#!/usr/bin/env bash

BOLD="\033[1m"
DIM="\033[2m"
GREEN="\033[32m"
YELLOW="\033[33m"
RESET="\033[0m"

echo ""
echo -e "${BOLD}  Setup de Ambiente${RESET}"
echo -e "${DIM}  ─────────────────────────────────${RESET}"
echo ""

cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
echo -e "  ${GREEN}✓${RESET} Arquivos .env copiados"

sed -i 's/\r$//' apps/server/.env apps/web/.env

SECRET=$(openssl rand -base64 32)
sed -i "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$SECRET|" apps/server/.env
echo -e "  ${GREEN}✓${RESET} BETTER_AUTH_SECRET gerado"

if command -v railway &> /dev/null; then
  DB_URL=$(railway variables --kv --service=postgres 2>/dev/null | grep '^DATABASE_PUBLIC_URL=' | cut -d'=' -f2-)
  if [ -n "$DB_URL" ]; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$DB_URL|" apps/server/.env
    echo -e "  ${GREEN}✓${RESET} DATABASE_URL configurado via Railway"
  else
    echo -e "  ${YELLOW}!${RESET} DATABASE_URL não encontrado no Railway"
  fi
else
  echo -e "  ${YELLOW}!${RESET} Railway CLI não encontrado, pulando DATABASE_URL"
fi

sed -i '/^# Apenas/,$d' apps/server/.env
sed -i '/^# Apenas/,$d' apps/web/.env
sed -i '/^#/d;/^$/d' apps/server/.env
sed -i '/^#/d;/^$/d' apps/web/.env

echo ""
read -p "  Este projeto utiliza n8n? (s/N) " usa_n8n
if [[ "$usa_n8n" =~ ^[sS]$ ]]; then
  echo ""
  read -p "    N8N_URL: " n8n_url
  read -p "    N8N_API_KEY: " n8n_key
  read -p "    N8N_PROJECT_TAG: " n8n_tag

  mkdir -p n8n
  cat > n8n/.env <<EOF
N8N_URL=$n8n_url
N8N_API_KEY=$n8n_key
N8N_PROJECT_TAG=$n8n_tag
EOF
  echo -e "  ${GREEN}✓${RESET} n8n/.env configurado"
fi

echo ""
echo -e "${DIM}  ─────────────────────────────────${RESET}"
echo -e "  ${GREEN}✓${RESET} Ambiente configurado!"
echo ""
