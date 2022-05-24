import path from "path";
import { build as esbuild } from "esbuild";
import { EntrypointBuildOptions, MainBundleBuildOptions, mainServices } from "./options.mjs";
import { existsSync, readFileSync, writeFileSync } from "fs";

/** @type { import("esbuild").BuildOptions } */
const devOptions = {
  minify: false,
  sourcemap: "linked",
  define: {
    "process.env.NODE_ENV": '"development"',
  },
};

// For some reason regenerating extension.js while a VSCode instance is running
// breaks hot reload. To get around this, we first check whether extension.js actually
// has changed, and only overwrite if neccessary

if (existsSync("dist")) {
  // We only do this if dist already exists

  // Build src/extension.ts
  const { outputFiles } = await esbuild({
    ...EntrypointBuildOptions,
    ...devOptions,
    write: false, // Fist build in memory
  });

  // Check for change
  const newExtJsCont = outputFiles.find(
    ({ path: fp }) => path.parse(fp).base === "extension.js"
  ).text;
  const oldExtJSCont = readFileSync("dist/extension.js", { encoding: "utf8" });
  if (newExtJsCont !== oldExtJSCont) {
    console.log("Extension entrypoint changed. Make sure to restart VSCode!");
    outputFiles.forEach((f) => {
      // Write if changed
      writeFileSync(f.path, f.text);
    });
  }
} else {
  console.log("Creating dist from scratch. Make sure to restart VSCode!");
  await esbuild({ ...EntrypointBuildOptions, ...devOptions });
}

// Start watch for main services
await esbuild({
  ...MainBundleBuildOptions,
  ...devOptions,
  watch: {
    onRebuild(error) {
      if (error) console.error("main services build failed");
      else console.log("rebuilt main services");
    },
  },
});

console.log(`watching ${mainServices.join(", ")}`);
