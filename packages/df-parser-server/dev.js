const nodemon = require("nodemon");

nodemon({
  script: "server.py",
  exec: "vpy",
});
