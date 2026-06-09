import { useAuthStore } from '@/stores/auth'

/**
 * Thin wrapper over the auth store for use inside components.
 * @returns {{ user: *, isAuthenticated: *, isAdmin: *, login: Function, logout: Function, register: Function }}
 */
export function useAuth() {
  const authStore = useAuthStore()

  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin,
    login: authStore.login,
    logout: authStore.logout,
    register: authStore.register,
  }
}
import { useAuthStore } from '@/store/auth'

/**
 * Composable for authentication state and actions.
 * Thin wrapper around the auth store for use in components.
 */
export function useAuth() {
  const authStore = useAuthStore()

  // placeholder — expose store state and actions
  return {
    // state
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin,

    // actions (placeholders — implemented in store)
    login: authStore.login,
    logout: authStore.logout,
    register: authStore.register,
  }
}
/**
 * useAuth — convenience wrapper around authStore for use in components.
 *
 * Exposes the most-needed auth state and actions without importing
 * the store directly in every component.
 */
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/constants/routes'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  async function logout() {
    await authStore.logout()
    router.push({ name: ROUTE_NAMES.LOGIN })
  }

  return {
    user: authStore.currentUser,
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin,
    isLoading: authStore.isLoading,
    login: authStore.login,
    register: authStore.register,
    logout,
  }
}
