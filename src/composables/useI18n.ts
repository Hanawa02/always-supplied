import { computed, ref } from "vue"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - ParaglideJS generated files don't have proper TypeScript declarations
import { m } from "~i18n/generated/messages"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - ParaglideJS generated files don't have proper TypeScript declarations
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

  // Create a nested m object for better syntax
  const messages = {
    app: {
      name: (): string => m["app.name"](),
      navigation: {
        supply_configuration: (): string => m["app.navigation.supply_configuration"](),
        theme_preview: (): string => m["app.navigation.theme_preview"](),
      },
    },
    supply_configuration: {
      title: (): string => m["supply_configuration.title"](),
      add_supply_item: (): string => m["supply_configuration.add_supply_item"](),
      add_item_short: (): string => m["supply_configuration.add_item_short"](),
      total_items: (): string => m["supply_configuration.total_items"](),
      search_placeholder: (): string => m["supply_configuration.search_placeholder"](),
      all_categories: (): string => m["supply_configuration.all_categories"](),
      item: {
        quantity: (): string => m["supply_configuration.item.quantity"](),
        category: (): string => m["supply_configuration.item.category"](),
        storage: (): string => m["supply_configuration.item.storage"](),
        preferred_brands: (): string => m["supply_configuration.item.preferred_brands"](),
      },
      empty_state: {
        no_items_title: (): string => m["supply_configuration.empty_state.no_items_title"](),
        no_items_description: (): string =>
          m["supply_configuration.empty_state.no_items_description"](),
        no_items_found_title: (): string =>
          m["supply_configuration.empty_state.no_items_found_title"](),
        no_items_found_description: (): string =>
          m["supply_configuration.empty_state.no_items_found_description"](),
        add_first_item: (): string => m["supply_configuration.empty_state.add_first_item"](),
      },
    },
    delete_confirmation: {
      title: (): string => m["delete_confirmation.title"](),
      message: (params: { itemName: string }): string => m["delete_confirmation.message"](params),
      cancel: (): string => m["delete_confirmation.cancel"](),
      delete: (): string => m["delete_confirmation.delete"](),
    },
  } as const

  return {
    // Current locale
    locale,

    // Available locales
    availableLocales: locales,

    // All message functions with nested structure
    m: messages,

    // Utilities
    initializeLocale,

    // Locale info
    localeNames: {
      en: "English",
      es: "Español",
      pt: "Português",
    } as Record<string, string>,
  }
}
