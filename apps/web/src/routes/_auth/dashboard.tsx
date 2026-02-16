import {
  CodeIcon,
  FolderOpenIcon,
  RocketLaunchIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardPage,
});

const proximosPassos = [
  {
    icon: FolderOpenIcon,
    titulo: "Explore a estrutura",
    descricao:
      "Navegue pelos pacotes: core (domínio), infra (banco), api (rotas) e auth (autenticação).",
  },
  {
    icon: CodeIcon,
    titulo: "Crie seu primeiro domínio",
    descricao:
      "Adicione entidades no core, repositórios na infra e exponha via api com oRPC.",
  },
  {
    icon: RocketLaunchIcon,
    titulo: "Conecte ao frontend",
    descricao:
      "Use o client oRPC em src/lib/orpc.ts para consumir suas APIs com tipagem end-to-end.",
  },
];

function DashboardPage() {
  return (
    <div className="bg-base-100">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <header className="mb-12 text-center">
          <h1 className="mb-3 font-bold text-3xl text-base-content tracking-tight">
            <span className="text-primary">Bem-vindo!</span>
          </h1>
          <p className="text-base-content/60">
            Seu ambiente está configurado e pronto para desenvolvimento.
          </p>
        </header>

        <section>
          <h2 className="mb-6 font-semibold text-base-content/40 text-sm uppercase tracking-[0.15em]">
            Próximos passos
          </h2>

          <div className="flex flex-col gap-4">
            {proximosPassos.map((passo, index) => (
              <div
                className="flex items-start gap-4 rounded-xl bg-base-200 p-5"
                key={passo.titulo}
              >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-sm">
                    {index + 1}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <passo.icon
                        className="h-4 w-4 text-primary"
                        weight="bold"
                      />
                      <span className="font-semibold text-base-content">
                        {passo.titulo}
                      </span>
                    </div>
                    <p className="text-base-content/60 text-sm leading-relaxed">
                      {passo.descricao}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
