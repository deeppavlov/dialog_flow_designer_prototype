import { exec as execCb } from "child_process";
import fsExtra from "fs-extra";
import path from "path";
import { promisify } from "util";
import { ensureInstalled, ensureRoot, hasBin, abort } from "./utils.mjs";
const { copySync, moveSync, readdirSync } = fsExtra;
const exec = promisify(execCb);

const pgks = path.resolve("packages");
const editorDir = path.join(pgks, "editor");
const extDir = path.join(pgks, "extension");

// 0. Check the environment
ensureRoot();
ensureInstalled();

// TODO: If the Python server is implmented, make sure to add the build code here

// 1. Build the editor sources
console.log("Building the editor sources");
await exec("npm run build", { cwd: editorDir });

// 2. Build the extension sources
console.log("Building the extension sources");
await exec("npm run build", { cwd: extDir });

// 3. Copy compiled editor to the extension folder
console.log("Copying files");
const editorTarget = path.join(extDir, "dist", "editor");
copySync(path.join(editorDir, "dist", "assets"), editorTarget);

// 4. Rename index.*.{js,css} to just index.js/css
readdirSync(editorTarget, { withFileTypes: true })
  .filter((ent) => ent.isFile())
  .map((ent) => ent.name)
  .forEach((name) => {
    console.log("Renaming", name);
    const newName = name.split(".")[0] + "." + name.split(".")[2];
    moveSync(path.join(editorTarget, name), path.join(editorTarget, newName));
  });

// // 5. Build VSIX file
if (!hasBin("vsce"))
  abort(`You need to have vsce installed globally! To install it, run
$ pnpm install -g vsce`);
console.log("Packaging extension");
await exec(`vsce package --no-dependencies -o "${process.cwd()}"`, { cwd: extDir });

console.log(`Done! VSIX file written to ${process.cwd()}`);
