import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// URL da API vista de DENTRO do container do frontend (rede do Docker).
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || "http://api:8000";

// Vite config: dev server needs to listen on 0.0.0.0 inside Docker,
// otherwise the container's port won't be reachable from the host.
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    // Allows hot-reload to work correctly when running inside Docker on some setups.
    watch: {
      usePolling: true,
    },
    // E01: o navegador chama caminhos relativos (/api/...) no próprio
    // frontend e o Vite repassa para a API, tirando o prefixo /api.
    // Sem URL fixa (localhost:8000) e sem depender de CORS no dia a dia.
    proxy: {
      "/api": {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  // `vite preview` (teste local do build) usa o mesmo proxy.
  preview: {
    proxy: {
      "/api": {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
