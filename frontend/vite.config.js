import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  build: {
    outDir: 'build',
    sourcemap: false,
    minify: 'esbuild',  // ← Change from 'terser' to 'esbuild'
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
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