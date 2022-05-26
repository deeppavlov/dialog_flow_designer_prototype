import { buildSync as esbuild } from "esbuild";
import rimraf from "rimraf";
import { BuildOptions } from "./options.mjs";

/** @type { import("esbuild").BuildOptions } */
const prodOptions = {
  minify: true,
  sourcemap: false,
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.VITE_SERVER": "null",
  },
};

// Clean-up
rimraf.sync("dist");

// Build src/extension.ts
// TODO: remove all hot reloading code in prodcution
esbuild({ ...BuildOptions, ...prodOptions });
