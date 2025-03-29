
import { defineConfig } from "vite";
import { fileURLToPath } from 'url';
import { componentTagger } from "lovable-tagger";

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [componentTagger()],
  server: {
    host: "::",
    port: 8080,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./frontend/src', import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
  },
});
