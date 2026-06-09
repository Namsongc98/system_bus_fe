import apiClient from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

// ─── Bus Service ──────────────────────────────────────────────────────────────
export const busService = {
  getAll(params) {
    return apiClient.get(API_ENDPOINTS.BUSES.BASE, { params })
  },
  getById(id) {
    return apiClient.get(API_ENDPOINTS.BUSES.BY_ID(id))
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.BUSES.BASE, payload)
  },
  update(id, payload) {
    return apiClient.put(API_ENDPOINTS.BUSES.BY_ID(id), payload)
  },
  remove(id) {
    return apiClient.delete(API_ENDPOINTS.BUSES.BY_ID(id))
  },
}

// ─── Route Service ────────────────────────────────────────────────────────────
export const routeService = {
  getAll(params) {
    return apiClient.get(API_ENDPOINTS.ROUTES.BASE, { params })
  },
  getById(id) {
    return apiClient.get(API_ENDPOINTS.ROUTES.BY_ID(id))
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.ROUTES.BASE, payload)
  },
  update(id, payload) {
    return apiClient.put(API_ENDPOINTS.ROUTES.BY_ID(id), payload)
  },
  remove(id) {
    return apiClient.delete(API_ENDPOINTS.ROUTES.BY_ID(id))
  },
}
