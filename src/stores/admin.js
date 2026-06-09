import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminService } from '@/services/adminService'

function getPayload(response) {
  return response?.data?.data ?? response?.data ?? null
}

function getCollection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.revenue)) return payload.revenue
  return []
}

export const useAdminStore = defineStore('admin', () => {
  const dashboardStats = ref(null)
  const revenueData = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pendingRequests = ref(0)

  function beginRequest() {
    pendingRequests.value += 1
    loading.value = true
    error.value = null
  }

  function finishRequest() {
    pendingRequests.value = Math.max(0, pendingRequests.value - 1)
    loading.value = pendingRequests.value > 0
  }

  function setRequestError(err) {
    error.value = err?.response?.data?.message || err?.message || 'Unable to load dashboard data'
  }

  async function fetchDashboard(params) {
    beginRequest()
    try {
      const response = await adminService.getDashboard(params)
      dashboardStats.value = getPayload(response)
      return dashboardStats.value
    } catch (err) {
      setRequestError(err)
      dashboardStats.value = null
      return null
    } finally {
      finishRequest()
    }
  }

  async function fetchRevenue(params) {
    beginRequest()
    try {
      const response = await adminService.getRevenue(params)
      const payload = getPayload(response)
      revenueData.value = getCollection(payload)
      return revenueData.value
    } catch (err) {
      setRequestError(err)
      revenueData.value = []
      return []
    } finally {
      finishRequest()
    }
  }

  async function fetchStats() {
    beginRequest()
    try {
      const response = await adminService.getStats()
      const payload = getPayload(response)
      dashboardStats.value = {
        ...(dashboardStats.value || {}),
        ...(payload || {}),
      }
      return dashboardStats.value
    } catch (err) {
      setRequestError(err)
      return null
    } finally {
      finishRequest()
    }
  }

  return { dashboardStats, revenueData, loading, error, fetchDashboard, fetchRevenue, fetchStats }
})
