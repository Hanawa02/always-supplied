import { defineConfig, presetWind4, presetIcons } from "unocss"
import presetWebFonts from "@unocss/preset-web-fonts"
import { colors } from "./colors.config"

export default defineConfig({
  theme: {
    colors,
  },
  presets: [
    presetWind4(),
    presetIcons({
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
        // ...
      },
      collections: {
        mdi: () => import("@iconify-json/mdi/icons.json").then((i) => i.default),
      },
    }),
    presetWebFonts({
      provider: "google",
      fonts: {
        sans: "Montserrat",
      },
    }),
  ],
})
