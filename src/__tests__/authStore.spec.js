import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useAdminStore } from '@/stores/admin'
import { useUserStore } from '@/stores/user'
import { resetStorePlugin } from '@/stores/plugins/resetStore'
import { getSessionSignal } from '@/services/sessionAbort'
import { authService } from '@/services/authService'
import { LOCAL_STORAGE_KEYS } from '@/constants'

vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}))

function jwt(payload) {
  const encode = (value) => btoa(JSON.stringify(value)).replace(/=+$/, '')
  return `${encode({ alg: 'HS256' })}.${encode(payload)}.signature`
}

const TOKEN = jwt({ sub: '42', role: 'CUSTOMER' })
const ME = {
  id: 42,
  email: 'khach@example.com',
  role: 'CUSTOMER',
  fullName: 'Nguyen Van A',
  phone: '0901234567',
}

function storeToken() {
  localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, JSON.stringify(TOKEN))
}

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    document.cookie = 'bkt_test=1; path=/'
    vi.clearAllMocks()
    // Plugins only apply once pinia is installed in an app, as in main.js.
    const pinia = createPinia()
    pinia.use(resetStorePlugin)
    createApp({}).use(pinia)
    setActivePinia(pinia)
  })

  it('login loads the current user from /auth/me', async () => {
    authService.login.mockResolvedValue({
      data: { data: { accessToken: TOKEN, refreshToken: TOKEN } },
    })
    authService.getMe.mockResolvedValue({ data: { data: ME } })
    const store = useAuthStore()

    await store.login({ email: ME.email, password: 'secret123' })

    expect(authService.getMe).toHaveBeenCalled()
    expect(store.user).toMatchObject({
      id: 42,
      email: ME.email,
      fullName: ME.fullName,
      phone: ME.phone,
    })
  })

  it('register loads the current user from /auth/me', async () => {
    authService.register.mockResolvedValue({
      data: { data: { accessToken: TOKEN, refreshToken: TOKEN } },
    })
    authService.getMe.mockResolvedValue({ data: { data: ME } })
    const store = useAuthStore()

    await store.register({ email: ME.email, password: 'secret123' })

    expect(authService.getMe).toHaveBeenCalled()
    expect(store.user).toMatchObject({ id: 42, email: ME.email, fullName: ME.fullName })
  })

  it.each(['login', 'register'])(
    'a JWT error from /auth/me right after %s rejects and clears the session',
    async (action) => {
      authService[action].mockResolvedValue({
        data: { data: { accessToken: TOKEN, refreshToken: TOKEN } },
      })
      authService.getMe.mockRejectedValue({ status: 401, message: 'Unauthorized' })
      const store = useAuthStore()

      await expect(store[action]({ email: ME.email, password: 'secret123' })).rejects.toMatchObject(
        { status: 401 }
      )
      expect(store.accessToken).toBeNull()
      expect(store.user).toBeNull()
      expect(localStorage.length).toBe(0)
    }
  )

  it('a JWT error resets the data other stores hold for the previous account', async () => {
    storeToken()
    const adminStore = useAdminStore()
    const userStore = useUserStore()
    adminStore.dashboardStats = { totalRevenue: 125500000 }
    userStore.users = [{ id: 1, email: 'other@example.com' }]
    userStore.profile = { fullName: 'Nguyen Van A' }
    authService.getMe.mockRejectedValue({ status: 401, message: 'Unauthorized' })
    const store = useAuthStore()

    await store.ensureSession()

    expect(adminStore.dashboardStats).toBeNull()
    expect(userStore.users).toEqual([])
    expect(userStore.profile).toBeNull()
  })

  it('a JWT error cancels requests still in flight for the old session', async () => {
    storeToken()
    const oldSessionSignal = getSessionSignal()
    authService.getMe.mockRejectedValue({ status: 401, message: 'Unauthorized' })
    const store = useAuthStore()

    await store.ensureSession()

    expect(oldSessionSignal.aborted).toBe(true)
    expect(getSessionSignal().aborted).toBe(false)
  })

  it('logout resets the other stores too', async () => {
    storeToken()
    const adminStore = useAdminStore()
    adminStore.revenueData = [{ month: '2026-09', revenue: 1 }]
    const store = useAuthStore()

    await store.logout()

    expect(adminStore.revenueData).toEqual([])
  })

  it('a network error from /auth/me keeps the session', async () => {
    storeToken()
    authService.getMe.mockRejectedValue({ code: 'ERR_NETWORK', message: 'Network Error' })
    const store = useAuthStore()

    const user = await store.ensureSession()

    expect(store.isAuthenticated).toBe(true)
    expect(user).toMatchObject({ id: 42 })
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)).not.toBeNull()
  })

  it('fetchMe itself falls back to the JWT user on a server error', async () => {
    storeToken()
    authService.getMe.mockRejectedValue({ status: 500, message: 'Server error' })
    const store = useAuthStore()

    await expect(store.fetchMe()).rejects.toMatchObject({ status: 500 })
    expect(store.user).toMatchObject({ id: 42, email: null })
    expect(store.isAuthenticated).toBe(true)
  })

  it('fetchMe keeps an already loaded user on a server error', async () => {
    storeToken()
    const store = useAuthStore()
    store.setUser(ME)
    authService.getMe.mockRejectedValue({ status: 503, message: 'Unavailable' })

    await expect(store.fetchMe()).rejects.toMatchObject({ status: 503 })
    expect(store.user).toMatchObject({ email: ME.email, fullName: ME.fullName })
  })

  it('ensureSession without a cached user calls /auth/me', async () => {
    storeToken()
    authService.getMe.mockResolvedValue({ data: { data: ME } })
    const store = useAuthStore()

    const user = await store.ensureSession()

    expect(authService.getMe).toHaveBeenCalled()
    expect(user.fullName).toBe(ME.fullName)
    expect(store.sessionReady).toBe(true)
  })

  it.each([401, 404])(
    'a %s from /auth/me wipes storage, session storage and cookies',
    async (status) => {
      storeToken()
      sessionStorage.setItem('draft', 'x')
      authService.getMe.mockRejectedValue({ status, message: 'Unauthorized' })
      const store = useAuthStore()

      const user = await store.ensureSession()

      expect(user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(localStorage.length).toBe(0)
      expect(sessionStorage.length).toBe(0)
      expect(document.cookie).not.toContain('bkt_test')
    }
  )

  it('a server error from /auth/me keeps the session and falls back to the JWT', async () => {
    storeToken()
    authService.getMe.mockRejectedValue({ status: 500, message: 'Server error' })
    const store = useAuthStore()

    const user = await store.ensureSession()

    expect(store.isAuthenticated).toBe(true)
    expect(user).toMatchObject({ id: 42, email: null })
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)).not.toBeNull()
  })

  it('fetchMe rethrows a JWT error after clearing the session', async () => {
    storeToken()
    authService.getMe.mockRejectedValue({ status: 401, message: 'Unauthorized' })
    const store = useAuthStore()

    await expect(store.fetchMe()).rejects.toMatchObject({ status: 401 })
    expect(store.accessToken).toBeNull()
  })

  it('ensureSession reloads a cached user that has no email', async () => {
    storeToken()
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify({ sub: '42', role: 'customer' }))
    authService.getMe.mockResolvedValue({ data: { data: ME } })
    const store = useAuthStore()

    const user = await store.ensureSession()

    expect(authService.getMe).toHaveBeenCalled()
    expect(user.email).toBe(ME.email)
  })

  it('a user decoded from the JWT never uses the id as email', () => {
    const store = useAuthStore()

    store.setUser({ sub: '42', role: 'ADMIN' })

    expect(store.user).toMatchObject({ id: 42, email: null, role: 'admin' })
  })

  it('logout clears the whole client session', async () => {
    storeToken()
    sessionStorage.setItem('draft', 'x')
    const store = useAuthStore()

    await store.logout()

    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })
})
