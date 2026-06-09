import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { LOCAL_STORAGE_KEYS, USER_ROLES } from '@/constants'
import { getStorage, setStorage, removeStorage } from '@/utils/storage'
import { ApiError } from '@/errors/ApiError'

export const useAuthStore = defineStore('auth', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const user = ref(normalizeUser(getStorage(LOCAL_STORAGE_KEYS.USER)))
  const accessToken = ref(getStorage(LOCAL_STORAGE_KEYS.ACCESS_TOKEN) ?? null)
  const refreshToken = ref(getStorage(LOCAL_STORAGE_KEYS.REFRESH_TOKEN) ?? null)
  const loading = ref(false)
  const error = ref(null)
  const sessionReady = ref(false)

  // ─── Getters ──────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === USER_ROLES.ADMIN)

  // ─── Actions ──────────────────────────────────────────────────────────────
  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const res = await authService.login(credentials)
      const data = getResponseData(res)
      setTokens(data)
      await resolveCurrentUser(data)
      return data
    } catch (err) {
      const apiError = toApiError(err)
      error.value = apiError.message
      throw apiError
    } finally {
      loading.value = false
    }
  }

  async function register(payload) {
    loading.value = true
    error.value = null
    try {
      const res = await authService.register(payload)
      const data = getResponseData(res)
      setTokens(data)
      await resolveCurrentUser(data)
      return data
    } catch (err) {
      const apiError = toApiError(err)
      error.value = apiError.message
      throw apiError
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      if (accessToken.value) {
        await authService.logout()
      }
    } catch {
      // Local session must be cleared even if the backend logout fails.
    } finally {
      clearSession()
    }
  }

  async function fetchMe() {
    if (!accessToken.value) return null

    try {
      const res = await authService.getMe()
      const currentUser = normalizeUser(getResponseData(res))
      setUser(currentUser)
      return currentUser
    } catch (err) {
      clearSession()
      throw toApiError(err)
    }
  }

  async function ensureSession() {
    if (!accessToken.value) {
      sessionReady.value = true
      return null
    }

    if (user.value) {
      sessionReady.value = true
      return user.value
    }

    const tokenUser = getUserFromToken(accessToken.value)
    if (tokenUser) {
      setUser(tokenUser)
      sessionReady.value = true
      return tokenUser
    }

    try {
      return await fetchMe()
    } finally {
      sessionReady.value = true
    }
  }

  function setTokens(tokens) {
    accessToken.value = tokens?.accessToken ?? null
    refreshToken.value = tokens?.refreshToken ?? null

    if (accessToken.value) {
      setStorage(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken.value)
    } else {
      removeStorage(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)
    }

    if (refreshToken.value) {
      setStorage(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken.value)
    } else {
      removeStorage(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
    }
  }

  function setUser(payload) {
    const normalizedUser = normalizeUser(payload)
    user.value = normalizedUser

    if (normalizedUser) {
      setStorage(LOCAL_STORAGE_KEYS.USER, normalizedUser)
    } else {
      removeStorage(LOCAL_STORAGE_KEYS.USER)
    }
  }

  function clearSession() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    sessionReady.value = true
    removeStorage(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)
    removeStorage(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
    removeStorage(LOCAL_STORAGE_KEYS.USER)
  }

  function resolveCurrentUser(data) {
    const currentUser = normalizeUser(data?.user ?? data?.currentUser ?? data?.profile)
    if (currentUser) {
      setUser(currentUser)
      return currentUser
    }

    const tokenUser = getUserFromToken(data?.accessToken ?? accessToken.value)
    if (tokenUser) {
      setUser(tokenUser)
      return tokenUser
    }

    return fetchMe()
  }

  function getResponseData(res) {
    return res?.data?.data ?? res?.data ?? res
  }

  function getUserFromToken(token) {
    if (!token) return null

    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
      const payload = JSON.parse(atob(paddedBase64))
      return normalizeUser(payload)
    } catch {
      return null
    }
  }

  function normalizeUser(payload) {
    if (!payload || typeof payload !== 'object') return null

    const role = normalizeRole(payload.role ?? payload.authority ?? payload.scope)
    return {
      ...payload,
      role,
      email: payload.email ?? payload.sub ?? payload.username ?? null,
    }
  }

  function normalizeRole(role) {
    const normalizedRole = String(role ?? '').toLowerCase()
    return normalizedRole.includes('admin') ? USER_ROLES.ADMIN : USER_ROLES.USER
  }

  function toApiError(err) {
    return new ApiError(err?.status ?? err?.code, err?.message)
  }

  return {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    sessionReady,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchMe,
    ensureSession,
    setTokens,
    setUser,
    clearSession,
  }
})
