#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/lib/ui.sh"
setup_root

# ─── Banner ──────────────────────────────────────────────────────────────────

banner "Cleanup de Exemplos"

# ─── Remover arquivos de exemplo ─────────────────────────────────────────────

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
sucesso "Arquivos de exemplo removidos"

# ─── Limpar imports ──────────────────────────────────────────────────────────

sed -i '/example-crud/d;/example-domain/d' packages/api/src/index.ts
sed -i '/categoria: categoriaRouter/d;/produto: produtoRouter/d' packages/api/src/index.ts
sucesso "Imports limpos em packages/api/src/index.ts"

# ─── Resumo ──────────────────────────────────────────────────────────────────

rodape "Exemplos removidos!"
