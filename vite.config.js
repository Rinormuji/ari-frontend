import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  if (globalThis.process?.env?.VERCEL) {
    const missing = ["VITE_API_BASE_URL", "VITE_SITE_URL", "VITE_TURNSTILE_SITE_KEY"].filter(
      (key) => !env[key],
    );

    if (missing.length > 0) {
      throw new Error(
        `${missing.join(", ")} must be configured in Vercel before deployment.`,
      );
    }
    if (/^[123]x00000000000000000000(?:AA|AB|BB|FF)$/.test(env.VITE_TURNSTILE_SITE_KEY)) {
      throw new Error("VITE_TURNSTILE_SITE_KEY must use a real production key.");
    }
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
