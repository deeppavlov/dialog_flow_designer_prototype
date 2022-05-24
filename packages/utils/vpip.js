const { spawnSync } = require("child_process");
const path = require("path");
const findVenv = require("./findVenv");

const venv = findVenv();
const args = process.argv.slice(2);
console.log("Using venv", venv);
spawnSync(path.join(findVenv(), "bin", "pip"), args, { stdio: "inherit" });
