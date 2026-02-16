# Convenção de Commits

Use **Conventional Commits** em **pt-br**:

```
tipo(escopo): descrição
```

## Tipos

- `feat` - Nova funcionalidade
- `fix` - Correção de bug
- `refactor` - Refatoração sem mudança de comportamento
- `style` - Formatação
- `docs` - Documentação
- `test` - Testes
- `chore` - Manutenção (deps, configs, CI)
- `perf` - Performance

## Escopos

`core`, `infra`, `api`, `auth`, `web`, `server`, `ci`

## Boas Práticas

- Descrição curta (máx. 72 caracteres)
- Use imperativo: "adiciona", "corrige", "remove"
- Escopo opcional, mas recomendado

## Exemplos

```
feat(api): adiciona endpoint de listagem de usuários
fix(web): corrige redirecionamento após login
chore(ci): atualiza versão do Bun no workflow
```
