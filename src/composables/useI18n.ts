import { computed, ref } from "vue"
// @ts-ignore - ParaglideJS runtime doesn't have type declarations
import { locales, setLocale, getLocale, isLocale } from "~i18n/generated/runtime"
// @ts-ignore - ParaglideJS messages doesn't have type declarations
import { m } from "~i18n/generated/messages"

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
  const initializeLocale = () => {
    const savedLocale = localStorage.getItem("locale")
    if (savedLocale && isLocale(savedLocale)) {
      locale.value = savedLocale
    } else {
      // Try to detect from browser
      const browserLocale = navigator.language.split("-")[0]
      if (isLocale(browserLocale)) {
        locale.value = browserLocale
      }
    }
  }

  // Create a nested m object for better syntax
  const messages = {
    app: {
      name: () => m["app.name"](),
      navigation: {
        supply_configuration: () => m["app.navigation.supply_configuration"](),
        theme_preview: () => m["app.navigation.theme_preview"](),
      },
    },
    supply_configuration: {
      title: () => m["supply_configuration.title"](),
      add_supply_item: () => m["supply_configuration.add_supply_item"](),
      add_item_short: () => m["supply_configuration.add_item_short"](),
      total_items: () => m["supply_configuration.total_items"](),
      search_placeholder: () => m["supply_configuration.search_placeholder"](),
      all_categories: () => m["supply_configuration.all_categories"](),
      item: {
        quantity: () => m["supply_configuration.item.quantity"](),
        category: () => m["supply_configuration.item.category"](),
        storage: () => m["supply_configuration.item.storage"](),
        preferred_brands: () => m["supply_configuration.item.preferred_brands"](),
      },
      empty_state: {
        no_items_title: () => m["supply_configuration.empty_state.no_items_title"](),
        no_items_description: () => m["supply_configuration.empty_state.no_items_description"](),
        no_items_found_title: () => m["supply_configuration.empty_state.no_items_found_title"](),
        no_items_found_description: () =>
          m["supply_configuration.empty_state.no_items_found_description"](),
        add_first_item: () => m["supply_configuration.empty_state.add_first_item"](),
      },
    },
    delete_confirmation: {
      title: () => m["delete_confirmation.title"](),
      message: (params: { itemName: string }) => m["delete_confirmation.message"](params),
      cancel: () => m["delete_confirmation.cancel"](),
      delete: () => m["delete_confirmation.delete"](),
    },
  }

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
