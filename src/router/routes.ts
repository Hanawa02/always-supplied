// Route info type definition
export interface RouteInfo {
  name: string
  path: string
  component: () => Promise<any>
}

// Centralized route information
export const ROUTES = {
  THEME_PREVIEW: {
    name: 'ThemePreview',
    path: '/theme-preview',
    component: () => import('~/views/ThemePreview.vue'),
  },
} as const satisfies Record<string, RouteInfo>

// Generate routes array from ROUTES
export const routes = Object.values(ROUTES)

// TypeScript types for type safety
export type RouteName = typeof ROUTES[keyof typeof ROUTES]['name']
export type RoutePath = typeof ROUTES[keyof typeof ROUTES]['path']