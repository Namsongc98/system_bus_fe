import axios from 'axios'
import { LOCAL_STORAGE_KEYS } from '@/constants'
import { getStorage, removeStorage } from '@/utils/storage'
import router from '@/router'
import { ROUTE_NAMES } from '@/constants/routes'
import { API_BASE_URL_SYSTEM } from '@/constants/api_endpoint'

// ─── Shared factory ───────────────────────────────────────────────────────────
function createClient(baseURL) {
  const client = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  // Attach JWT
  client.interceptors.request.use(
    (config) => {
      const token = getStorage(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    },
    (error) => Promise.reject(error)
  )

  // Unwrap data, handle 401
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const isAuthEndpoint = error.config?.url?.includes('/auth/')
      if (error.response?.status === 401 && !isAuthEndpoint) {
        removeStorage(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)
        removeStorage(LOCAL_STORAGE_KEYS.USER)
        router.push({ name: ROUTE_NAMES.LOGIN })
      }
      console.log(error)
      return Promise.reject(error.response?.data ?? error)
    }
  )

  return client
}

// ─── Single client — every service is reached through Kong (API_BASE_URL_SYSTEM) ──
// Kong routes /api/booking -> booking service and /api/* -> manage-revenue service.
const apiClient = createClient(API_BASE_URL_SYSTEM)

export default apiClient
