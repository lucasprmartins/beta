## Visão Geral

Este projeto é um template monorepo com arquitetura limpa orientada a domínio de negócio separando responsabilidades na arquitetura de software e na estrutura de pastas, com stack totalmente moderna e otimizada para desenvolvimento fullstack. O objetivo é fornecer uma base sólida e escalável para construção de aplicações web complexas seguindo boas práticas de design de software.

## Stack

- Bun para runtime, gerenciamento de pacotes e testes.
- Elysia como framework de servidor HTTP em `apps/server`.
- React 19 com TanStack Router e Query para frontend em `apps/web`.
    - Tailwind CSS e DaisyUI para estilização e design.
    - Phosphor Icons para ícones.
- Drizzle ORM com PostgreSQL para persistência em `packages/infra`.
- oRPC para definição de API fortemente tipada em `packages/api`.
- Better Auth para autenticação em `packages/auth`.

## Arquitetura

A arquitetura é baseada em camadas, onde cada camada tem responsabilidades claras e bem definidas:
- **Domínio**: Contém as regras de negócio, entidades e lógica central da aplicação. Deve ser independente de frameworks e tecnologias específicas.
- **Aplicação**: Orquestra as operações do domínio, implementa casos de uso e coordena a comunicação entre as camadas.
- **Infraestrutura**: Implementa detalhes técnicos como acesso a banco de dados, serviços externos e frameworks. Deve ser o mais isolada possível do domínio para facilitar manutenção e testes.

## Instruções

- **SEMPRE** consulte a documentação via Context7 antes de implementar código que use qualquer biblioteca do stack. Não confie apenas no conhecimento prévio — APIs mudam entre versões.
- Código de negócio deve ser escrito em português para facilitar entendimento por toda a equipe, enquanto código técnico pode ser em inglês para aderir a convenções comuns.
- Funções devem ter a nomenclatura clara e seguir o padrão camelCase, enquanto classes e tipos devem usar PascalCase.
- Funções devem ter early returns para reduzir aninhamento e melhorar legibilidade. Mantenha as funções focadas e com baixa complexidade.
- Utilize o linter (Ultracite) para manter um estilo de código consistente e corrigir problemas comuns.
- Mantenha as funções focadas e com baixa complexidade, utilizando early returns para reduzir aninhamento e melhorar legibilidade.
- Para fazer checagem de lint e tipos, sempre utilize o comando `bun check` que roda ambos em sequência, garantindo que o código esteja limpo e sem erros de tipo antes de ser commitado.
