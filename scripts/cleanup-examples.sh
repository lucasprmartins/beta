#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "Removendo arquivos de exemplo..."

rm -f packages/core/src/contracts/example-crud.ts
rm -f packages/core/src/contracts/example-domain.ts
rm -f packages/core/src/domains/example-domain.ts
rm -f packages/core/src/application/example-crud.ts
rm -f packages/core/src/application/example-domain.ts
rm -f packages/infra/src/db/schema/example-crud.ts
rm -f packages/infra/src/db/schema/example-domain.ts
rm -f packages/infra/src/db/repositories/example-crud.ts
rm -f packages/infra/src/db/repositories/example-domain.ts
rm -f packages/api/src/routers/example-crud.ts
rm -f packages/api/src/routers/example-domain.ts

echo "Limpando packages/api/src/index.ts..."

sed -i '/example-crud/d;/example-domain/d' packages/api/src/index.ts
sed -i '/categoria: categoriaRouter/d;/produto: produtoRouter/d' packages/api/src/index.ts

echo "Removendo este script..."
rm -f "$0"

echo "Pronto! Exemplos removidos."
