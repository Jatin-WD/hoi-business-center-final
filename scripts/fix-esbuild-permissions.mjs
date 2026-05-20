import { chmod, access, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

async function findMatchingDirs(baseDir, matcher) {
  try {
    const entries = await readdir(baseDir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory() && matcher(entry.name)).map((entry) => join(baseDir, entry.name));
  } catch {
    return [];
  }
}

const pnpmDirs = await findMatchingDirs(join(process.cwd(), "node_modules/.pnpm"), (name) => name.startsWith("esbuild@") || name.startsWith("@esbuild+linux-x64@"));
const candidates = [
  "node_modules/esbuild/bin/esbuild",
  "node_modules/@esbuild/linux-x64/bin/esbuild",
  ...pnpmDirs.map((dir) => dir.includes("@esbuild+linux-x64@")
    ? join(dir, "node_modules/@esbuild/linux-x64/bin/esbuild")
    : join(dir, "node_modules/esbuild/bin/esbuild")),
];

let fixed = 0;

for (const candidate of new Set(candidates)) {
  const path = candidate.startsWith(process.cwd()) ? candidate : join(process.cwd(), candidate);
  try {
    await access(path, constants.F_OK);
    await chmod(path, 0o755);
    fixed += 1;
  } catch {
    // Some package-manager layouts do not contain every candidate.
  }
}

console.log(`Checked esbuild execute permissions (${fixed} file${fixed === 1 ? "" : "s"} updated).`);
