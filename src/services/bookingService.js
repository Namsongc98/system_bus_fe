import { bookingClient } from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

export const createBooking = async (payload) => {
  try {
    const res = await bookingClient.post(API_ENDPOINTS.BOOKING.BASE, payload)
    return res.data
  } catch (error) {
    const message = error?.message || 'Unexpected error'
    throw {
      code: error?.code || 500,
      message,
    }
  }
}
