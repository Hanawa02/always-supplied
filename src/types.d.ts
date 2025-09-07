// Type declarations for ParaglideJS modules
declare module "~i18n/generated/runtime" {
  export const baseLocale: string
  export const locales: readonly string[]
  export const getLocale: () => string
  export const setLocale: (locale: string, options?: { reload?: boolean }) => void
  export const isLocale: (locale: string) => boolean
}

declare module "~i18n/generated/messages" {
  // Message functions with proper typing
  type MessageFunction = () => string
  type MessageFunctionWithParams<T = Record<string, unknown>> = (params: T) => string

  // Export the m object that contains all message functions
  export const m: {
    "app.name": MessageFunction
    "app.navigation.supply_configuration": MessageFunction
    "app.navigation.theme_preview": MessageFunction
    "supply_configuration.title": MessageFunction
    "supply_configuration.add_supply_item": MessageFunction
    "supply_configuration.add_item_short": MessageFunction
    "supply_configuration.total_items": MessageFunction
    "supply_configuration.search_placeholder": MessageFunction
    "supply_configuration.all_categories": MessageFunction
    "supply_configuration.empty_state.no_items_title": MessageFunction
    "supply_configuration.empty_state.no_items_description": MessageFunction
    "supply_configuration.empty_state.no_items_found_title": MessageFunction
    "supply_configuration.empty_state.no_items_found_description": MessageFunction
    "supply_configuration.empty_state.add_first_item": MessageFunction
    "supply_configuration.item.quantity": MessageFunction
    "supply_configuration.item.category": MessageFunction
    "supply_configuration.item.storage": MessageFunction
    "supply_configuration.item.preferred_brands": MessageFunction
    "delete_confirmation.title": MessageFunction
    "delete_confirmation.message": MessageFunctionWithParams<{ itemName: string }>
    "delete_confirmation.cancel": MessageFunction
    "delete_confirmation.delete": MessageFunction
  }

  // Also export individual functions for backwards compatibility
  export const app_name: MessageFunction
  export const app_navigation_supply_configuration: MessageFunction
  export const app_navigation_theme_preview: MessageFunction
  export const supply_configuration_title: MessageFunction
  export const supply_configuration_add_supply_item: MessageFunction
  export const supply_configuration_add_item_short: MessageFunction
  export const supply_configuration_total_items: MessageFunction
  export const supply_configuration_search_placeholder: MessageFunction
  export const supply_configuration_all_categories: MessageFunction
  export const supply_configuration_empty_state_no_items_title: MessageFunction
  export const supply_configuration_empty_state_no_items_description: MessageFunction
  export const supply_configuration_empty_state_no_items_found_title: MessageFunction
  export const supply_configuration_empty_state_no_items_found_description: MessageFunction
  export const supply_configuration_empty_state_add_first_item: MessageFunction
  export const supply_configuration_item_quantity: MessageFunction
  export const supply_configuration_item_category: MessageFunction
  export const supply_configuration_item_storage: MessageFunction
  export const supply_configuration_item_preferred_brands: MessageFunction
  export const delete_confirmation_title: MessageFunction
  export const delete_confirmation_message: MessageFunctionWithParams<{ itemName: string }>
  export const delete_confirmation_cancel: MessageFunction
  export const delete_confirmation_delete: MessageFunction
}
