import { execSync } from "child_process";

const pnpm = "C:\\Program Files\\nodejs\\pnpm.CMD";
const projectRoot = "d:\\Minor project\\Focus-AI\\Focus-AI";
const cmd = `"${pnpm}" -C "${projectRoot}" run build`;

console.log(`Running: ${cmd}`);
execSync(cmd, { stdio: "inherit" });
