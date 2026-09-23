import { describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAdminStore } from '@/stores/admin'
import { resetAllStores, resetStorePlugin } from '@/stores/plugins/resetStore'

function installPinia() {
  const pinia = createPinia()
  pinia.use(resetStorePlugin)
  createApp({}).use(pinia)
  return pinia
}

describe('resetStore plugin', () => {
  it('restores a setup store to its initial state', () => {
    const pinia = installPinia()
    setActivePinia(pinia)
    const adminStore = useAdminStore()
    adminStore.dashboardStats = { totalRevenue: 1 }
    adminStore.revenueData = [{ revenue: 1 }]

    resetAllStores(pinia)

    expect(adminStore.dashboardStats).toBeNull()
    expect(adminStore.revenueData).toEqual([])
  })

  it('resets only the stores of the given Pinia', () => {
    const first = installPinia()
    setActivePinia(first)
    const firstAdmin = useAdminStore()
    const second = installPinia()
    setActivePinia(second)
    const secondAdmin = useAdminStore()
    firstAdmin.dashboardStats = { totalRevenue: 1 }
    secondAdmin.dashboardStats = { totalRevenue: 2 }

    resetAllStores(first)

    expect(firstAdmin.dashboardStats).toBeNull()
    expect(secondAdmin.dashboardStats).toEqual({ totalRevenue: 2 })
  })

  it('skips the excluded store ids', () => {
    const pinia = installPinia()
    setActivePinia(pinia)
    const adminStore = useAdminStore()
    adminStore.dashboardStats = { totalRevenue: 1 }

    resetAllStores(pinia, ['admin'])

    expect(adminStore.dashboardStats).toEqual({ totalRevenue: 1 })
  })
})
