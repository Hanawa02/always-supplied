import { defaultConfig } from "@formkit/vue"
import { createZodPlugin } from "@formkit/zod"

export const formkitConfig = defaultConfig({
  plugins: [createZodPlugin({
    zodConfig: {
      abortEarly: false,
      abortPipeEarly: false,
    },
  })],
  theme: "genesis",
  config: {
    classes: {
      outer: "mb-4",
      label: "block text-sm font-medium mb-1",
      inner: "relative",
      input: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500",
      help: "text-xs text-gray-500 mt-1",
      messages: "list-none p-0 mt-1",
      message: "text-red-600 text-sm",
    },
  },
})