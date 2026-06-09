import apiClient from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

export const seatService = {
  getByTrip(tripId) {
    return apiClient.get(API_ENDPOINTS.SEATS.BY_TRIP(tripId))
  },
  getById(id) {
    return apiClient.get(API_ENDPOINTS.SEATS.BY_ID(id))
  },
}
