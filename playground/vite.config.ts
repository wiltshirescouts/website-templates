import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));
export default defineConfig({
  root,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@wiltshirescouts/theme/server": fileURLToPath(new URL("../src/server/index.ts", import.meta.url)), "@wiltshirescouts/theme": fileURLToPath(new URL("../src/index.ts", import.meta.url)) } },
  server: { port: 5199, strictPort: true },
  build: { outDir: "dist", emptyOutDir: true },
});
