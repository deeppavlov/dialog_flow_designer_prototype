import { delimiter, join } from "path";
import { existsSync, readFileSync } from "fs";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { ensurePNPM, ensureRoot } from "./utils.mjs";
import { abort } from "process";
const exec = promisify(execCb);

// Check CWD
ensureRoot();

// Check Node
const [nodeMajor, nodeMinor] = process.version
  .slice(1)
  .split(".")
  .map((s) => parseInt(s));

if (nodeMajor < 14 || (nodeMajor === 14 && nodeMinor < 8)) {
  abort(`
Your installed Node version (${process.version}) is lower than the required (v14.8.0).
If you are on a *nix system, install nvm (https://github.com/nvm-sh/nvm), and run
\n$ nvm use 16
`);
}

// Check Python
try {
  const { stdout } = await exec("python --version");
  const [pyMajor, pyMinor] = stdout
    .split(" ")[1]
    .split(".")
    .map((s) => parseInt(s));

  if (pyMajor !== 3 || pyMinor < 7) {
    abort(
      `Your installed Python version (${pyMajor}.${pyMinor}) is lower than the required (3.7).
Try installing pyenv (https://github.com/pyenv/pyenv), and run
\n$ pyenv install 3.10.4
`
    );
  }
} catch {
  abort("Python was not found on your system. Install it from https://www.python.org/downloads/");
}

// Check PNPM
await ensurePNPM();

// Setup python venv
if (!existsSync("venv")) {
  try {
    await exec("python -m venv venv");
  } catch (e) {
    abort(`Python venv creating failed. Error:\n${e.stderr}`);
  }
}

// Install python dependencies
