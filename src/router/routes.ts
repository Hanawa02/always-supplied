import type { Component } from "vue"

// Route info type definition
export interface RouteInfo {
  name: string
  path: string
  component: () => Promise<Component>
}

// Centralized route information
export const ROUTES = {
  // Authentication routes
  LOGIN: {
    name: "Login",
    path: "/auth/login",
    component: () => import("~/views/auth/LoginPage.vue"),
  },
  REGISTER: {
    name: "Register",
    path: "/auth/register",
    component: () => import("~/views/auth/RegisterPage.vue"),
  },
  AUTH_CALLBACK: {
    name: "AuthCallback",
    path: "/auth/callback",
    component: () => import("~/views/auth/AuthCallback.vue"),
  },

  // Account management
  ACCOUNT: {
    name: "Account",
    path: "/account",
    component: () => import("~/views/AccountPage.vue"),
  },

  // Main application routes
  THEME_PREVIEW: {
    name: "ThemePreview",
    path: "/theme-preview",
    component: () => import("~/views/ThemePreview.vue"),
  },
  SUPPLIED_BUILDINGS: {
    name: "SuppliedBuildings",
    path: "/buildings",
    component: () => import("~/views/SuppliedBuildings.vue"),
  },
  SUPPLY_CONFIGURATION: {
    name: "SupplyConfiguration",
    path: "/buildings/:buildingId/supplies",
    component: () => import("~/views/SupplyConfiguration.vue"),
  },
  SHOPPING_LIST: {
    name: "ShoppingList",
    path: "/shopping-list",
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
  // Legacy route redirects for backward compatibility
  {
    path: "/app/buildings",
    redirect: ROUTES.SUPPLIED_BUILDINGS.path,
  },
  {
    path: "/app/supply-configuration",
    redirect: (to: { query: { buildingId?: string } }) => {
      // Try to extract building ID from query params or use a default
      const buildingId = to.query.buildingId || 'default'
      return `/buildings/${buildingId}/supplies`
    },
  },
  {
    path: "/app/shopping-list",
    redirect: ROUTES.SHOPPING_LIST.path,
  },
]

// TypeScript types for type safety
export type RouteName = (typeof ROUTES)[keyof typeof ROUTES]["name"]
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]["path"]
