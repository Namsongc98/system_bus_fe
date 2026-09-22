// ─── API Endpoint Constants ───────────────────────────────────────────────────
// Every request goes through the Kong gateway (proxy :8000), never straight to
// the services (8081/8082). Kong routes /api/booking -> booking service and
// /api/* -> manage-revenue service (ticket-system/Infrastructure/kong/kong.yml).
// One base URL for every service; :8001 is the Kong Admin API, do not use it.
export const API_BASE_URL_SYSTEM = import.meta.env.VITE_KONG_API_URL

// Paths below are appended to API_BASE_URL_SYSTEM (".../api"), so '/bus' -> /api/bus.
// Each entry names the BE mapping it hits (MR = manage-revenue-ticket controller,
// BK = booking_ticket controller) or `BE: missing (task)` from
// .claude/docs/plan/screen-feature-plan.md. A constant shared by several HTTP
// methods points at the BE resource when at least one of those methods exists;
// methods BE lacks are listed as missing and return 405 until their task lands.
export const API_ENDPOINTS = Object.freeze({
  AUTH: {
    LOGIN: '/auth/login', // POST ✓ MR AuthController.java:65
    REGISTER: '/auth/register', // POST ✓ MR AuthController.java:38
    LOGOUT: '/auth/logout', // POST BE: missing (JWT stateless — FE clears token)
    REFRESH: '/auth/refresh', // POST BE: missing (Phase 4)
    ME: '/auth/me', // GET BE: missing (0.6)
    UPDATE_PASSWORD: '/auth/update-password', // PUT ✓ MR AuthController.java:52
  },

  USERS: {
    BASE: '/users', // GET, POST BE: missing (1.2) — UserController is empty
    BY_ID: (id) => `/users/${id}`, // GET, PUT, DELETE BE: missing (1.2)
    PROFILE: '/users/profile', // GET, PUT BE: missing (4.1)
  },

  BOOKING: {
    BASE: '/booking', // POST ✓ BK BookingController.java:16 (Kong booking-route)
  },

  TRIPS: {
    BASE: '/trip', // POST ✓ MR TripController.java:24 · GET list BE: missing (1.3; only /trip/scheduled at :30)
    BY_ID: (id) => `/trip/${id}`, // PUT ✓ MR TripController.java:41 · GET, DELETE BE: missing (1.3)
    SEARCH: '/trips/search', // GET BE: missing (2.1)
    COMPLETE: (id) => `/trips/${id}/complete`, // PUT BE: missing (1.3 plans PATCH /trip/{id}/status)
  },

  SEATS: {
    BY_TRIP: (tripId) => `/trips/${tripId}/seats`, // GET BE: missing (2.2)
    BY_ID: (id) => `/seats/${id}`, // GET BE: missing (no plan task)
  },

  TICKETS: {
    BASE: '/ticket', // POST ✓ MR TicketController.java:37 · GET list BE: missing (4.2)
    BY_ID: (id) => `/tickets/${id}`, // GET BE: missing (2.3) · PATCH /cancel BE: missing (2.4)
    MINE: '/tickets/my', // GET BE: missing (2.4)
  },

  PAYMENTS: {
    BASE: '/payments', // BE: missing (2.3) — no payment module
    BY_ID: (id) => `/payments/${id}`, // GET BE: missing (2.3)
    QR: (ticketId) => `/payments/${ticketId}/qr`, // GET BE: missing (2.3)
    CONFIRM: (id) => `/payments/${id}/confirm`, // POST BE: missing (2.3)
  },

  BUSES: {
    BASE: '/bus', // GET ✓ MR BusController.java:24 · POST ✓ :38
    BY_ID: (id) => `/bus/${id}`, // PUT ✓ MR BusController.java:44 · GET, DELETE BE: missing (1.1)
  },

  ROUTES: {
    BASE: '/route', // POST ✓ MR RouteController.java:18 · GET list BE: missing (1.1)
    BY_ID: (id) => `/route/${id}`, // PUT ✓ MR RouteController.java:25 · GET, DELETE BE: missing (1.1)
  },

  ADMIN: {
    DASHBOARD: '/admin/dashboard', // GET ✓ MR AdminDashboardController.java:27
    REVENUE: '/admin/revenue', // GET ✓ MR AdminDashboardController.java:37
  },

  REVENUE: {
    REPORT: '/revenue/report', // GET ✓ MR RevenueController.java:76
    BY_ROUTE: '/revenue/by-route', // GET ✓ MR RevenueController.java:82
    BY_DATE: '/revenue/by-date', // GET ✓ MR RevenueController.java:88
    TOP_CUSTOMERS: '/revenue/top-customers', // GET ✓ MR RevenueController.java:94
  },

  LOYALTY_POINTS: {
    BASE: '/loyalty-points', // GET BE: missing (4.3; BE /loyalty_point has POST/PUT only)
    EARN: '/loyalty-points/earn', // POST BE: missing (4.3)
    REDEEM: '/loyalty-points/redeem', // POST BE: missing (4.3)
  },

  LOYALTY_REWARDS: {
    BASE: '/loyalty-rewards', // GET BE: missing (4.3; BE /loyalty/rewards has POST/PUT only)
  },

  SALARY: {
    BASE: '/salary', // GET ✓ MR SalaryController.java:29 — month, year required
    CALCULATE: '/salary/calculate', // POST BE: missing (4.4; BE has POST /salary/driver, POST /salary?userId)
    BASE_SALARY: '/base_salary', // GET ✓ MR BaseSalaryController.java:32 — returns raw list, no BaseResponseDto envelope
  },
})
/**
 * Base API URL — pulled from Vite environment variables.
 * Set VITE_KONG_API_URL through Vite variables (e.g. http://localhost:8000/api).
 */

export const API_TIMEOUT = 15_000 // 15 seconds
