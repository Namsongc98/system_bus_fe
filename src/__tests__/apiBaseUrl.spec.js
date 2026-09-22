import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadConstants() {
  vi.resetModules()
  return import('@/constants/api_endpoint')
}

describe('API base URL', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('exposes a single base URL and no separate booking URL', async () => {
    const constants = await loadConstants()

    expect(constants).toHaveProperty('API_BASE_URL_SYSTEM')
    expect(constants).not.toHaveProperty('API_BASE_URL_BOOKING')
  })

  it('reads the Kong URL from VITE_KONG_API_URL', async () => {
    vi.stubEnv('VITE_KONG_API_URL', 'http://localhost:8000/api')
    const { API_BASE_URL_SYSTEM } = await loadConstants()

    expect(API_BASE_URL_SYSTEM).toBe('http://localhost:8000/api')
  })
})
