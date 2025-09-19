import { watch } from 'vue'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

import { useAuth } from '~/composables/useAuth'

/**
 * Auth middleware to protect routes that require authentication
 */
export async function requireAuth(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const { isAuthenticated, isInitializing } = useAuth()

  // Wait for auth to initialize
  if (isInitializing.value) {
    // Wait for auth state to be determined
    const unwatch = watch(isInitializing, (initializing) => {
      if (!initializing) {
        unwatch()
        if (isAuthenticated.value) {
          next()
        } else {
          next({
            path: '/auth/login',
            query: { redirect: to.fullPath },
          })
        }
      }
    })
    return
  }

  if (isAuthenticated.value) {
    next()
  } else {
    next({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
  }
}

/**
 * Guest middleware to redirect authenticated users away from auth pages
 */
export async function requireGuest(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const { isAuthenticated, isInitializing } = useAuth()

  // Wait for auth to initialize
  if (isInitializing.value) {
    const unwatch = watch(isInitializing, (initializing) => {
      if (!initializing) {
        unwatch()
        if (isAuthenticated.value) {
          next('/buildings')
        } else {
          next()
        }
      }
    })
    return
  }

  if (isAuthenticated.value) {
    next('/buildings')
  } else {
    next()
  }
}

/**
 * Optional auth middleware - allows both authenticated and guest users
 */
export async function optionalAuth(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // Always allow access for optional auth routes
  next()
}