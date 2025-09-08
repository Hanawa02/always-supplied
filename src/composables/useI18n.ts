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
        supplied_buildings: (): string => (m as any)["app.navigation.supplied_buildings"](),
        shopping_list: (): string => (m as any)["app.navigation.shopping_list"](),
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
        edit_tooltip: (): string => m["supply_configuration.item.edit_tooltip"](),
        delete_tooltip: (): string => m["supply_configuration.item.delete_tooltip"](),
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
    supply_item_modal: {
      title_add: (): string => m["supply_item_modal.title_add"](),
      title_edit: (): string => m["supply_item_modal.title_edit"](),
      name_label: (): string => m["supply_item_modal.name_label"](),
      name_placeholder: (): string => m["supply_item_modal.name_placeholder"](),
      description_label: (): string => m["supply_item_modal.description_label"](),
      description_placeholder: (): string => m["supply_item_modal.description_placeholder"](),
      quantity_label: (): string => m["supply_item_modal.quantity_label"](),
      quantity_placeholder: (): string => m["supply_item_modal.quantity_placeholder"](),
      category_label: (): string => m["supply_item_modal.category_label"](),
      category_placeholder: (): string => m["supply_item_modal.category_placeholder"](),
      category_custom: (): string => m["supply_item_modal.category_custom"](),
      category_custom_placeholder: (): string =>
        m["supply_item_modal.category_custom_placeholder"](),
      storage_room_label: (): string => m["supply_item_modal.storage_room_label"](),
      storage_room_placeholder: (): string => m["supply_item_modal.storage_room_placeholder"](),
      storage_room_custom: (): string => m["supply_item_modal.storage_room_custom"](),
      storage_room_custom_placeholder: (): string =>
        m["supply_item_modal.storage_room_custom_placeholder"](),
      shopping_hint_label: (): string => m["supply_item_modal.shopping_hint_label"](),
      shopping_hint_placeholder: (): string => m["supply_item_modal.shopping_hint_placeholder"](),
      shopping_hint_help: (): string => (m as any)["supply_item_modal.shopping_hint_help"](),
      preferred_brands_label: (): string => m["supply_item_modal.preferred_brands_label"](),
      preferred_brands_placeholder: (): string =>
        m["supply_item_modal.preferred_brands_placeholder"](),
      preferred_brands_help: (): string => (m as any)["supply_item_modal.preferred_brands_help"](),
      quantity_help: (): string => (m as any)["supply_item_modal.quantity_help"](),
      close_tooltip: (): string => (m as any)["supply_item_modal.close_tooltip"](),
      required_field: (): string => m["supply_item_modal.required_field"](),
      cancel: (): string => m["supply_item_modal.cancel"](),
      create_item: (): string => m["supply_item_modal.create_item"](),
      update_item: (): string => m["supply_item_modal.update_item"](),
      validation: {
        name_required: (): string => m["supply_item_modal.validation.name_required"](),
        quantity_negative: (): string => m["supply_item_modal.validation.quantity_negative"](),
      },
    },
    delete_confirmation: {
      title: (): string => m["delete_confirmation.title"](),
      message: (params: { itemName: string }): string => m["delete_confirmation.message"](params),
      cancel: (): string => m["delete_confirmation.cancel"](),
      delete: (): string => m["delete_confirmation.delete"](),
    },
    supplied_buildings: {
      title: (): string => (m as any)["supplied_buildings.title"](),
      add_building: (): string => (m as any)["supplied_buildings.add_building"](),
      add_first_building: (): string => (m as any)["supplied_buildings.add_first_building"](),
      total_buildings: (): string => (m as any)["supplied_buildings.total_buildings"](),
      search_placeholder: (): string => (m as any)["supplied_buildings.search_placeholder"](),
      manage_supplies: (): string => (m as any)["supplied_buildings.manage_supplies"](),
      supplies_count: (): string => (m as any)["supplied_buildings.supplies_count"](),
      empty_state: {
        no_buildings_title: (): string =>
          (m as any)["supplied_buildings.empty_state.no_buildings_title"](),
        no_buildings_description: (): string =>
          (m as any)["supplied_buildings.empty_state.no_buildings_description"](),
        no_buildings_found_title: (): string =>
          (m as any)["supplied_buildings.empty_state.no_buildings_found_title"](),
        no_buildings_found_description: (): string =>
          (m as any)["supplied_buildings.empty_state.no_buildings_found_description"](),
      },
    },
    building_modal: {
      title_add: (): string => (m as any)["building_modal.title_add"](),
      title_edit: (): string => (m as any)["building_modal.title_edit"](),
      name_label: (): string => (m as any)["building_modal.name_label"](),
      name_placeholder: (): string => (m as any)["building_modal.name_placeholder"](),
      description_label: (): string => (m as any)["building_modal.description_label"](),
      description_placeholder: (): string => (m as any)["building_modal.description_placeholder"](),
      required_field: (): string => (m as any)["building_modal.required_field"](),
      cancel: (): string => (m as any)["building_modal.cancel"](),
      create_building: (): string => (m as any)["building_modal.create_building"](),
      update_building: (): string => (m as any)["building_modal.update_building"](),
      close_tooltip: (): string => (m as any)["building_modal.close_tooltip"](),
      validation: {
        name_required: (): string => (m as any)["building_modal.validation.name_required"](),
      },
    },
    shopping_list: {
      title: (): string => (m as any)["shopping_list.title"](),
      description: (): string => (m as any)["shopping_list.description"](),
      search_placeholder: (): string => (m as any)["shopping_list.search_placeholder"](),
      all_categories: (): string => (m as any)["shopping_list.all_categories"](),
      show_bought_items: (): string => (m as any)["shopping_list.show_bought_items"](),
      clear_bought: (): string => (m as any)["shopping_list.clear_bought"](),
      add_item: (): string => (m as any)["shopping_list.add_item"](),
      total_items: (): string => (m as any)["shopping_list.total_items"](),
      to_buy: (): string => (m as any)["shopping_list.to_buy"](),
      bought: (): string => (m as any)["shopping_list.bought"](),
      empty_state: {
        no_items_title: (): string => (m as any)["shopping_list.empty_state.no_items_title"](),
        no_items_description: (): string => (m as any)["shopping_list.empty_state.no_items_description"](),
        no_items_found_title: (): string => (m as any)["shopping_list.empty_state.no_items_found_title"](),
        no_items_found_description: (): string => (m as any)["shopping_list.empty_state.no_items_found_description"](),
        add_first_item: (): string => (m as any)["shopping_list.empty_state.add_first_item"](),
      },
    },
    buying_item_modal: {
      title_add: (): string => (m as any)["buying_item_modal.title_add"](),
      title_edit: (): string => (m as any)["buying_item_modal.title_edit"](),
      title_add_from_supply: (): string => (m as any)["buying_item_modal.title_add_from_supply"](),
      name_label: (): string => (m as any)["buying_item_modal.name_label"](),
      name_placeholder: (): string => (m as any)["buying_item_modal.name_placeholder"](),
      quantity_label: (): string => (m as any)["buying_item_modal.quantity_label"](),
      quantity_placeholder: (): string => (m as any)["buying_item_modal.quantity_placeholder"](),
      shopping_hint_label: (): string => (m as any)["buying_item_modal.shopping_hint_label"](),
      shopping_hint_placeholder: (): string => (m as any)["buying_item_modal.shopping_hint_placeholder"](),
      notes_label: (): string => (m as any)["buying_item_modal.notes_label"](),
      notes_placeholder: (): string => (m as any)["buying_item_modal.notes_placeholder"](),
      required_field: (): string => (m as any)["buying_item_modal.required_field"](),
      cancel: (): string => (m as any)["buying_item_modal.cancel"](),
      create_item: (): string => (m as any)["buying_item_modal.create_item"](),
      update_item: (): string => (m as any)["buying_item_modal.update_item"](),
      close_tooltip: (): string => (m as any)["buying_item_modal.close_tooltip"](),
      quantity_help: (): string => (m as any)["buying_item_modal.quantity_help"](),
      shopping_hint_help: (): string => (m as any)["buying_item_modal.shopping_hint_help"](),
      validation: {
        name_required: (): string => (m as any)["buying_item_modal.validation.name_required"](),
        quantity_positive: (): string => (m as any)["buying_item_modal.validation.quantity_positive"](),
      },
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
