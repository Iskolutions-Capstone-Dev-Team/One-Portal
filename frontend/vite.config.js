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

function isRunningInDocker() {
  return existsSync("/.dockerenv");
}

function getProxyTargetUrl(env) {
  const localBackendUrl = env.VITE_BACKEND_URL;
  const containerBackendUrl = env.VITE_PROXY_TARGET_URL;

  if (isRunningInDocker()) {
    return containerBackendUrl || localBackendUrl;
  }

  return localBackendUrl || containerBackendUrl;
}

export default defineConfig(({ mode }) => {
  const envDirectory = getEnvDirectory();
  const env = {
    ...loadEnv(mode, envDirectory, ""),
    ...process.env,
  };
  const proxyTargetUrl = getProxyTargetUrl(env);
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