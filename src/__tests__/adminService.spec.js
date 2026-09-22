import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from '@/services/axios'
import { adminService } from '@/services/adminService'

vi.mock('@/services/axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requests the dashboard endpoint and returns the response body', async () => {
    apiClient.get.mockResolvedValue({ data: { status: 200, data: { kpis: {} } } })

    const response = await adminService.getDashboard()

    expect(apiClient.get).toHaveBeenCalledWith('/admin/dashboard')
    expect(response).toEqual({ status: 200, data: { kpis: {} } })
  })

  it('passes the revenue period query', async () => {
    apiClient.get.mockResolvedValue({ data: { status: 200, data: [] } })

    const response = await adminService.getRevenue({ period: 'weekly' })

    expect(apiClient.get).toHaveBeenCalledWith('/admin/revenue', {
      params: { period: 'weekly' },
    })
    expect(response).toEqual({ status: 200, data: [] })
  })
})
