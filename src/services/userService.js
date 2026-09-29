import apiClient from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

// Admin user management (/api/user, ADMIN only). There is no delete: accounts are locked instead.
export const userService = {
  getAll(params) {
    return apiClient.get(API_ENDPOINTS.USERS.BASE, { params })
  },
  getCounts() {
    return apiClient.get(API_ENDPOINTS.USERS.COUNTS)
  },
  getById(id) {
    return apiClient.get(API_ENDPOINTS.USERS.BY_ID(id))
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.USERS.BASE, payload)
  },
  update(id, payload) {
    return apiClient.put(API_ENDPOINTS.USERS.BY_ID(id), payload)
  },
  setStatus(id, active) {
    return apiClient.put(API_ENDPOINTS.USERS.STATUS(id), { active })
  },
  // Current user's own profile — BE: missing (4.1).
  getProfile() {
    return apiClient.get(API_ENDPOINTS.USERS.PROFILE)
  },
  updateProfile(payload) {
    return apiClient.put(API_ENDPOINTS.USERS.PROFILE, payload)
  },
}
