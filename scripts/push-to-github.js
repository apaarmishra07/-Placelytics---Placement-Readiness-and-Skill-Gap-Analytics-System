import { execSync } from "child_process";

const projectRoot = "d:\\Minor project\\Focus-AI\\Focus-AI";
const githubUrl =
  "https://github.com/apaarmishra07/-Placelytics---Placement-Readiness-and-Skill-Gap-Analytics-System.git";

const commands = [
  `git -C "${projectRoot}" remote remove origin 2>nul || true`,
  `git -C "${projectRoot}" remote add origin ${githubUrl}`,
  `git -C "${projectRoot}" add .`,
  `git -C "${projectRoot}" commit -m "Update project: Placelytics README, fix Vite configs, API server, and database setup"`,
  `git -C "${projectRoot}" push -u origin main`,
];

commands.forEach((cmd) => {
  try {
    console.log(`Running: ${cmd}`);
    execSync(cmd, { stdio: "inherit", shell: "cmd.exe" });
    console.log("✓ Done\n");
  } catch (e) {
    console.error(`✗ Error: ${e.message}\n`);
  }
});
