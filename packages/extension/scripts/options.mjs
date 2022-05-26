export const outdir = "dist";

/** Build options for src/extension.ts, the main extension entrypoint.
 * @type { import("esbuild").BuildOptions }
 */
export const BuildOptions = {
  entryPoints: ["src/extension.ts"],
  outdir,
  platform: "node",
  format: "cjs",
  bundle: true,
  external: ["vscode"],
};
