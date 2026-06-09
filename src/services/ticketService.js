import apiClient from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

export const ticketService = {
  getAll(params) {
    return apiClient.get(API_ENDPOINTS.TICKETS.BASE, { params })
  },
  getMyTickets(p) {
    return apiClient.get(API_ENDPOINTS.TICKETS.MINE, { params: p })
  },
  getById(id) {
    return apiClient.get(API_ENDPOINTS.TICKETS.BY_ID(id))
  },
  create(payload) {
    return apiClient.post(API_ENDPOINTS.TICKETS.BASE, payload)
  },
  book(payload) {
    return apiClient.post(API_ENDPOINTS.TICKETS.BASE, payload)
  },
  cancel(id) {
    return apiClient.patch(`${API_ENDPOINTS.TICKETS.BY_ID(id)}/cancel`)
  },
}
