import apiClient from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

export const getMyPoints = async () => {
  try {
    const res = await apiClient.get(API_ENDPOINTS.LOYALTY_POINTS.BASE)
    return res.data
  } catch (error) {
    const message = error.response?.data?.message || 'Unexpected error'
    throw {
      code: error.response?.data?.code || 500,
      message,
    }
  }
}

export const earnPoints = async (payload) => {
  try {
    const res = await apiClient.post(API_ENDPOINTS.LOYALTY_POINTS.EARN, payload)
    return res.data
  } catch (error) {
    const message = error.response?.data?.message || 'Unexpected error'
    throw {
      code: error.response?.data?.code || 500,
      message,
    }
  }
}

export const redeemPoints = async (payload) => {
  try {
    const res = await apiClient.post(API_ENDPOINTS.LOYALTY_POINTS.REDEEM, payload)
    return res.data
  } catch (error) {
    const message = error.response?.data?.message || 'Unexpected error'
    throw {
      code: error.response?.data?.code || 500,
      message,
    }
  }
}

export const getLoyaltyRewards = async () => {
  try {
    const res = await apiClient.get(API_ENDPOINTS.LOYALTY_REWARDS.BASE)
    return res.data
  } catch (error) {
    const message = error.response?.data?.message || 'Unexpected error'
    throw {
      code: error.response?.data?.code || 500,
      message,
    }
  }
}
