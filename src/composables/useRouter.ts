import { useRouter as useVueRouter } from "vue-router"

import { type RouteName, type RoutePath, ROUTES } from "~/router/routes"

export function useTypedRouter() {
  const router = useVueRouter()

  // Type-safe navigation by route name
  const navigateToRoute = (name: RouteName, params?: Record<string, string>) => {
    return router.push({ name, params })
  }

  // Type-safe navigation by path
  const navigateToPath = (path: RoutePath) => {
    return router.push(path)
  }

  // Helper functions for specific routes
  const goToThemePreview = () => navigateToRoute(ROUTES.THEME_PREVIEW.name)
  const goToSupplyConfiguration = () => navigateToRoute(ROUTES.SUPPLY_CONFIGURATION.name)

  return {
    router,
    navigateToRoute,
    navigateToPath,
    goToThemePreview,
    goToSupplyConfiguration,
    // Export routes for direct access
    ROUTES,
  }
}
