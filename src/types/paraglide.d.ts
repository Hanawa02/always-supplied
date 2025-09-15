// TypeScript declarations for Paraglide generated modules
// This file uses module augmentation to provide types for the generated JavaScript

declare module "~i18n/generated/messages" {
  // Re-export all message functions from the index
  export * from "../../i18n/generated/messages/_index.js"

  // Export the namespace 'm' which contains all message functions
  export * as m from "../../i18n/generated/messages/_index.js"
}

declare module "~i18n/generated/runtime" {
  // Core Paraglide runtime exports
  export const baseLocale: string
  export const locales: readonly string[]
  export const cookieName: string
  export const cookieMaxAge: number
  export const cookieDomain: string
  export const localStorageKey: string
  export const strategy: readonly string[]

  // Language/locale functions
  export function getLanguageTag(): string
  export function setLanguageTag(locale: string): void
  export const availableLanguageTags: readonly string[]
  export const sourceLanguageTag: string
  export function isAvailableLanguageTag(locale: unknown): locale is string

  // Aliases for backward compatibility
  export const getLocale: typeof getLanguageTag
  export const setLocale: typeof setLanguageTag
  export const isLocale: typeof isAvailableLanguageTag
}

// Also declare for absolute imports if needed
declare module "*/i18n/generated/messages" {
  export * from "~i18n/generated/messages"
}

declare module "*/i18n/generated/runtime" {
  export * from "~i18n/generated/runtime"
}
