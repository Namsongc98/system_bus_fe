// TripResponse (BE /api/trip) → the shape the trips screen components render. Pure functions only.

export const TRIP_STATUS_LABELS = {
  SCHEDULED: 'Scheduled',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const timeFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })
const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function formatTime(value) {
  const date = value ? new Date(value) : null
  return date && Number.isFinite(date.getTime()) ? timeFormatter.format(date) : '--:--'
}

export function formatVnd(amount) {
  return currencyFormatter.format(Number(amount) || 0)
}

/**
 * BE LocalDateTime has no zone: send the browser's local wall-clock time, e.g. 2026-10-05T08:00:00.
 * @param {Date} date
 */
export function toLocalDateTimeParam(date) {
  const pad = (value) => String(value).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

/** @param {object} trip TripResponse */
export function toTripView(trip) {
  const statusKey = String(trip.status || 'SCHEDULED').toUpperCase()
  const from = trip.route?.startPoint || trip.route?.routeName || 'Origin'
  const to = trip.route?.endPoint || ''
  const route = to ? `${from} ➔ ${to}` : from
  const capacity = Number(trip.bus?.capacity) || 0
  const booked = Number(trip.bookedSeats) || 0
  // Every ticket, cancelled ones included: BE refuses to delete a trip that has any (B35 e).
  // Unknown (field missing) stays null, so the UI does not offer Delete on a guess (B37 d).
  const ticketCount =
    trip.ticketCount === undefined || trip.ticketCount === null
      ? null
      : Number(trip.ticketCount) || 0
  const plate = trip.bus?.plateNumber || 'Bus'
  // Users created by public register have no profile: fall back to the email (1.2 D1).
  const driverName = trip.driver?.fullName || trip.driver?.email || 'Unassigned driver'

  return {
    id: trip.id,
    code: `#TR-${trip.id}`,
    shortId: `TR-${trip.id}`,
    route,
    routeShort: trip.route?.routeName || route,
    timeRange: `${formatTime(trip.departureTime)} - ${formatTime(trip.arrivalTime)}`,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    operator: driverName,
    operatorShort: driverName,
    bus: capacity ? `${plate} · ${capacity} seats` : plate,
    busShort: plate,
    booked,
    ticketCount,
    capacity,
    loadFactor: capacity ? Math.round((booked / capacity) * 100) : 0,
    revenue: Number(trip.revenue) || 0,
    revenueLabel: formatVnd(trip.revenue),
    statusKey,
    status: statusKey.toLowerCase(),
    statusLabel: TRIP_STATUS_LABELS[statusKey] || statusKey,
    raw: trip,
  }
}
