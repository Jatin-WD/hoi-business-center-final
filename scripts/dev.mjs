import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";
const children = [];

function run(name, command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: isWindows,
    ...options,
  });
  children.push(child);
  child.on("exit", (code, signal) => {
    if (signal) return;
    if (code && !options.optional) {
      console.error(`${name} exited with code ${code}`);
      shutdown(code);
    }
  });
  return child;
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

run("backend", npmCmd, ["start"]);
run("frontend", npmCmd, ["run", "dev:frontend", "--", "--host", "0.0.0.0"]);
