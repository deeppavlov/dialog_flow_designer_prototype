const nodemon = require("nodemon");

nodemon({
  script: "server.py",
  exec: "vpy",
}).on("restart", () => console.error("Python restared"));
