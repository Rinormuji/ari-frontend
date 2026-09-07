import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  if (globalThis.process?.env?.VERCEL && !env.VITE_API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL must be configured in Vercel before deployment.");
  }

  return {
    plugins: [react(), tailwindcss()],
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.js",
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:3007",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});