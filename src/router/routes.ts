export interface RouteInfo {
  name: string
  path: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: () => Promise<any>
}

// Centralized route information
export const ROUTES = {
  STOCK_CONFIG: {
    name: 'StockConfig',
    path: '/stock-config',
    component: () => import('~/components/views/StockConfig.vue'),
  },
  SHOPPING_LIST: {
    name: 'ShoppingList',
    path: '/shopping-list',
    component: () => import('~/components/views/ShoppingList.vue'),
  },
} as const satisfies Record<string, RouteInfo>

// Generate routes array from ROUTES
export const routes = Object.values(ROUTES)

// TypeScript types for type safety
export type RouteName = (typeof ROUTES)[keyof typeof ROUTES]['name']
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]['path']
