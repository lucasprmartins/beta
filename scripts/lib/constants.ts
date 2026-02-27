export const ARQUIVOS_EXEMPLO = [
  "packages/core/src/contracts/example-crud.ts",
  "packages/core/src/contracts/example-domain.ts",
  "packages/core/src/domains/example-domain.ts",
  "packages/core/src/application/example-crud.ts",
  "packages/core/src/application/example-domain.ts",
  "packages/infra/src/db/schema/example-crud.ts",
  "packages/infra/src/db/schema/example-domain.ts",
  "packages/infra/src/db/repositories/example-crud.ts",
  "packages/infra/src/db/repositories/example-domain.ts",
  "packages/api/src/routers/example-crud.ts",
  "packages/api/src/routers/example-domain.ts",
] as const;

export const RAILWAY_TEMPLATE = "edQPdo";

export const ARQUIVOS_RAILWAY = [
  "scripts/railway.ts",
  "railway.json",
  "apps/server/railway.json",
  "apps/web/railway.json",
  "apps/proxy/railway.json",
] as const;
