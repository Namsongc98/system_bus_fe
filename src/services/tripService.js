import apiClient from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

// Admin trip management (/api/trip, ADMIN only, task 1.3).
export const tripService = {
  getAll(params) {
    return apiClient.get(API_ENDPOINTS.TRIPS.BASE, { params })
  },
  getById(id) {
    return apiClient.get(API_ENDPOINTS.TRIPS.BY_ID(id))
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.TRIPS.BASE, payload)
  },
  update(id, payload) {
    return apiClient.put(API_ENDPOINTS.TRIPS.BY_ID(id), payload)
  },
  updateStatus(id, status) {
    return apiClient.patch(API_ENDPOINTS.TRIPS.STATUS(id), { status })
  },
  remove(id) {
    return apiClient.delete(API_ENDPOINTS.TRIPS.BY_ID(id))
  },
  // Customer trip search — BE: missing (2.1).
  search(params) {
    return apiClient.get(API_ENDPOINTS.TRIPS.SEARCH, { params })
  },
}
