import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function getEnvDirectory() {
  const repoRoot = resolve(__dirname, "..");
  const rootEnvPath = resolve(repoRoot, ".env");

  return existsSync(rootEnvPath) ? repoRoot : __dirname;
}

export default defineConfig(({ mode }) => {
  const envDirectory = getEnvDirectory();
  const env = {
    ...loadEnv(mode, envDirectory, ""),
    ...process.env,
  };
  const proxyTargetUrl =
    env.VITE_PROXY_TARGET_URL ||
    env.VITE_BACKEND_URL;
  const backendApiKey = env.VITE_BACKEND_API_KEY || "";

  return {
    envDir: envDirectory,
    plugins: [tailwindcss(), react()],
    server: {
      proxy: {
        "/api/v1": {
          target: proxyTargetUrl,
          changeOrigin: true,
          secure: false,
          configure(proxy) {
            if (!backendApiKey) {
              return;
            }

            proxy.on("proxyReq", (proxyRequest) => {
              proxyRequest.setHeader("X-API-Key", backendApiKey);
            });
          },
        },
      },
    },
  };
});
