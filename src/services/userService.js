import apiClient from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

export const userService = {
  getAll(params) {
    return apiClient.get(API_ENDPOINTS.USERS.BASE, { params })
  },
  getById(id) {
    return apiClient.get(API_ENDPOINTS.USERS.BY_ID(id))
  },
  getProfile() {
    return apiClient.get(API_ENDPOINTS.USERS.PROFILE)
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.USERS.BASE, payload)
  },
  updateProfile(payload) {
    return apiClient.put(API_ENDPOINTS.USERS.PROFILE, payload)
  },
  updateById(id, payload) {
    return apiClient.put(API_ENDPOINTS.USERS.BY_ID(id), payload)
  },
  deleteById(id) {
    return apiClient.delete(API_ENDPOINTS.USERS.BY_ID(id))
  },
}
