import { execSync } from "child_process";

const pnpm = "C:\\Program Files\\nodejs\\pnpm.CMD";
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node run-pnpm.js <pnpm args>");
  process.exit(1);
}
const cmd = `"${pnpm}" ${args.map((a) => `"${a.replace(/"/g, '\\"')}"`).join(" ")}`;
console.log(`Running: ${cmd}`);
execSync(cmd, { stdio: "inherit" });
