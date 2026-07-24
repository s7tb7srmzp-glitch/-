import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages 프로젝트 사이트로 배포되므로(레포지토리 이름 "-"),
// 실제 서비스 경로는 https://<user>.github.io/-/ 입니다.
const BASE_PATH = "/-/";

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "매일 타로 명상",
        short_name: "매일타로",
        description: "매일 아침 세 장의 카드로 오늘을 명상하고, 저녁에 하루를 기록하는 개인 타로 저널 PWA",
        theme_color: "#1E2761",
        background_color: "#1E2761",
        display: "standalone",
        orientation: "portrait",
        start_url: BASE_PATH,
        scope: BASE_PATH,
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }: { url: URL }) => url.pathname.includes("/cards/"),
            handler: "CacheFirst",
            options: {
              cacheName: "tarot-card-images",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
