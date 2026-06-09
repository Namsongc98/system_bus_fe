import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAdminStore } from '@/stores/admin'
import { adminService } from '@/services/adminService'

vi.mock('@/services/adminService', () => ({
  adminService: {
    getDashboard: vi.fn(),
    getStats: vi.fn(),
    getRevenue: vi.fn(),
  },
}))

describe('admin store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchDashboard calls adminService.getDashboard and sets dashboardStats', async () => {
    adminService.getDashboard.mockResolvedValue({
      data: { data: { totalRevenue: 125500000 } },
    })
    const store = useAdminStore()

    await store.fetchDashboard()

    expect(adminService.getDashboard).toHaveBeenCalled()
    expect(store.dashboardStats).toEqual({ totalRevenue: 125500000 })
    expect(store.loading).toBe(false)
  })

  it('fetchStats calls adminService.getStats and merges dashboard stats', async () => {
    adminService.getStats.mockResolvedValue({
      data: { data: { ticketsSold: 8450 } },
    })
    const store = useAdminStore()
    store.dashboardStats = { totalRevenue: 125500000 }

    await store.fetchStats()

    expect(adminService.getStats).toHaveBeenCalled()
    expect(store.dashboardStats).toEqual({ totalRevenue: 125500000, ticketsSold: 8450 })
  })

  it('fetchRevenue calls adminService.getRevenue and sets revenueData', async () => {
    adminService.getRevenue.mockResolvedValue({
      data: { data: [{ month: 'JAN', revenue: 1000 }] },
    })
    const store = useAdminStore()

    await store.fetchRevenue({ period: 'monthly' })

    expect(adminService.getRevenue).toHaveBeenCalledWith({ period: 'monthly' })
    expect(store.revenueData).toEqual([{ month: 'JAN', revenue: 1000 }])
  })

  it('keeps the page safe on API failure', async () => {
    adminService.getDashboard.mockRejectedValue(new Error('Network down'))
    const store = useAdminStore()

    await expect(store.fetchDashboard()).resolves.toBeNull()

    expect(store.error).toBe('Network down')
    expect(store.loading).toBe(false)
    expect(store.dashboardStats).toBeNull()
  })
})
