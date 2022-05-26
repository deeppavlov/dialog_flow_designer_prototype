import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import WindiCSS from "vite-plugin-windicss";
import Icons from "unplugin-icons/vite";

// https://vitejs.dev/config/
export default defineConfig(() => {
  const vscDev = !!process.env.VSC;
  if (vscDev) console.info("Building for VSCode development");

  return {
    server: vscDev
      ? {
          hmr: {
            protocol: "ws",
            host: "localhost",
          },
          origin: "http://localhost:3000",
        }
      : undefined,
    plugins: [react(), WindiCSS(), Icons({ compiler: "jsx", jsx: "react" })],
  };
});
