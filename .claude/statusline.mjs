import { execSync } from "node:child_process";

let input = "";
for await (const chunk of process.stdin) {
  input += chunk;
}

const data = JSON.parse(input || "{}");

// Git info
let branch = "no-git";
try {
  branch = execSync("git branch --show-current", { encoding: "utf-8" }).trim();
} catch (_) {
  // git não disponível
}

// Model
const model = data?.model?.display_name || "Claude";

// Context usage
let ctx = "";
const pct = data?.context_window?.used_percentage;
if (pct != null) {
  const total = 10;
  const filled = Math.round((pct / 100) * total);
  const empty = total - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  ctx = `  ⋮  ${bar} ${Math.round(pct)}%`;
}

// Current dir
let dir = "";
const cwd = data?.workspace?.current_dir || data?.cwd;
if (cwd) {
  const base = cwd.replace(/\\/g, "/").split("/").pop();
  dir = `  ⋮  ◇  ${base}`;
}

process.stdout.write(`◉  ${branch}  ⋮  ♦  ${model}${ctx}${dir}`);
