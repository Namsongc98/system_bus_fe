import apiClient from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

export const tripService = {
  search(params) {
    return apiClient.get(API_ENDPOINTS.TRIPS.SEARCH, { params })
  },
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
  complete(id) {
    return apiClient.put(API_ENDPOINTS.TRIPS.COMPLETE(id))
  },
  remove(id) {
    return apiClient.delete(API_ENDPOINTS.TRIPS.BY_ID(id))
  },
}
