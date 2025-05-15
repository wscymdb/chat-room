import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { codeInspectorPlugin } from "code-inspector-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    codeInspectorPlugin({
      bundler: "vite",
    }),
  ],
  envDir: path.resolve(__dirname, ".."),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:3000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: true,
    assetsDir: "assets",
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
});
