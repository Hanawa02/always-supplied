import { computed, ref } from "vue"

import { m } from "~i18n/generated/messages"
import { getLocale, isLocale, locales, setLocale } from "~i18n/generated/runtime"

// Current locale state
const currentLocale = ref(getLocale())

export function useI18n() {
  // Watch for locale changes
  const locale = computed({
    get: () => currentLocale.value,
    set: (newLocale: string) => {
      if (isLocale(newLocale)) {
        setLocale(newLocale)
        currentLocale.value = newLocale
        // Save to localStorage
        localStorage.setItem("locale", newLocale)
      }
    },
  })

  // Initialize from localStorage
  const initializeLocale = (): void => {
    const savedLocale = localStorage.getItem("locale")
    if (savedLocale && isLocale(savedLocale)) {
      locale.value = savedLocale
    } else {
      // Try to detect from browser
      const browserLocale = navigator.language.split("-")[0]
      if (browserLocale && isLocale(browserLocale)) {
        locale.value = browserLocale
      }
    }
  }

  return {
    // Current locale
    locale,

    // Available locales
    availableLocales: locales,

    // All message functions with nested structure
    m,

    // Utilities
    initializeLocale,

    // Locale info
    localeNames: {
      en: "English",
    } as Record<string, string>,
  }
}
