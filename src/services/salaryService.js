import apiClient from './axios'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

export const getSalaries = async (params) => {
  try {
    const res = await apiClient.get(API_ENDPOINTS.SALARY.BASE, { params })
    return res.data
  } catch (error) {
    const message = error.response?.data?.message || 'Unexpected error'
    throw {
      code: error.response?.data?.code || 500,
      message,
    }
  }
}

export const calculateSalary = async (payload) => {
  try {
    const res = await apiClient.post(API_ENDPOINTS.SALARY.CALCULATE, payload)
    return res.data
  } catch (error) {
    const message = error.response?.data?.message || 'Unexpected error'
    throw {
      code: error.response?.data?.code || 500,
      message,
    }
  }
}

export const getBaseSalaries = async () => {
  try {
    const res = await apiClient.get(API_ENDPOINTS.SALARY.BASE_SALARY)
    return res.data
  } catch (error) {
    const message = error.response?.data?.message || 'Unexpected error'
    throw {
      code: error.response?.data?.code || 500,
      message,
    }
  }
}
