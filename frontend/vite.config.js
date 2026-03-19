import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,
  },
  server: {
    proxy: {
      "/api": {
        target: "https://bookshaven.onrender.com/",
        changeOrigin: true,
      },
      "/media": {
        target: "https://bookshaven.onrender.com/",
        changeOrigin: true,
      },
    },
  },
});