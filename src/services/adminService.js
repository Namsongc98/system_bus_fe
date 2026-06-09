import apiClient from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

export const adminService = {
  getDashboard() {
    return apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD)
  },
  getStats() {
    return apiClient.get(API_ENDPOINTS.ADMIN.STATS)
  },
  getRevenue(params) {
    return apiClient.get(API_ENDPOINTS.ADMIN.REVENUE, { params })
  },
}
