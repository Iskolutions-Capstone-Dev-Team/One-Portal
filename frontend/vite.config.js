import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import compression from "vite-plugin-compression2";
import { VitePWA } from "vite-plugin-pwa";

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
  const backendApiKey = env.BACKEND_API_KEY || "";

  return {
    assetsInclude: ['**/*.glb'],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './setupTests.js',
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    envDir: envDirectory,
    plugins: [
      tailwindcss(),
      react(),
      compression({ algorithm: "brotliCompress" }),
      compression({ algorithm: "gzip" }),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8 MB limit to accommodate large chunks
        },
        manifest: {
          name: 'One Portal',
          short_name: 'One Portal',
          description: 'PUP Taguig One Portal',
          theme_color: '#7b0d15',
          background_color: '#7b0d15',
          display: 'standalone',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    build: {
      rollupOptions: {
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