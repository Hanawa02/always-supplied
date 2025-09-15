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
  SUPPLIED_BUILDINGS: {
    name: "SuppliedBuildings",
    path: "/app/buildings",
    component: () => import("~/views/SuppliedBuildings.vue"),
  },
  SUPPLY_CONFIGURATION: {
    name: "SupplyConfiguration",
    path: "/app/supply-configuration",
    component: () => import("~/views/SupplyConfiguration.vue"),
  },
  SHOPPING_LIST: {
    name: "ShoppingList",
    path: "/app/shopping-list",
    component: () => import("~/views/ShoppingList.vue"),
  },
} as const satisfies Record<string, RouteInfo>

// Generate routes array from ROUTES and add redirect
export const routes = [
  ...Object.values(ROUTES),
  // Redirect root to buildings page
  {
    path: "/",
    redirect: ROUTES.SUPPLIED_BUILDINGS.path,
  },
]

// TypeScript types for type safety
export type RouteName = (typeof ROUTES)[keyof typeof ROUTES]["name"]
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]["path"]
