// ─── API Base URL ─────────────────────────────────────────────────────────────
// Every request goes through the Kong gateway (e.g. http://localhost:8000/api), which routes
// /api/booking to the booking service and the rest of /api to manage-revenue.
// Required: no fallback, so a missing value fails at startup instead of calling the wrong host.
export const API_BASE_URL_SYSTEM = import.meta.env.VITE_KONG_API_URL
if (!API_BASE_URL_SYSTEM) {
  throw new Error(
    'VITE_KONG_API_URL is not set. Point it at the Kong gateway, e.g. http://localhost:8000/api'
  )
}

// ─── API Endpoint Constants ───────────────────────────────────────────────────
// Each entry names the BE handler it hits (manage-revenue-ticket controllers unless noted), or
// `BE: missing (task)` from .claude/docs/plan/screen-feature-plan.md. A path whose BE is missing
// keeps its old FE shape; the task that builds the endpoint fixes the path.

export const API_ENDPOINTS = Object.freeze({
  AUTH: {
    LOGIN: '/auth/login', // POST ✓ AuthController.java:64
    REGISTER: '/auth/register', // POST ✓ AuthController.java:32
    LOGOUT: '/auth/logout', // POST BE: missing (logout only clears the FE token)
    REFRESH: '/auth/refresh', // POST BE: missing (Phase 4)
    ME: '/auth/me', // GET ✓ AuthController.java:56
    UPDATE_PASSWORD: '/auth/update-password', // PUT ✓ AuthController.java:47
  },

  USERS: {
    BASE: '/users', // GET, POST BE: missing (1.2)
    BY_ID: (id) => `/users/${id}`, // GET, PUT, DELETE BE: missing (1.2)
    PROFILE: '/users/profile', // GET, PUT BE: missing (4.1)
  },

  BOOKING: {
    BASE: '/booking', // POST ✓ booking_ticket BookingController.java:16 (Kong → booking service)
  },

  TRIPS: {
    BASE: '/trip', // POST ✓ TripController.java:26 · GET list BE: missing (1.3)
    BY_ID: (id) => `/trip/${id}`, // PUT ✓ TripController.java:45 · GET, DELETE BE: missing (1.3)
    SEARCH: '/trips/search', // GET BE: missing (2.1)
    COMPLETE: (id) => `/trips/${id}/complete`, // PUT BE: missing (1.3)
  },

  SEATS: {
    BY_TRIP: (tripId) => `/trips/${tripId}/seats`, // GET BE: missing (2.2)
    BY_ID: (id) => `/seats/${id}`, // GET BE: missing
  },

  TICKETS: {
    BASE: '/ticket', // POST ✓ TicketController.java:44 (ADMIN) · GET list BE: missing (4.2)
    BY_ID: (id) => `/tickets/${id}`, // GET, PATCH …/cancel BE: missing (2.3, 2.4)
    MINE: '/tickets/my', // GET BE: missing (2.4)
  },

  PAYMENTS: {
    BASE: '/payments', // BE: missing (2.3)
    BY_ID: (id) => `/payments/${id}`, // GET BE: missing (2.3)
    QR: (ticketId) => `/payments/${ticketId}/qr`, // GET BE: missing (2.3)
    CONFIRM: (id) => `/payments/${id}/confirm`, // POST BE: missing (2.3)
  },

  BUSES: {
    BASE: '/bus', // GET ✓ BusController.java:27 (?status&page&size), POST ✓ BusController.java:43
    BY_ID: (id) => `/bus/${id}`, // GET ✓ BusController.java:37, PUT ✓ :51, DELETE ✓ :58
  },

  ROUTES: {
    BASE: '/route', // GET ✓ RouteController.java:31 (?status&page&size), POST ✓ RouteController.java:47
    BY_ID: (id) => `/route/${id}`, // GET ✓ RouteController.java:41, PUT ✓ :56, DELETE ✓ :64
  },

  ADMIN: {
    DASHBOARD: '/admin/dashboard', // GET ✓ AdminDashboardController.java:27
    REVENUE: '/admin/revenue', // GET ✓ AdminDashboardController.java:37
    STATS: '/admin/stats', // GET BE: missing
  },

  REVENUE: {
    REPORT: '/revenue/report', // GET ✓ RevenueController.java:86
    BY_ROUTE: '/revenue/by-route', // GET ✓ RevenueController.java:93
    BY_DATE: '/revenue/by-date', // GET ✓ RevenueController.java:100
    TOP_CUSTOMERS: '/revenue/top-customers', // GET ✓ RevenueController.java:107
  },

  LOYALTY_POINTS: {
    BASE: '/loyalty-points', // GET BE: missing (4.3)
    EARN: '/loyalty-points/earn', // POST BE: missing (4.3)
    REDEEM: '/loyalty-points/redeem', // POST BE: missing (4.3)
  },

  LOYALTY_REWARDS: {
    BASE: '/loyalty-rewards', // GET BE: missing (4.3)
  },

  SALARY: {
    BASE: '/salary', // GET ✓ SalaryController.java:35 — month, year required
    CALCULATE: '/salary/calculate', // POST BE: missing (4.4)
    BASE_SALARY: '/base_salary', // GET ✓ BaseSalaryController.java:39 — no BaseResponseDto envelope
  },
})

export const API_TIMEOUT = 15_000 // 15 seconds
