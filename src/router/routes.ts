import type { Component } from "vue"

// Route info type definition
export interface RouteInfo {
  name: string
  path: string
  component: () => Promise<Component>
}

// Centralized route information
export const ROUTES = {
  THEME_PREVIEW: {
    name: "ThemePreview",
    path: "/theme-preview",
    component: () => import("~/views/ThemePreview.vue"),
  },
  SUPPLY_CONFIGURATION: {
    name: "SupplyConfiguration",
    path: "/app/supply-configuration",
    component: () => import("~/views/SupplyConfiguration.vue"),
  },
} as const satisfies Record<string, RouteInfo>

// Generate routes array from ROUTES and add redirect
export const routes = [
  ...Object.values(ROUTES),
  // Redirect root to supply configuration
  {
    path: "/",
    redirect: ROUTES.SUPPLY_CONFIGURATION.path,
  },
]

// TypeScript types for type safety
export type RouteName = (typeof ROUTES)[keyof typeof ROUTES]["name"]
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]["path"]
