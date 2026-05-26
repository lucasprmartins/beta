import { rm, unlink } from "node:fs/promises";
import { resolve } from "node:path";

import {
  cancel,
  confirm,
  intro,
  isCancel,
  log,
  outro,
  spinner,
} from "@clack/prompts";
import pc from "picocolors";

import { projectRoot, replaceInFile } from "./lib/utils";

const root = projectRoot();

const IMPORT_TASK_ROUTER_RE =
  /import \{ taskRouter \} from "@\/routes\/task";\n/;
const ROUTER_TASK_EXPORT_RE =
  /export const router = \{\s*task:\s*taskRouter\s*\};/;
const CLEANUP_SCRIPT_RE = /\s*"cleanup":\s*"tsx scripts\/cleanup\.ts",?\n?/;
const PKG_TRAILING_COMMA_RE = /,(\s*\})/;

const NAV_IMPORT_TASK_ICON_RE =
  /CheckSquareOffsetIcon,\s*|,\s*CheckSquareOffsetIcon/;
const NAV_TASK_MENU_ITEM_RE =
  /,?\s*\{ label: "Tarefas", icon: CheckSquareOffsetIcon, to: "\/tasks" \}/;

const TASK_FILES = [
  "apps/server/src/domain/entities/Task.ts",
  "apps/server/src/domain/entities/Task.test.ts",
  "apps/server/src/domain/contracts/Task.ts",
  "apps/server/src/domain/application/Task.ts",
  "apps/server/src/domain/application/Task.test.ts",
  "apps/server/src/db/schema/task.ts",
  "apps/server/src/db/repositories/task.ts",
  "apps/server/src/routes/task.ts",
  "apps/client/src/routes/_auth/tasks.tsx",
];

const TASK_DIRS = ["apps/client/src/features/Task"];

async function safeUnlink(path: string) {
  try {
    await unlink(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

export async function cleanupTaskExamples(
  options: { removeSelf?: boolean; removeScriptEntry?: boolean } = {}
) {
  const { removeSelf = true, removeScriptEntry = true } = options;

  await Promise.all([
    ...TASK_FILES.map((file) => safeUnlink(resolve(root, file))),
    ...TASK_DIRS.map((dir) =>
      rm(resolve(root, dir), { recursive: true, force: true })
    ),
  ]);

  await Promise.all([
    replaceInFile(resolve(root, "apps/server/src/routes/lib/router.ts"), [
      { from: IMPORT_TASK_ROUTER_RE, to: "" },
      { from: ROUTER_TASK_EXPORT_RE, to: "export const router = {};" },
    ]),
    replaceInFile(resolve(root, "apps/client/src/routes/-navigation.ts"), [
      { from: NAV_IMPORT_TASK_ICON_RE, to: "" },
      { from: NAV_TASK_MENU_ITEM_RE, to: "" },
    ]),
  ]);

  if (removeScriptEntry) {
    await replaceInFile(resolve(root, "package.json"), [
      { from: CLEANUP_SCRIPT_RE, to: "\n" },
      { from: PKG_TRAILING_COMMA_RE, to: "$1" },
    ]);
  }

  if (removeSelf) {
    await safeUnlink(resolve(root, "scripts/cleanup.ts"));
  }
}

async function main() {
  intro(pc.bgCyan(pc.black(" Cleanup dos Exemplos ")));

  log.info(
    `Este script vai remover os arquivos de exemplo do domínio ${pc.cyan("Task")} e suas referências.`
  );

  const shouldContinue = await confirm({
    message: "Deseja apagar todos os arquivos de exemplo do domínio Task?",
  });

  if (isCancel(shouldContinue) || !shouldContinue) {
    cancel("Cleanup cancelado.");
    process.exit(0);
  }

  const s = spinner();
  s.start("Removendo arquivos de exemplo e referências...");
  await cleanupTaskExamples();
  s.stop("Cleanup concluído.");

  outro(
    pc.green("Cleanup concluído! Os exemplos foram removidos com sucesso.")
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
