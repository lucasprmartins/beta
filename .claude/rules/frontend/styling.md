---
paths:
  - "apps/web/src/**/*.css"
  - "apps/web/src/components/**"
  - "apps/web/src/features/**"
---

# Styling (Tailwind + DaisyUI + Phosphor)

## DaisyUI

Prefira componentes DaisyUI para consistência:

- **Botões**: `btn`, `btn-primary`, `btn-outline`, `btn-ghost`
- **Cards**: `card`, `card-body`, `card-title`, `card-actions`, `card-border`
- **Inputs**: `input`, `input-bordered`
- **Modais**: `modal`, `modal-box`, `modal-action`
- **Alerts**: `alert`, `alert-info`, `alert-success`, `alert-error`
- **Loading**: `loading`, `loading-spinner`
- **Skeleton**: `skeleton`
- **Fieldset**: `fieldset`, `fieldset-label`

## Boas Práticas

- Use classes semânticas (`btn-primary`) em vez de cores diretas
- Use `bg-base-100`, `bg-base-200` para fundos que respeitam o tema
- Use `text-base-content` para texto que adapta ao tema
- **Não use shadow** para destacar, opte por bordas (`card-border`)

## Padrão: Toast/Feedback

```typescript
function AlertaFeedback({
  tipo,
  mensagem,
  onFechar,
}: {
  tipo: "success" | "error" | "info";
  mensagem: string;
  onFechar: () => void;
}) {
  const alertClass = {
    success: "alert-success",
    error: "alert-error",
    info: "alert-info",
  }[tipo];

  const IconComponent = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InfoIcon,
  }[tipo];

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-auto max-w-md -translate-x-1/2">
      <div className={`alert ${alertClass} animate-[fadeIn_0.3s_ease-out]`}>
        <IconComponent className="h-5 w-5 shrink-0" />
        <span className="flex-1">{mensagem}</span>
        <button className="btn btn-circle btn-ghost btn-sm" onClick={onFechar} type="button">
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
```

## Padrão: Skeleton

```typescript
function CardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="animate-[fadeIn_0.4s_ease-out_both]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="card card-border bg-base-100">
        <div className="card-body gap-4">
          <div className="skeleton h-6 w-28" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
```

## Padrão: Estado Vazio

```typescript
function ListagemVazia() {
  return (
    <div className="card card-border bg-base-100">
      <div className="card-body items-center py-16 text-center">
        <div className="mb-4 rounded-full bg-base-200 p-6">
          <MagnifyingGlassIcon className="h-12 w-12 opacity-30" />
        </div>
        <h3 className="card-title">Nenhum item encontrado</h3>
        <p className="max-w-sm opacity-60">Descrição orientando o usuário.</p>
      </div>
    </div>
  );
}
```

## Padrão: Formulário

```typescript
function Formulario({ onSubmit, enviando }: { onSubmit: (dados: T) => void; enviando: boolean }) {
  const [campo, setCampo] = useState("");

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    e.preventDefault();
    if (campo.trim()) onSubmit({ campo: campo.trim() });
  }

  return (
    <form onSubmit={handleSubmit}>
      <fieldset className="fieldset">
        <label className="fieldset-label">Nome do campo</label>
        <label className="input input-bordered w-full">
          <input
            onChange={(e) => setCampo(e.target.value)}
            placeholder="Placeholder"
            required
            type="text"
            value={campo}
          />
        </label>
        <button className="btn btn-primary btn-block mt-4" disabled={enviando || !campo.trim()} type="submit">
          {enviando ? <span className="loading loading-spinner loading-sm" /> : "Salvar"}
        </button>
      </fieldset>
    </form>
  );
}
```

## Padrão: Grid Responsivo

```typescript
<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {itens.map((item, index) => <Card key={item.id} item={item} index={index} />)}
</div>
```

## Phosphor Icons

Todos com sufixo `Icon`, importados de `@phosphor-icons/react`.

### Pesos

- `regular` - Padrão (informativos)
- `bold` - Ações (botões, stats)
- `fill` - Preenchido

### Ícones Comuns

- **Ações**: `PlusIcon`, `TrashIcon`, `PencilSimpleIcon`, `CheckIcon`
- **Status**: `CheckCircleIcon`, `XCircleIcon`, `InfoIcon`, `WarningIcon`
- **UI**: `XIcon`, `ListIcon`, `MagnifyingGlassIcon`, `GearIcon`

## Sidebar

Ao adicionar novo domínio ao sidebar (`src/components/sidebar.tsx`):

```typescript
import { NovoIcon } from "@phosphor-icons/react";

const menuItems: MenuItem[] = [
  { label: "Home", icon: HouseIcon, to: "/" },
  // ...
  { label: "{Dominio}", icon: NovoIcon, to: "/{dominio}" },
];
```

- `to` sem prefixo `_auth` (TanStack Router resolve)
- `label` em PascalCase ou nome amigável
