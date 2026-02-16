import {
  ArrowRightIcon,
  BrowserIcon,
  CubeIcon,
  DatabaseIcon,
  GitBranchIcon,
  GithubLogoIcon,
  GlobeIcon,
  LightningIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: WelcomePage,
});

const layers = [
  {
    icon: CubeIcon,
    title: "Core",
    subtitle: "Lógica de Negócio",
    description:
      "Domínios, contratos e casos de uso — sem dependências externas.",
    color: "text-primary",
  },
  {
    icon: DatabaseIcon,
    title: "Infra",
    subtitle: "Banco & Integrações",
    description: "Drizzle ORM, PostgreSQL, repositórios e serviços externos.",
    color: "text-accent",
  },
  {
    icon: GlobeIcon,
    title: "API",
    subtitle: "oRPC Router",
    description: "Rotas type-safe com validação Zod, RPC e REST via OpenAPI.",
    color: "text-secondary",
  },
  {
    icon: LightningIcon,
    title: "Server",
    subtitle: "Elysia + Bun",
    description: "Servidor HTTP de alta performance com endpoints RPC e REST.",
    color: "text-warning",
  },
  {
    icon: BrowserIcon,
    title: "Web",
    subtitle: "React 19 + TanStack",
    description: "Router file-based, Query com cache, Tailwind CSS e DaisyUI.",
    color: "text-info",
  },
];

const features = [
  {
    icon: GitBranchIcon,
    label: "Arquitetura Limpa",
    detail: "Separação clara de responsabilidades entre camadas",
  },
  {
    icon: ShieldCheckIcon,
    label: "Type-Safe End-to-End",
    detail: "Tipagem do banco de dados até o frontend com oRPC",
  },
  {
    icon: RocketLaunchIcon,
    label: "DX Moderna",
    detail: "Hot reload, file-based routing e code splitting automático",
  },
];

function WelcomePage() {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-16 md:py-24">
        <header className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4">
            <label className="swap swap-rotate text-base-content/40">
              <input className="theme-controller" type="checkbox" value="dark" />
              <CubeIcon className="swap-off h-8 w-8" weight="bold" />
              <CubeIcon className="swap-on h-8 w-8" weight="fill" />
            </label>
            <div className="flex w-full items-center gap-3">
              <div className="h-px flex-1 bg-base-300" />
              <span className="text-base-content/40 text-xs uppercase tracking-[0.3em]">
                Beta Template
              </span>
              <div className="h-px flex-1 bg-base-300" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="font-bold text-4xl text-base-content leading-tight tracking-tight md:text-6xl">
              Beta
              <span className="text-primary"> Template</span>
            </h1>
            <p className="max-w-xl text-base text-base-content/60 leading-relaxed">
              Um template fullstack com arquitetura limpa, tipagem end-to-end e
              ferramentas modernas — pronto para escalar do primeiro commit à
              produção.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link className="btn btn-primary" to="/login">
              Login
              <ArrowRightIcon className="h-4 w-4" weight="bold" />
            </Link>
            <a
              className="btn btn-soft"
              href="https://github.com/lucasprmartins/beta"
              rel="noopener noreferrer"
              target="_blank"
            >
              <GithubLogoIcon className="h-4 w-4" weight="bold" />
              Acessar repositório
            </a>
          </div>
        </header>

        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-base-content/40 text-sm uppercase tracking-[0.2em]">
              Camadas da Arquitetura
            </h2>
            <div className="h-px flex-1 bg-base-300" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {layers.map((layer) => (
              <div className="rounded-xl bg-base-200 p-5" key={layer.title}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <layer.icon
                      className={`h-5 w-5 ${layer.color}`}
                      weight="bold"
                    />
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-bold text-base text-base-content">
                        {layer.title}
                      </h3>
                      <span className="text-base-content/40 text-xs">
                        {layer.subtitle}
                      </span>
                    </div>
                  </div>
                  <p className="text-base-content/60 text-sm leading-relaxed">
                    {layer.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-base-content/40 text-sm uppercase tracking-[0.2em]">
              Por que este template
            </h2>
            <div className="h-px flex-1 bg-base-300" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <div
                className="flex items-start gap-4 rounded-xl bg-base-200 p-5"
                key={feature.label}
              >
                <feature.icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  weight="bold"
                />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-base-content text-sm">
                    {feature.label}
                  </span>
                  <span className="text-base-content/50 text-sm leading-relaxed">
                    {feature.detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
