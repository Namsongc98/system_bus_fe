import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService } from '@/services/adminService'

export const useAdminStore = defineStore('admin', () => {
  const dashboard = ref(null)
  const revenueTrend = ref([])
  const dashboardLoading = ref(false)
  const revenueLoading = ref(false)
  const dashboardError = ref(null)
  const revenueError = ref(null)

  async function fetchDashboard() {
    dashboardLoading.value = true
    dashboardError.value = null
    try {
      const response = await adminService.getDashboard()
      dashboard.value = response?.data ?? null
      return dashboard.value
    } catch (err) {
      dashboardError.value = err?.message || 'Unable to load dashboard data'
      dashboard.value = null
      throw err
    } finally {
      dashboardLoading.value = false
    }
  }

  async function fetchRevenue(params) {
    revenueLoading.value = true
    revenueError.value = null
    try {
      const response = await adminService.getRevenue(params)
      revenueTrend.value = Array.isArray(response?.data) ? response.data : []
      return revenueTrend.value
    } catch (err) {
      revenueError.value = err?.message || 'Unable to load revenue trend'
      revenueTrend.value = []
      throw err
    } finally {
      revenueLoading.value = false
    }
  }

  return {
    dashboard,
    revenueTrend,
    dashboardLoading,
    revenueLoading,
    dashboardError,
    revenueError,
    fetchDashboard,
    fetchRevenue,
  }
})
