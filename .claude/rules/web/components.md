---
paths:
  - "apps/web/src/layout/**"
  - "apps/web/src/components/**"
  - "apps/web/src/features/**"
---

# Componentes React

## Estrutura de Arquivo

De cima para baixo:

1. Imports
2. Tipos locais
3. Constantes e helpers
4. Sub-componentes (composição)
5. Componente principal exportado

- Sub-componentes ficam no **mesmo arquivo**, acima do principal
- Variáveis em pt-br: `carregando`, `itens`, `feedback`, `erroListagem`

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
