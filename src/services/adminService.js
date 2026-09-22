import apiClient from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

export const adminService = {
  async getDashboard() {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD)
    return response.data
  },
  async getRevenue(params) {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.REVENUE, { params })
    return response.data
  },
}
