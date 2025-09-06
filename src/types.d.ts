// Type declarations for ParaglideJS modules
declare module "~i18n/generated/runtime" {
  export const baseLocale: string
  export const locales: readonly string[]
  export const getLocale: () => string
  export const setLocale: (locale: string, options?: any) => void
  export const isLocale: (locale: string) => boolean
}

declare module "~i18n/generated/messages" {
  export const app_name: () => string
  export const app_navigation_supply_configuration: () => string
  export const app_navigation_theme_preview: () => string
  export const supply_configuration_title: () => string
  export const supply_configuration_add_supply_item: () => string
  export const supply_configuration_add_item_short: () => string
  export const supply_configuration_total_items: () => string
  export const supply_configuration_search_placeholder: () => string
  export const supply_configuration_all_categories: () => string
  export const supply_configuration_empty_state_no_items_title: () => string
  export const supply_configuration_empty_state_no_items_description: () => string
  export const supply_configuration_empty_state_no_items_found_title: () => string
  export const supply_configuration_empty_state_no_items_found_description: () => string
  export const supply_configuration_empty_state_add_first_item: () => string
  export const supply_configuration_item_quantity: () => string
  export const supply_configuration_item_category: () => string
  export const supply_configuration_item_storage: () => string
  export const supply_configuration_item_preferred_brands: () => string
  export const delete_confirmation_title: () => string
  export const delete_confirmation_message: (params: { itemName: string }) => string
  export const delete_confirmation_cancel: () => string
  export const delete_confirmation_delete: () => string
}
