import axios from 'axios'
import { LOCAL_STORAGE_KEYS } from '@/constants'
import { getStorage } from '@/utils/storage'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { getSessionSignal } from '@/services/sessionAbort'
import { ROUTE_NAMES } from '@/constants/routes'
import { API_BASE_URL_SYSTEM, API_BASE_URL_BOOKING, API_ENDPOINTS } from '@/constants/api_endpoint'

// A 401 here means wrong credentials, not an expired session: the form shows the error.
const CREDENTIAL_ENDPOINTS = [API_ENDPOINTS.AUTH.LOGIN, API_ENDPOINTS.AUTH.REGISTER]

// Shown instead of axios' raw "canceled" when a request dies with the session.
export const SESSION_ENDED_MESSAGE = 'Phiên đăng nhập đã kết thúc, vui lòng đăng nhập lại.'

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
      // Cancelled when the session ends (see sessionAbort.js).
      config.signal ??= getSessionSignal()
      return config
    },
    (error) => Promise.reject(error)
  )

  // Unwrap data, handle 401
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Cancelled by abortSessionRequests(): callers that toast err.message show a clear reason.
      if (axios.isCancel(error)) {
        error.message = SESSION_ENDED_MESSAGE
        return Promise.reject(error)
      }

      const isCredentialEndpoint = CREDENTIAL_ENDPOINTS.includes(error.config?.url)
      if (error.response?.status === 401 && !isCredentialEndpoint) {
        // JWT rejected: wipe the whole client session and send the user to log in again.
        useAuthStore().clearSession()
        if (router.currentRoute.value?.name !== ROUTE_NAMES.LOGIN) {
          router.push({ name: ROUTE_NAMES.LOGIN })
        }
      }
      return Promise.reject(error.response?.data ?? error)
    }
  )

  return client
}

// ─── Manage Revenue Service — http://localhost:8082 ──────────────────────────
const apiClient = createClient(API_BASE_URL_SYSTEM)

// ─── Booking Service — http://localhost:8081 ─────────────────────────────────
export const bookingClient = createClient(API_BASE_URL_BOOKING)

export default apiClient
