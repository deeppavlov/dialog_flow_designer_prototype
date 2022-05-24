import { buildSync as esbuild } from "esbuild";
import rimraf from "rimraf";
import { EntrypointBuildOptions, MainBundleBuildOptions } from "./options.mjs";

/** @type { import("esbuild").BuildOptions } */
const prodOptions = {
  minify: true,
  sourcemap: false,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
};

// Clean-up
rimraf.sync("dist");

// Build src/extension.ts
// TODO: remove all hot reloading code in prodcution
esbuild({ ...EntrypointBuildOptions, ...prodOptions });

// Bundle main services
esbuild({ ...MainBundleBuildOptions, ...prodOptions });
