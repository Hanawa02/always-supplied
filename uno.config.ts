import { defineConfig, presetAttributify, presetWind4, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetAttributify(),
    presetWind4(),
    presetIcons({
      collections: {
        mdi: () => import('@iconify-json/mdi/icons.json').then((i) => i.default),
      },
    }),
  ],
})
