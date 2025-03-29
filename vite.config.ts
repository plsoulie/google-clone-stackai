import { defineConfig } from "vite";
import path from "path";
import { lovableTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [lovableTagger()],
  server: {
    host: "::",
    port: 8080,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend/src"),
    },
  },
  build: {
    outDir: "dist",
  },
});
