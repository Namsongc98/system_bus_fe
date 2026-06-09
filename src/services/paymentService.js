import apiClient from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

export const paymentService = {
  getQRCode(ticketId) {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.QR(ticketId))
  },
  confirmPayment(id) {
    return apiClient.post(API_ENDPOINTS.PAYMENTS.CONFIRM(id))
  },
  getById(id) {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.BY_ID(id))
  },
}
