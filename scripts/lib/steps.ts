import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";

import { cleanupTaskExamples } from "../cleanup";
import { createEnvFiles, generateAuthSecret, readAuthSecret } from "../env";
import type { SetupState } from "./state";
import {
  gitCommitIfChanged,
  projectRoot,
  readJsonFile,
  run,
  runChecked,
  writeJsonFile,
  writeTextFile,
} from "./utils";

const ROOT = projectRoot();

export async function stepRename(state: SetupState): Promise<void> {
  const pkgPath = resolve(ROOT, "package.json");
  const pkg = await readJsonFile<Record<string, unknown>>(pkgPath);
  pkg.name = state.inputs.projectName;
  await writeJsonFile(pkgPath, pkg);
}

export async function stepReadme(state: SetupState): Promise<void> {
  const readmePath = resolve(ROOT, "README.md");
  await writeTextFile(
    readmePath,
    `# ${state.inputs.projectName}\n\nDescreva seu projeto aqui.\n`
  );
}

export async function stepCleanup(state: SetupState): Promise<void> {
  if (state.inputs.keepExamples) {
    return;
  }
  await cleanupTaskExamples();
}

export async function stepGitInit(_state: SetupState): Promise<void> {
  const gitPath = resolve(ROOT, ".git");
  const { exitCode } = await run("git", ["remote", "get-url", "origin"], {
    quiet: true,
  });
  const isTemplateGit = existsSync(gitPath) && exitCode === 0;

  if (isTemplateGit) {
    await rm(gitPath, { recursive: true, force: true });
  }

  if (!existsSync(gitPath)) {
    await runChecked("git", ["init"], { quiet: true });
  }
}

export async function stepEnvFiles(_state: SetupState): Promise<void> {
  await createEnvFiles();
}

export async function stepAuthSecret(_state: SetupState): Promise<void> {
  const current = await readAuthSecret();
  if (current.length < 32) {
    await generateAuthSecret();
  }
}

export async function stepDockerUp(_state: SetupState): Promise<void> {
  await runChecked("docker", ["compose", "up", "-d", "--wait", "postgres"], {
    quiet: true,
  });
}

export async function stepDbMigrate(_state: SetupState): Promise<void> {
  await runChecked("pnpm", ["db:migrate"], { quiet: true });
}

export async function stepGhRepo(state: SetupState): Promise<void> {
  const fullName = `${state.inputs.owner}/${state.inputs.projectName}`;
  const { exitCode } = await run("gh", ["repo", "view", fullName], {
    quiet: true,
  });
  if (exitCode === 0) {
    return;
  }

  const flag = state.inputs.visibility === "private" ? "--private" : "--public";
  await runChecked("gh", ["repo", "create", fullName, flag, "--clone=false"], {
    quiet: true,
  });
}

export async function stepRemote(state: SetupState): Promise<void> {
  const fullName = `${state.inputs.owner}/${state.inputs.projectName}`;
  const { stdout } = await runChecked(
    "gh",
    ["repo", "view", fullName, "--json", "url", "--jq", ".url"],
    { quiet: true }
  );
  const repoUrl = stdout.trim();

  const { exitCode } = await run("git", ["remote", "get-url", "origin"], {
    quiet: true,
  });
  if (exitCode === 0) {
    await runChecked("git", ["remote", "set-url", "origin", repoUrl], {
      quiet: true,
    });
  } else {
    await runChecked("git", ["remote", "add", "origin", repoUrl], {
      quiet: true,
    });
  }
}

export async function stepCommit(_state: SetupState): Promise<void> {
  await gitCommitIfChanged("initial commit");
}

export async function stepPush(_state: SetupState): Promise<void> {
  await runChecked("git", ["branch", "-M", "main"], { quiet: true });
  await runChecked("git", ["push", "-u", "origin", "main"], { quiet: true });
}

export async function stepSelfClean(_state: SetupState): Promise<void> {
  const pkgPath = resolve(ROOT, "package.json");

  const pkg = await readJsonFile<Record<string, unknown>>(pkgPath);
  const scripts = pkg.scripts as Record<string, string> | undefined;
  if (scripts?.setup) {
    pkg.scripts = Object.fromEntries(
      Object.entries(scripts).filter(([key]) => key !== "setup")
    );
    await writeJsonFile(pkgPath, pkg);
  }

  await Promise.all(
    [
      "scripts/setup.ts",
      "scripts/lib/preflight.ts",
      "scripts/lib/state.ts",
      "scripts/lib/steps.ts",
    ].map((path) => rm(resolve(ROOT, path), { force: true }))
  );
}
