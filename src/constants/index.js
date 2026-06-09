// ─── App-wide Constants ───────────────────────────────────────────────────────

export const APP_NAME = import.meta.env.VITE_APP_TITLE || 'Booking Ticket'

export const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
})

export const TICKET_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
})

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
})

export const SEAT_STATUS = Object.freeze({
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  SOLD: 'sold',
})

export const PAGINATION_DEFAULTS = Object.freeze({
  PAGE: 0,
  PAGE_SIZE: 10,
})

export const LOCAL_STORAGE_KEYS = Object.freeze({
  ACCESS_TOKEN: 'bkt_access_token',
  REFRESH_TOKEN: 'bkt_refresh_token',
  USER: 'bkt_user',
})
