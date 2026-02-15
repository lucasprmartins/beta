#!/usr/bin/env bash
set -euo pipefail

BOLD="\033[1m"
DIM="\033[2m"
GREEN="\033[32m"
RESET="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo -e "${BOLD}  Cleanup de Exemplos${RESET}"
echo -e "${DIM}  ─────────────────────────────────${RESET}"
echo ""

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
echo -e "  ${GREEN}✓${RESET} Arquivos de exemplo removidos"

sed -i '/example-crud/d;/example-domain/d' packages/api/src/index.ts
sed -i '/categoria: categoriaRouter/d;/produto: produtoRouter/d' packages/api/src/index.ts
echo -e "  ${GREEN}✓${RESET} Imports limpos em packages/api/src/index.ts"

echo ""
echo -e "${DIM}  ─────────────────────────────────${RESET}"
echo -e "  ${GREEN}✓${RESET} Exemplos removidos!"
echo ""
