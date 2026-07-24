import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiOrigin = process.env.VITE_API_ORIGIN ?? "http://127.0.0.1:3000";
const browserTargets = [
  "chrome111",
  "edge111",
  "firefox121",
  "safari16.4",
  "ios16.4",
];

export default defineConfig({
  build: {
    outDir: "dist",
    sourcemap: true,
    target: browserTargets,
    cssTarget: browserTargets,
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true,
    proxy: {
      "/api": {
        target: apiOrigin,
        changeOrigin: false,
      },
    },
    warmup: {
      clientFiles: ["./src/main.tsx"],
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: true,
    proxy: {
      "/api": {
        target: apiOrigin,
        changeOrigin: false,
      },
    },
  },
  plugins: [react()],
});
