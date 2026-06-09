import apiClient from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

export const authService = {
  login(credentials) {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
  },
  register(payload) {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, payload)
  },
  logout() {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT)
  },
  getMe() {
    return apiClient.get(API_ENDPOINTS.AUTH.ME)
  },
  refreshToken(body) {
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH, body)
  },
  updatePassword(payload) {
    return apiClient.put(API_ENDPOINTS.AUTH.UPDATE_PASSWORD, payload)
  },
}
