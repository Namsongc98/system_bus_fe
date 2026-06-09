// ─── API Endpoint Constants ───────────────────────────────────────────────────
export const API_BASE_URL_SYSTEM =
  import.meta.env.VITE_API_BASE_URL_SYSTEM || 'http://localhost:8002/api'
export const API_BASE_URL_BOOKING =
  import.meta.env.VITE_API_BASE_URL_BOOKING || 'http://localhost:8001/api'

export const API_ENDPOINTS = Object.freeze({
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    UPDATE_PASSWORD: '/auth/update-password',
  },

  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    PROFILE: '/users/profile',
  },

  BOOKING: {
    BASE: '/booking',
  },

  TRIPS: {
    BASE: '/trips',
    BY_ID: (id) => `/trips/${id}`,
    SEARCH: '/trips/search',
    COMPLETE: (id) => `/trips/${id}/complete`,
  },

  SEATS: {
    BY_TRIP: (tripId) => `/trips/${tripId}/seats`,
    BY_ID: (id) => `/seats/${id}`,
  },

  TICKETS: {
    BASE: '/tickets',
    BY_ID: (id) => `/tickets/${id}`,
    MINE: '/tickets/my',
  },

  PAYMENTS: {
    BASE: '/payments',
    BY_ID: (id) => `/payments/${id}`,
    QR: (ticketId) => `/payments/${ticketId}/qr`,
    CONFIRM: (id) => `/payments/${id}/confirm`,
  },

  BUSES: {
    BASE: '/buses',
    BY_ID: (id) => `/buses/${id}`,
  },

  ROUTES: {
    BASE: '/routes',
    BY_ID: (id) => `/routes/${id}`,
  },

  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    REVENUE: '/admin/revenue',
    STATS: '/admin/stats',
  },

  REVENUE: {
    REPORT: '/revenue/report',
    BY_ROUTE: '/revenue/by-route',
    BY_DATE: '/revenue/by-date',
    TOP_CUSTOMERS: '/revenue/top-customers',
  },

  LOYALTY_POINTS: {
    BASE: '/loyalty-points',
    EARN: '/loyalty-points/earn',
    REDEEM: '/loyalty-points/redeem',
  },

  LOYALTY_REWARDS: {
    BASE: '/loyalty-rewards',
  },

  SALARY: {
    BASE: '/salary',
    CALCULATE: '/salary/calculate',
    BASE_SALARY: '/base-salary',
  },
})
/**
 * Base API URL — pulled from Vite environment variables.
 * Define VITE_API_BASE_URL in your .env file.
 */

export const API_TIMEOUT = 15_000 // 15 seconds
