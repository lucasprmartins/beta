---
paths:
  - "apps/web/src/**/*.css"
  - "apps/web/src/components/**"
  - "apps/web/src/features/**"
---

# Styling (Tailwind + DaisyUI)

## Regras

- **Prefira componentes DaisyUI** para consistência (`btn`, `card`, `input`, `alert`, `modal`, `skeleton`, `fieldset`)
- Classes semânticas (`btn-primary`) em vez de cores diretas (`bg-blue-500`)
- Fundos: `bg-base-100`, `bg-base-200` (respeitam o tema)
- Texto: `text-base-content` (adapta ao tema)
- **Sem shadow** para destacar — use bordas (`card-border`)
- Grid responsivo: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

## Loading States

- Skeleton: classe `skeleton` do DaisyUI com dimensões (`h-6 w-28`)
- Spinner em botões: `<span className="loading loading-spinner loading-sm" />`
- Stagger animation: `animationDelay` incremental por index

## Phosphor Icons

Importar de `@phosphor-icons/react`, todos com sufixo `Icon`.

| Peso | Uso |
|------|-----|
| `regular` | Padrão (informativos) |
| `bold` | Ações (botões, stats) |
| `fill` | Preenchido (estados ativos) |

## Navegação

Ao adicionar uma nova rota, incluir em `src/lib/navigation.ts`:

- Adicionar item a `menuItems` com `label`, `icon`, `to`
- `to` sem prefixo `_auth` (TanStack Router resolve)