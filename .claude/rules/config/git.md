# Convenção de Commits

Conventional Commits em **pt-br**, imperativo.

```
tipo(escopo): descrição (máx. 72 chars)
```

## Tipos

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Reestruturação sem mudança de comportamento |
| `style` | Formatação (lint, espaçamento) |
| `chore` | Manutenção (deps, configs, CI) |
| `perf` | Performance |
| `docs` | Documentação |
| `test` | Testes |

## Escopos

| Escopo | Corresponde a |
|--------|---------------|
| `core` | `packages/core` |
| `infra` | `packages/infra` |
| `api` | `packages/api` |
| `auth` | `packages/auth` |
| `config` | `packages/config` |
| `web` | `apps/web` |
| `server` | `apps/server` |
| `ci` | CI/CD workflows |

## Exemplos

```
feat(api): adiciona endpoint de listagem de usuários
fix(web): corrige redirecionamento após login
refactor(core): extrai lógica de validação para domínio
chore(infra): atualiza drizzle-orm para v0.40
style(web): aplica formatação do linter
```
