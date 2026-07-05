import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import compression from "vite-plugin-compression2";
import { Plugin as importToCDN } from "vite-plugin-cdn-import";

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
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './setupTests.js',
    },
    envDir: envDirectory,
    plugins: [
      tailwindcss(),
      react(),
      compression({ algorithm: "brotliCompress" }),
      compression({ algorithm: "gzip" }),
      importToCDN({
        modules: [
          {
            name: "react",
            var: "React",
            path: "https://cdn.jsdelivr.net/npm/react@19.2.3/umd/react.production.min.js",
          },
          {
            name: "react-dom",
            var: "ReactDOM",
            path: "https://cdn.jsdelivr.net/npm/react-dom@19.2.3/umd/react-dom.production.min.js",
          },
          {
            name: "axios",
            var: "axios",
            path: "https://cdn.jsdelivr.net/npm/axios@1.7.9/dist/axios.min.js",
          }
        ],
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
        },
      },
    },
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