#!/bin/bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env

# Remove \r (Windows line endings)
sed -i 's/\r$//' apps/server/.env apps/web/.env

# Gera BETTER_AUTH_SECRET
SECRET=$(openssl rand -base64 32)
sed -i "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$SECRET|" apps/server/.env

# Puxa DATABASE_URL do Railway (se o CLI estiver autenticado)
if command -v railway &> /dev/null; then
  DB_URL=$(railway variables --kv --service=postgres 2>/dev/null | grep '^DATABASE_PUBLIC_URL=' | cut -d'=' -f2-)
  if [ -n "$DB_URL" ]; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$DB_URL|" apps/server/.env
  fi
fi

# Remove blocos opcionais (a partir de "# Apenas") e comentários
sed -i '/^# Apenas/,$d' apps/server/.env
sed -i '/^# Apenas/,$d' apps/web/.env
sed -i '/^#/d;/^$/d' apps/server/.env
sed -i '/^#/d;/^$/d' apps/web/.env
