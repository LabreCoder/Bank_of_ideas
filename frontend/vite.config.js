import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
  },
});
