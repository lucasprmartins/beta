# Documentação via Context7 (MCP)

## Regra

**SEMPRE** consulte a documentação via Context7 antes de implementar código que use qualquer biblioteca do stack. Não confie apenas no conhecimento prévio — APIs mudam entre versões.

## Bibliotecas do Stack

| Biblioteca | Quando consultar |
|------------|-----------------|
| oRPC | Routers, handlers, middleware, errors, client |
| Better Auth | Plugins, session, config, client hooks |
| Drizzle ORM | Schema, queries, migrations, operators |
| TanStack Router | File routes, loaders, navigation |
| TanStack Query | Query options, mutations, infinite queries |
| DaisyUI | Componentes, classes, temas |
| Elysia | Server setup, plugins, lifecycle |

## Workflow

1. Resolver ID: `resolve-library-id` com o nome da lib
2. Consultar: `query-docs` com uma pergunta específica

## Quando é obrigatório

- Configurando ou alterando setup de uma lib
- Usando API que não é trivial (ex: middleware chain, plugins)
- Erro inesperado que pode ser uso incorreto da API
- Implementando feature nova com qualquer lib da tabela acima
