import { paraglideVitePlugin } from "@inlang/paraglide-js"
import { fileURLToPath, URL } from "node:url"
import UnoCSS from "unocss/vite"
import { VitePWA } from "vite-plugin-pwa"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vueDevTools from "vite-plugin-vue-devtools"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/i18n/generated",
      strategy: ["preferredLanguage", "cookie", "baseLocale"],
      emitTsDeclarations: true,
    }),
    vue(),
    vueDevTools(),
    UnoCSS(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Always Supplied",
        short_name: "Always Supplied",
        description: "An inventory and supply management app.",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
      "~translations": fileURLToPath(new URL("./src/i18n/generated/messages.js", import.meta.url)),
      "~i18n": fileURLToPath(new URL("./src/i18n/generated/runtime.js", import.meta.url)),
    },
  },
  // Needed for SqlLite WASM to work properly
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
})
