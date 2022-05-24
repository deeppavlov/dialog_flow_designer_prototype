const path = require("path");
const fs = require("fs");

module.exports = function () {
  const cwd = path.join(process.cwd(), "venv");
  if (fs.existsSync(cwd)) return cwd;
  const root = path.resolve("..", "..", "venv");
  if (fs.existsSync(root)) return root;

  console.error("Venv not found from ${cwd}!");
  process.exit(1);
};
