import {
  BookOpenIcon,
  RocketLaunchIcon,
  TerminalIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardPage,
});

const proximosPassos = [
  {
    icon: TerminalIcon,
    titulo: "Prepare o banco",
    descricao:
      "Rode bun db:seed para popular com dados fake e bun db:studio para visualizar as tabelas no Drizzle Studio.",
  },
  {
    icon: BookOpenIcon,
    titulo: "Explore os exemplos",
    descricao:
      "Categoria (CRUD Simples) e Produto (Domínio Rico) demonstram os dois padrões. Siga o fluxo: contracts → application → schema → repository → router.",
  },
  {
    icon: RocketLaunchIcon,
    titulo: "Crie seu domínio",
    descricao:
      "Descreva o que precisa para a IA — ela conhece os padrões do projeto e cria todo o fluxo de ponta a ponta. Quando não precisar mais dos exemplos, rode bun cleanup.",
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
            Seu ambiente está configurado. Siga os passos abaixo para começar.
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
