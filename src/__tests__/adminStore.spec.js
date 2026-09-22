import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAdminStore } from '@/stores/admin'
import { adminService } from '@/services/adminService'

vi.mock('@/services/adminService', () => ({
  adminService: {
    getDashboard: vi.fn(),
    getRevenue: vi.fn(),
  },
}))

describe('admin store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('stores the documented dashboard payload', async () => {
    adminService.getDashboard.mockResolvedValue({
      data: { kpis: { totalRevenue: 125500000 } },
    })
    const store = useAdminStore()

    await store.fetchDashboard()

    expect(adminService.getDashboard).toHaveBeenCalledOnce()
    expect(store.dashboard).toEqual({ kpis: { totalRevenue: 125500000 } })
    expect(store.dashboardLoading).toBe(false)
  })

  it('stores revenue trend independently from dashboard state', async () => {
    adminService.getRevenue.mockResolvedValue({
      data: [{ label: 'JAN', amount: 1000 }],
    })
    const store = useAdminStore()
    store.dashboard = { kpis: { totalRevenue: 500 } }

    await store.fetchRevenue({ period: 'monthly' })

    expect(adminService.getRevenue).toHaveBeenCalledWith({ period: 'monthly' })
    expect(store.revenueTrend).toEqual([{ label: 'JAN', amount: 1000 }])
    expect(store.dashboard).toEqual({ kpis: { totalRevenue: 500 } })
    expect(store.revenueLoading).toBe(false)
  })

  it('keeps revenue data when the dashboard request fails', async () => {
    adminService.getDashboard.mockRejectedValue(new Error('Dashboard unavailable'))
    const store = useAdminStore()
    store.revenueTrend = [{ label: 'JAN', amount: 1000 }]

    await expect(store.fetchDashboard()).rejects.toThrow('Dashboard unavailable')

    expect(store.dashboardError).toBe('Dashboard unavailable')
    expect(store.dashboard).toBeNull()
    expect(store.revenueTrend).toEqual([{ label: 'JAN', amount: 1000 }])
  })

  it('keeps dashboard data when the revenue request fails', async () => {
    adminService.getRevenue.mockRejectedValue(new Error('Revenue unavailable'))
    const store = useAdminStore()
    store.dashboard = { kpis: { ticketsSold: 10 } }

    await expect(store.fetchRevenue({ period: 'weekly' })).rejects.toThrow('Revenue unavailable')

    expect(store.revenueError).toBe('Revenue unavailable')
    expect(store.revenueTrend).toEqual([])
    expect(store.dashboard).toEqual({ kpis: { ticketsSold: 10 } })
  })
})
