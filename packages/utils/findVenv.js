const path = require("path");
const fs = require("fs");

/**
 * Find a venv recursively traversing upwards
 * @param {string} curPath
 */
function travelUp(curPath) {
  let newPath = curPath;
  do {
    curPath = newPath;
    newPath = path.resolve(curPath, "..");
    const venvPath = path.join(newPath, "venv");
    const isVenv = fs.existsSync(venvPath);
    if (isVenv) return venvPath;
  } while (newPath !== curPath);
  return false;
}

module.exports = function () {
  // Try from cwd
  const inCwd = travelUp(process.cwd());
  if (inCwd) return inCwd;
  // Try from __dirname
  const inDir = travelUp(__dirname);
  if (inDir) return inDir;

  throw new Error(`Venv not found from ${process.cwd()} nor from ${__dirname}!`);
};
