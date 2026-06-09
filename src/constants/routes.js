// ─── Route Name Constants ─────────────────────────────────────────────────────
// Single source of truth for all named routes — no magic strings elsewhere

export const ROUTE_NAMES = Object.freeze({
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',

  // User
  TRIP_VIEW: 'TripView',
  SEAT_VIEW: 'SeatView',
  PAYMENT_VIEW: 'PaymentView',
  PROFILE: 'Profile',
  MY_TICKETS: 'MyTickets',

  // Admin
  ADMIN_DASHBOARD: 'AdminDashboard',
  ADMIN_TICKETS: 'AdminTickets',
  ADMIN_REVENUE: 'AdminRevenue',
  ADMIN_BUSES: 'AdminBuses',
  ADMIN_TRIPS: 'AdminTrips',
  ADMIN_USERS: 'AdminUsers',
})

export const ROUTE_PATHS = {
  LOGIN: '/login',
  REGISTER: '/register',

  TRIPS: '/trips',
  SEAT_SELECTION: '/trips/:id/seats',
  PAYMENT: '/payment',
  CONFIRMATION: '/confirmation',
  MY_TICKETS: '/tickets',

  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_TICKETS: '/admin/tickets',
  ADMIN_REVENUE: '/admin/revenue',
  ADMIN_BUSES_ROUTES: '/admin/buses-routes',
  ADMIN_TRIPS: '/admin/trips',
  ADMIN_USERS: '/admin/users',
}
