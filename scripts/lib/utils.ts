import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export function run(
  command: string,
  args: string[] = [],
  options: { quiet?: boolean } = {}
): Promise<RunResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot(),
      shell: false,
      stdio: options.quiet ? ["ignore", "pipe", "pipe"] : "inherit",
    });

    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];

    if (child.stdout) {
      child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    }

    if (child.stderr) {
      child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    }

    child.on("error", reject);
    child.on("close", (code) => {
      resolvePromise({
        exitCode: code ?? 1,
        stdout: Buffer.concat(stdout).toString("utf-8"),
        stderr: Buffer.concat(stderr).toString("utf-8"),
      });
    });
  });
}

export async function runChecked(
  command: string,
  args: string[] = [],
  options: { quiet?: boolean } = {}
): Promise<RunResult> {
  const result = await run(command, args, options);
  if (result.exitCode !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} falhou com código ${result.exitCode}`
    );
  }
  return result;
}

export async function commandExists(command: string): Promise<boolean> {
  const { exitCode } = await run("sh", ["-c", `command -v ${command}`], {
    quiet: true,
  });
  return exitCode === 0;
}

export function readTextFile(path: string): Promise<string> {
  return readFile(path, "utf-8");
}

export async function writeTextFile(
  path: string,
  content: string
): Promise<void> {
  await writeFile(path, content);
}

export function readJsonFile<T = unknown>(path: string): Promise<T> {
  return readFile(path, "utf-8").then((content) => JSON.parse(content) as T);
}

export async function writeJsonFile(
  path: string,
  data: unknown
): Promise<void> {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`);
}

export async function replaceInFile(
  path: string,
  replacements: Array<{ from: string | RegExp; to: string }>
): Promise<void> {
  let content = await readTextFile(path);
  for (const { from, to } of replacements) {
    if (typeof from === "string") {
      content = content.replaceAll(from, to);
    } else {
      content = content.replace(from, to);
    }
  }
  await writeTextFile(path, content);
}

export async function gitCommitIfChanged(message: string): Promise<boolean> {
  await runChecked("git", ["add", "-A"], { quiet: true });
  const { exitCode } = await run("git", ["diff", "--cached", "--quiet"], {
    quiet: true,
  });

  if (exitCode === 0) {
    return false;
  }

  await runChecked("git", ["commit", "-m", message], { quiet: true });
  return true;
}

export function projectRoot(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return resolve(currentDir, "../..");
}
