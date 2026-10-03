import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import hydraServerPlugin from "./scripts/hydra-server.mjs";

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    watch: { ignored: ["**/src/source/**", "**/src/site/**", "**/evidence/**"] },
  },
  plugins: [hydraServerPlugin(), react()],
});
