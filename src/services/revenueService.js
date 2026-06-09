import apiClient from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

export const getRevenueReport = async (params) => {
  try {
    const res = await apiClient.get(API_ENDPOINTS.REVENUE.REPORT, { params })
    return res.data
  } catch (error) {
    const message = error.response?.data?.message || 'Unexpected error'
    throw {
      code: error.response?.data?.code || 500,
      message,
    }
  }
}

export const getRevenueByRoute = async (params) => {
  try {
    const res = await apiClient.get(API_ENDPOINTS.REVENUE.BY_ROUTE, { params })
    return res.data
  } catch (error) {
    const message = error.response?.data?.message || 'Unexpected error'
    throw {
      code: error.response?.data?.code || 500,
      message,
    }
  }
}

export const getRevenueByDate = async (params) => {
  try {
    const res = await apiClient.get(API_ENDPOINTS.REVENUE.BY_DATE, { params })
    return res.data
  } catch (error) {
    const message = error.response?.data?.message || 'Unexpected error'
    throw {
      code: error.response?.data?.code || 500,
      message,
    }
  }
}

export const getTopCustomers = async (params) => {
  try {
    const res = await apiClient.get(API_ENDPOINTS.REVENUE.TOP_CUSTOMERS, { params })
    return res.data
  } catch (error) {
    const message = error.response?.data?.message || 'Unexpected error'
    throw {
      code: error.response?.data?.code || 500,
      message,
    }
  }
}
