import { fileURLToPath, URL } from "node:url"

import { paraglideVitePlugin } from "@inlang/paraglide-js"
import vue from "@vitejs/plugin-vue"
import UnoCSS from "unocss/vite"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import vueDevTools from "vite-plugin-vue-devtools"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./i18n/generated",
    }),
    vue(),
    vueDevTools(),
    UnoCSS(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
      "~i18n": fileURLToPath(new URL("./i18n", import.meta.url)),
    },
  },
})
