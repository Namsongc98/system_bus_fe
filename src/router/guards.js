import { useAuthStore } from '@/stores/auth'
import { ROUTE_NAMES } from '@/constants/routes'

/**
 * Register global navigation guards on the router instance.
 * @param {import('vue-router').Router} router
 */
export function setupGuards(router) {
  router.beforeEach(async (to) => {
    const auth = useAuthStore()

    await auth.ensureSession()

    // 1. Unauthenticated user tries to access a protected route
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { name: ROUTE_NAMES.LOGIN, query: { redirect: to.fullPath } }
    }

    // 2. Authenticated user tries to access guest-only page (login / register)
    if (to.meta.requiresGuest && auth.isAuthenticated) {
      return auth.isAdmin ? { name: ROUTE_NAMES.ADMIN_DASHBOARD } : { name: ROUTE_NAMES.TRIP_VIEW }
    }

    // 3. Non-admin accesses admin route
    if (to.meta.role === 'admin' && !auth.isAdmin) {
      return { name: ROUTE_NAMES.TRIP_VIEW }
    }

    // 4. Admin accidentally lands on user route
    if (to.meta.role === 'user' && auth.isAdmin) {
      return { name: ROUTE_NAMES.ADMIN_DASHBOARD }
    }
  })
}
