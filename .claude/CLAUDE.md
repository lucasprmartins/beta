# Arquitetura do Projeto

Monorepo com arquitetura limpa, separando responsabilidades em pacotes independentes.

## Estrutura

```
apps/
├── server/        # Servidor HTTP (Elysia/Bun)
└── web/           # Frontend (React 19 + TanStack)

packages/
├── config/        # Configurações compartilhadas (tsconfig)
├── core/          # Lógica de negócio (sem dependências externas)
├── infra/         # Infraestrutura (DB + APIs externas)
├── auth/          # Autenticação (Better Auth)
└── api/           # Definição da API (oRPC)
```

## Fluxo de Dados

```
Server → Auth → Sessão/Cookies
       → API (oRPC + Middleware) → Application → Domain → Repository (Contrato)
                                                                ↓
                                                        Infra (Implementação)
```

## Princípios

- **Retorne `null`, não `throw`** para fluxos esperados (não encontrado, já existe, inválido)
- **Injeção de dependência** via closure nos use cases
- **Factory method estático** em entidades (`Entidade.criar()`) com construtor privado
- **Nomes em pt-br** para domínio de negócio

## Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime/PM | Bun |
| Server | Elysia |
| API | oRPC |
| Auth | Better Auth |
| DB | Drizzle ORM + PostgreSQL |
| Frontend | React 19 + TanStack Router/Query |
| Styling | Tailwind CSS + DaisyUI |
| Icons | Phosphor Icons |

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `bun lint` | Verifica erros de lint (Ultracite) |
| `bun lint:fix` | Corrige erros de lint automaticamente |
| `bun check-types` | Verifica erros de tipagem TypeScript |

## Regras

- Respeite as boas práticas de desenvolvimento
- Consulte Context7 (MCP) para documentação de frameworks
- Não crie comentários no código a não ser que eu peça
- Não use comando de build a não ser que eu peça
- Não tente gerar rotas do TanStack Router (ele gera automaticamente)
- Não use `cd` para o diretório de trabalho — você já está nele. Use `cd` apenas quando realmente precisar mudar de diretório
