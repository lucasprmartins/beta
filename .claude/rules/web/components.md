---
paths:
  - "apps/web/src/layout/**"
  - "apps/web/src/components/**"
  - "apps/web/src/features/**"
---

# Componentes React

## Estrutura de Pastas

| Pasta | Responsabilidade |
|-------|-----------------|
| `src/features/` | Páginas e domínios — componentes de página, lógica, sub-componentes |
| `src/components/` | Componentes compartilhados reutilizáveis |
| `src/layout/` | Estrutura visual da aplicação (sidebar, header) |

## Estrutura de Arquivo

De cima para baixo:

| # | Seção | O que vai aqui |
|---|-------|---------------|
| 1 | Imports | Externos primeiro, depois internos (`@/...`), separados por linha em branco |
| 2 | Tipos | `interface` e `type` usados pelo(s) componente(s) do arquivo |
| 3 | Constantes e helpers | Valores estáticos, mapas de lookup, funções puras auxiliares |
| 4 | Hooks (queries e mutations) | `queryOptions`, custom hooks com `useQuery`/`useMutation` |
| 5 | Sub-componentes | Componentes internos (não exportados) usados por composição |
| 6 | Componente principal | O componente exportado — sempre por último |

## useEffect — Evite ao Máximo

Antes de usar `useEffect`, considere a alternativa correta:

| Situação | Em vez de useEffect | Use |
|----------|-------------------|-----|
| Buscar dados | `useEffect` + fetch | TanStack Query (`useQuery`, `useInfiniteQuery`) |
| Estado derivado | `useEffect` + setState | Calcule durante o render ou `useMemo` |
| Responder a evento | `useEffect` observando estado | Lógica direto no event handler |
| Sincronizar estado com prop | `useEffect` + setState | Derive da prop, ou use `key` para resetar |
| Ação no mount | `useEffect(fn, [])` | `loader` do TanStack Router ou `useQuery` |

`useEffect` é aceitável apenas para: assinaturas externas (WebSocket, resize), integração com libs não-React, e timers.

## React 19

- **Não use `FormEvent`** — use `React.SyntheticEvent<HTMLFormElement, SubmitEvent>`
- Prefira `useTransition` para atualizações não-urgentes

## Renderização Condicional — Prefira `<Activity>`

Em vez de renderização condicional com `&&` que **desmonta** o componente e perde estado, use `<Activity>` para **preservar** estado e DOM:

```tsx
// Evite — desmonta e perde estado
{isVisible && <Sidebar />}

// Prefira — preserva estado quando oculto
<Activity mode={isVisible ? 'visible' : 'hidden'}>
  <Sidebar />
</Activity>
```

- `mode="visible"` — renderiza normalmente
- `mode="hidden"` — mantém montado mas oculto, preserva estado interno
- Use para: tabs, sidebars, modais, navegação que o usuário retorna

## Formulários

- Use `React.SyntheticEvent` no `onSubmit`
- Estado local com `useState` para campos controlados
- Validação no submit, não em cada onChange
- Botão de submit desabilitado quando `enviando` ou campos vazios
