import { paraglideVitePlugin } from "@inlang/paraglide-js"
import { fileURLToPath, URL } from "node:url"
import UnoCSS from "unocss/vite"

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
  ],
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
      "~translations": fileURLToPath(new URL("./src/i18n/generated/messages.js", import.meta.url)),
      "~i18n": fileURLToPath(new URL("./src/i18n/generated/runtime.js", import.meta.url)),
    },
  },
})
