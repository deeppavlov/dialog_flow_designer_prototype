export const mainServices = ["src/GraphEditorProvider.ts"];
export const outdir = "dist";

/** Build options for src/extension.ts, the main extension entrypoint.
 *
 * **WARNING**: messing with these is not recommended.
 * @type { import("esbuild").BuildOptions }
 */
export const EntrypointBuildOptions = {
  entryPoints: ["src/extension.ts"],
  outdir,
  platform: "node",
  format: "cjs",
};

/** Build options for the main extension bundle
 * @type { import("esbuild").BuildOptions }
 */
export const MainBundleBuildOptions = {
  ...EntrypointBuildOptions,
  entryPoints: mainServices,
  bundle: true,
  external: ["vscode"],
};
