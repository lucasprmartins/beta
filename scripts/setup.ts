import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import {
  confirm,
  intro,
  log,
  outro,
  select,
  spinner,
  text,
} from "@clack/prompts";
import { $ } from "bun";
import pc from "picocolors";
import { ARQUIVOS_RAILWAY, RAILWAY_TEMPLATE } from "./lib/constants";
import {
  comandoExiste,
  escreverArquivo,
  escreverJson,
  lerJson,
  raizProjeto,
  verificarCancelamento,
} from "./lib/utils";

const root = raizProjeto();
process.chdir(root);

const NOME_REGEX = /^[a-zA-Z0-9._-]+$/;

intro("Setup de Projeto");

// ─── Pré-requisitos ────────────────────────────────────────────────────────────

log.step("Verificando pré-requisitos");

if (!(await comandoExiste("gh"))) {
  log.error(
    "GitHub CLI não está instalado. Instale em: https://cli.github.com"
  );
  process.exit(1);
}
log.success("GitHub CLI instalado");

const ghAuth = await $`gh auth status`.nothrow().quiet();
if (ghAuth.exitCode !== 0) {
  log.error("GitHub CLI não está autenticado. Execute: gh auth login");
  process.exit(1);
}
log.success("GitHub CLI autenticado");

// ─── Coleta de informações ─────────────────────────────────────────────────────

log.step("Informações do projeto");

const nomeProjeto = await text({
  message: "Nome do projeto:",
  placeholder: "meu-projeto",
  validate: (valor) => {
    if (!valor) {
      return "Nome do projeto é obrigatório.";
    }
    if (!NOME_REGEX.test(valor)) {
      return "Nome inválido. Use apenas letras, números, hífens, pontos e underscores.";
    }
  },
});
verificarCancelamento(nomeProjeto);

const usaRailway = await confirm({
  message: "Usar Railway?",
});
verificarCancelamento(usaRailway);

// ─── Dados Railway (condicional) ───────────────────────────────────────────────

let railwayWorkspace = "";

if (usaRailway) {
  if (!(await comandoExiste("railway"))) {
    log.error(
      "Railway CLI não está instalado. Instale em: https://docs.railway.com/guides/cli"
    );
    process.exit(1);
  }
  log.success("Railway CLI instalado");

  const railwayAuth = await $`railway whoami`.nothrow().quiet();
  if (railwayAuth.exitCode !== 0) {
    log.error("Railway CLI não está autenticado. Execute: railway login");
    process.exit(1);
  }
  log.success("Railway CLI autenticado");

  const workspace = await text({
    message: "Nome do workspace:",
    validate: (valor) => {
      if (!valor) {
        return "Nome do workspace é obrigatório.";
      }
    },
  });
  verificarCancelamento(workspace);
  railwayWorkspace = workspace;
}

// ─── Limpeza condicional ───────────────────────────────────────────────────────

if (!usaRailway) {
  log.step("Limpeza");
  for (const arquivo of ARQUIVOS_RAILWAY) {
    const caminho = resolve(root, arquivo);
    if (existsSync(caminho)) {
      unlinkSync(caminho);
    }
  }
  log.success("Scripts Railway e referências removidos");
}

// ─── README.md ─────────────────────────────────────────────────────────────────

await escreverArquivo(
  resolve(root, "README.md"),
  `# ${nomeProjeto}\n\n<!-- Adicione aqui a descrição do seu projeto -->\n`
);
log.success("README.md substituído");

// ─── package.json ──────────────────────────────────────────────────────────────

const pkg = await lerJson<Record<string, unknown>>(
  resolve(root, "package.json")
);
pkg.name = nomeProjeto;
const scripts = pkg.scripts as Record<string, unknown>;
if (!usaRailway) {
  scripts.railway = undefined;
}
await escreverJson(resolve(root, "package.json"), pkg);
log.success("package.json atualizado");

// ─── Git + GitHub ──────────────────────────────────────────────────────────────

log.step("Configurando repositório");

await $`rm -rf .git`.nothrow().quiet();
await $`git init --quiet`;
log.success("Repositório Git inicializado");

const usuario = (await $`gh api user --jq '.login'`.text()).trim();
const orgsRaw = (
  await $`gh api user/orgs --jq '.[].login'`.nothrow().text()
).trim();
const orgs = orgsRaw ? orgsRaw.split("\n").filter(Boolean) : [];

const opcoesOwner = [
  { value: usuario, label: `${usuario} ${pc.dim("(pessoal)")}` },
  ...orgs.map((org) => ({ value: org, label: org })),
];

const owner = await select({
  message: "Selecione o owner do repositório:",
  options: opcoesOwner,
});
verificarCancelamento(owner);

const repoExiste =
  (await $`gh repo view ${owner}/${nomeProjeto}`.nothrow().quiet()).exitCode ===
  0;

if (repoExiste) {
  await $`git remote add origin https://github.com/${owner}/${nomeProjeto}.git`
    .nothrow()
    .quiet();
  log.success(`Repositório ${owner}/${nomeProjeto} já existe, reutilizando`);
} else {
  const sRepo = spinner();
  sRepo.start(`Criando repositório ${owner}/${nomeProjeto}...`);
  await $`gh repo create ${owner}/${nomeProjeto} --private --source=. --remote=origin`.quiet();
  sRepo.stop(`Repositório criado: ${owner}/${nomeProjeto}`);
}

// ─── config.json ───────────────────────────────────────────────────────────────

const config: Record<string, unknown> = { name: nomeProjeto, owner };
if (usaRailway) {
  config.railway = { workspace: railwayWorkspace };
}
await escreverJson(resolve(root, "config.json"), config);
log.success("config.json gerado");

// ─── Deploy Railway (condicional) ──────────────────────────────────────────────

if (usaRailway) {
  log.step("Deploy Railway");

  const statusRailway = await $`railway status`.nothrow().quiet();

  if (statusRailway.exitCode === 0) {
    log.success("Projeto Railway já existe, reutilizando");
  } else {
    const sDeploy = spinner();
    sDeploy.start("Criando projeto Railway...");
    await $`railway init -n ${nomeProjeto} -w ${railwayWorkspace}`.quiet();
    sDeploy.stop("Projeto Railway criado");

    const sTemplate = spinner();
    sTemplate.start("Aplicando template...");
    await $`railway deploy -t ${RAILWAY_TEMPLATE}`.quiet();
    sTemplate.stop("Template aplicado");

    const sWait = spinner();
    sWait.start("Aguardando projeto ficar disponível...");
    await new Promise((r) => setTimeout(r, 10_000));
    sWait.stop("Projeto disponível");
  }

  await $`railway open`.nothrow().quiet();
  log.info("Dashboard aberto no navegador.");

  log.warn("Ação manual necessária no Railway:");
  log.message(
    [
      `Nos serviços ${pc.bold("proxy")}, ${pc.bold("web")} e ${pc.bold("server")}:`,
      "",
      "  1. Settings → Source → Disconnect",
      `  2. Conecte o repo ${pc.bold(`${owner}/${nomeProjeto}`)}`,
      "  3. Settings → Config-as-code → + Add File Path",
      `     ${pc.bold("proxy")}:  /apps/proxy/railway.json`,
      `     ${pc.bold("server")}: /apps/server/railway.json`,
      `     ${pc.bold("web")}:    /apps/web/railway.json`,
      "",
      pc.yellow("Não use Eject — ele cria um novo repositório"),
      pc.yellow(
        "Essa etapa é essencial. Sem ela, o Railway não saberá como buildar e deployar cada serviço."
      ),
    ].join("\n")
  );

  const confirmouRailway = await confirm({
    message:
      "Você já configurou o repositório e o Config File Path nos três serviços?",
  });
  verificarCancelamento(confirmouRailway);

  if (!confirmouRailway) {
    log.error("Configure os serviços no Railway antes de continuar.");
    process.exit(1);
  }

  log.success("Deploy Railway configurado");

  const sTz = spinner();
  sTz.start("Configurando timezone do banco...");
  await $`railway service postgres`.nothrow().quiet();

  const tmpFile = resolve(root, `.tmp-tz-${Date.now()}.ts`);
  await escreverArquivo(
    tmpFile,
    [
      'import postgres from "postgres";',
      "const sql = postgres(process.env.DATABASE_PUBLIC_URL!);",
      `await sql.unsafe("ALTER DATABASE \\"railway\\" SET timezone TO 'America/Sao_Paulo'");`,
      "await sql.end();",
    ].join("\n")
  );

  await $`railway run -- bun ${tmpFile}`.quiet();
  unlinkSync(tmpFile);
  sTz.stop("Timezone configurado: America/Sao_Paulo");
}

// ─── Auto-remoção ──────────────────────────────────────────────────────────────

const setupPath = resolve(root, "scripts/setup.ts");
if (existsSync(setupPath)) {
  unlinkSync(setupPath);
}

const pkgFinal = await lerJson<Record<string, unknown>>(
  resolve(root, "package.json")
);
const scriptsFinal = pkgFinal.scripts as Record<string, unknown>;
scriptsFinal.setup = undefined;
await escreverJson(resolve(root, "package.json"), pkgFinal);
log.success("Script setup removido");

// ─── Commit inicial + push ─────────────────────────────────────────────────────

log.step("Finalizando");

const branch = (await $`git branch --show-current`.text()).trim();
await $`git add .`;
await $`git commit --quiet -m "feat: setup inicial do projeto"`;
await $`git push --quiet -u origin ${branch}`;
log.success(`Commit inicial enviado para origin/${branch}`);

// ─── Resumo final ──────────────────────────────────────────────────────────────

outro(`Projeto ${pc.bold(nomeProjeto)} criado com sucesso!`);

log.message(
  [
    `${pc.dim("Owner:")}    ${owner}`,
    `${pc.dim("Railway:")}  ${usaRailway ? "ativado" : "removido"}`,
  ].join("\n")
);

log.step("Próximos passos");

const passos = usaRailway
  ? [
      `1. ${pc.bold("bun env")}         ${pc.dim("— configurar variáveis de ambiente")}`,
      `2. ${pc.bold("bun db:seed")}     ${pc.dim("— popular banco de dados")}`,
      `3. ${pc.bold("bun cleanup")}     ${pc.dim("— remover exemplos")}`,
    ]
  : [
      `1. ${pc.bold("bun env")}         ${pc.dim("— configurar variáveis de ambiente")}`,
      `2. ${pc.bold("bun cleanup")}     ${pc.dim("— remover exemplos")}`,
    ];

log.message(passos.join("\n"));
