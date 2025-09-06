import "virtual:uno.css"

import { createPinia } from "pinia"
import { createApp } from "vue"

import App from "./App.vue"
import router from "./router"

// Initialize i18n
import { useI18n } from "~/composables/useI18n"
const { initializeLocale } = useI18n()
initializeLocale()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount("#app")
