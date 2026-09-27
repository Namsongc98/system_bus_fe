import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/router', () => ({ default: { push: vi.fn(), currentRoute: { value: {} } } }))
vi.mock('@/stores/auth', () => ({ useAuthStore: () => ({ clearSession: vi.fn() }) }))

const KONG_URL = 'http://localhost:8000/api'

describe('single Kong API client', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('points apiClient at VITE_KONG_API_URL', async () => {
    vi.stubEnv('VITE_KONG_API_URL', KONG_URL)
    const { default: apiClient } = await import('@/services/axios')

    expect(apiClient.defaults.baseURL).toBe(KONG_URL)
  })

  it('exposes no separate booking client or booking base URL', async () => {
    const axiosModule = await import('@/services/axios')
    const endpoints = await import('@/constants/api_endpoint')

    expect(axiosModule).not.toHaveProperty('bookingClient')
    expect(endpoints).not.toHaveProperty('API_BASE_URL_BOOKING')
  })

  it('fails at startup when VITE_KONG_API_URL is missing', async () => {
    vi.stubEnv('VITE_KONG_API_URL', '')

    await expect(import('@/constants/api_endpoint')).rejects.toThrow('VITE_KONG_API_URL is not set')
  })

  it('sends bookings through the same Kong client', async () => {
    const { default: apiClient } = await import('@/services/axios')
    const { createBooking } = await import('@/services/bookingService')
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: { id: 1 } })
    const payload = { tripId: 7, seatNumber: 3 }

    await expect(createBooking(payload)).resolves.toEqual({ id: 1 })
    expect(post).toHaveBeenCalledWith('/booking', payload)
  })
})
