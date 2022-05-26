const { spawnSync } = require("child_process");
const path = require("path");
const findVenv = require("./findVenv");

const venv = findVenv();
const args = process.argv.slice(2);
spawnSync(path.join(venv, "bin", "python"), args, { stdio: "inherit" });
