import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTE_NAMES } from '@/constants/routes'

const clearSession = vi.fn()
const push = vi.fn()
const currentRoute = { value: { name: ROUTE_NAMES.TRIP_VIEW } }

vi.mock('@/router', () => ({ default: { push, currentRoute } }))
vi.mock('@/stores/auth', () => ({ useAuthStore: () => ({ clearSession }) }))

const {
  default: apiClient,
  SESSION_ENDED_MESSAGE,
  ACCOUNT_LOCKED_MESSAGE,
} = await import('@/services/axios')
const { abortSessionRequests } = await import('@/services/sessionAbort')

function rejectWith(url, status) {
  const onRejected = apiClient.interceptors.response.handlers[0].rejected
  return onRejected({ config: { url }, response: { status, data: { status, message: 'x' } } })
}

describe('apiClient 401 handling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentRoute.value = { name: ROUTE_NAMES.TRIP_VIEW }
  })

  it('a 401 from a normal API clears the whole session and goes to login', async () => {
    await expect(rejectWith('/trip/scheduled', 401)).rejects.toMatchObject({ status: 401 })

    expect(clearSession).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith({ name: ROUTE_NAMES.LOGIN })
  })

  it('does not push login again when already on the login page', async () => {
    currentRoute.value = { name: ROUTE_NAMES.LOGIN }

    await expect(rejectWith('/trip/scheduled', 401)).rejects.toBeDefined()

    expect(clearSession).toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('a 401 from /auth/login is left to the login form', async () => {
    await expect(rejectWith('/auth/login', 401)).rejects.toBeDefined()

    expect(clearSession).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('a 401 from /auth/register is left to the register form', async () => {
    await expect(rejectWith('/auth/register', 401)).rejects.toBeDefined()

    expect(clearSession).not.toHaveBeenCalled()
  })

  it.each(['/auth/update-password', '/auth/me'])(
    'a 401 from %s is a JWT error: clears the session and goes to login',
    async (url) => {
      await expect(rejectWith(url, 401)).rejects.toMatchObject({ status: 401 })

      expect(clearSession).toHaveBeenCalled()
      expect(push).toHaveBeenCalledWith({ name: ROUTE_NAMES.LOGIN })
    }
  )

  it('a network error without a response keeps the session', async () => {
    const onRejected = apiClient.interceptors.response.handlers[0].rejected
    const networkError = { config: { url: '/trip/scheduled' }, code: 'ERR_NETWORK' }

    await expect(onRejected(networkError)).rejects.toBe(networkError)

    expect(clearSession).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('a response that arrives after the session ends is rejected, not delivered', async () => {
    let respond
    const adapter = (config) =>
      new Promise((resolve) => {
        respond = () => resolve({ data: { data: 'old account' }, status: 200, headers: {}, config })
      })

    const request = apiClient.get('/admin/revenue', { adapter })
    await vi.waitFor(() => expect(respond).toBeTypeOf('function'))
    abortSessionRequests()
    respond()

    // Callers toast err.message: it must explain the session ended, not say "canceled".
    await expect(request).rejects.toMatchObject({
      name: 'CanceledError',
      message: SESSION_ENDED_MESSAGE,
    })
    expect(clearSession).not.toHaveBeenCalled()
  })

  it('requests sent after the session ends use a fresh signal', async () => {
    abortSessionRequests()
    const adapter = (config) =>
      Promise.resolve({ data: { data: 'new account' }, status: 200, headers: {}, config })

    const response = await apiClient.get('/admin/revenue', { adapter })

    expect(response.data.data).toBe('new account')
  })

  it('a 403 does not end the session', async () => {
    await expect(rejectWith('/bus', 403)).rejects.toBeDefined()

    expect(clearSession).not.toHaveBeenCalled()
  })

  it('a 403 "account locked" ends the session like a 401 (task 1.2 D3)', async () => {
    const onRejected = apiClient.interceptors.response.handlers[0].rejected
    const data = { status: 403, message: ACCOUNT_LOCKED_MESSAGE }

    await expect(
      onRejected({ config: { url: '/user' }, response: { status: 403, data } })
    ).rejects.toMatchObject(data)

    expect(clearSession).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith({ name: ROUTE_NAMES.LOGIN })
  })

  it('a 403 "account locked" from /auth/login is left to the login form', async () => {
    const onRejected = apiClient.interceptors.response.handlers[0].rejected
    const data = { status: 403, message: ACCOUNT_LOCKED_MESSAGE }

    await expect(
      onRejected({ config: { url: '/auth/login' }, response: { status: 403, data } })
    ).rejects.toMatchObject({ message: ACCOUNT_LOCKED_MESSAGE })

    expect(clearSession).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })
})
