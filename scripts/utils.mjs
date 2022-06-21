import { delimiter, join } from "path";
import { existsSync, readFileSync } from "fs";
import { exec as execCb } from "child_process";
import { createInterface } from "readline";
import { promisify } from "util";
const exec = promisify(execCb);

export const abort = (reason) => {
  if (reason) console.error(reason);
  process.exit(1);
};

export const hasBin = (bin) => {
  const envPath = process.env.PATH || "";
  const envExt = process.env.PATHEXT || "";
  return envPath
    .replace(/["]+/g, "")
    .split(delimiter)
    .map((chunk) => envExt.split(delimiter).map((ext) => join(chunk, bin + ext)))
    .reduce((a, b) => a.concat(b))
    .some((fp) => existsSync(fp));
};

export const whichPM = () => {
  const userAgent = process.env.npm_config_user_agent;
  if (!userAgent) return undefined;
  const pmSpec = userAgent.split(" ")[0];
  const separatorPos = pmSpec.lastIndexOf("/");
  const name = pmSpec.substring(0, separatorPos);
  return {
    name: name === "npminstall" ? "cnpm" : name,
    version: pmSpec.substring(separatorPos + 1),
  };
};

export const ask = (question, defaultAnswer = "") =>
  new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      resolve(answer === "" ? defaultAnswer : answer);
      rl.close();
    });
    rl.on("close", () => resolve(defaultAnswer));
  });

export const ensureRoot = () => {
  const inRoot =
    existsSync("package.json") &&
    JSON.parse(readFileSync("package.json")).name === "dialog-flow-designer";
  if (!inRoot)
    abort(`All scripts must be run from the repository root.
You should always use "[p]npm run" to run these scripts.`);
};

export const ensurePNPM = async () => {
  const pm = whichPM();
  if (!pm || pm.name !== "pnpm") {
    const hasCP = hasBin("corepack");
    if (hasCP) {
      const ans = await ask(
        `You are not using PNPM, but you seem to have corepack (https://github.com/nodejs/corepack) installed.
You can run "corepack enable" to make sure always the correct package manager is used for node projects.
Would you like to run corepack enable? [Y/n] `,
        "y"
      );
      if (ans.toLowerCase().startsWith("y")) {
        try {
          const { stdout } = await exec("corepack enable");
          console.log(stdout + "\n");
          console.log("Corepack all setup. Now you can keep using npm or yarn like usual.");
        } catch {
          console.error("Corepack failed. Check the logs for details.");
        }
      }
      abort();
    } else
      abort(`
You are not using PNPM to install this project. Please ensure you **always** use PNPM, otherwise things will break.
Install PNPM: https://pnpm.io
`);
  }
};

export const checkIfInstalled = () => {
  return existsSync("node_modules"); // && existsSync("venv");
};

export const ensureInstalled = () => {
  if (!checkIfInstalled()) abort(`You have to install the project first. Run "pnpm i"`);
};

export const createVenv = async () => {
  if (!existsSync("venv")) {
    console.log("Creating venv");
    try {
      await exec("python -m venv venv");
    } catch (e) {
      abort(`Python venv creating failed. Error:\n${e.stderr}`);
    }
  }
};
