import { describe, expect, it } from 'vitest'
import { toLocalDateTimeParam, toTripView } from '@/utils/tripView'

describe('tripView', () => {
  it('maps a TripResponse to the shape the trip components render', () => {
    const view = toTripView({
      id: 12,
      status: 'CANCELLED',
      departureTime: '2030-01-10T08:05:00',
      arrivalTime: '2030-01-10T11:30:00',
      route: { routeName: 'HN - HP', startPoint: 'Hà Nội', endPoint: 'Hải Phòng' },
      bus: { plateNumber: '29A-1', capacity: 40 },
      driver: { email: 'd@test.vn', fullName: 'Tài Xế' },
      ticketCount: 13,
      bookedSeats: 10,
      revenue: 450000,
    })

    expect(view).toMatchObject({
      id: 12,
      code: '#TR-12',
      route: 'Hà Nội ➔ Hải Phòng',
      routeShort: 'HN - HP',
      timeRange: '08:05 - 11:30',
      operator: 'Tài Xế',
      bus: '29A-1 · 40 seats',
      booked: 10,
      ticketCount: 13,
      capacity: 40,
      loadFactor: 25,
      revenue: 450000,
      statusKey: 'CANCELLED',
      status: 'cancelled',
      statusLabel: 'Cancelled',
    })
    expect(view.revenueLabel).toMatch(/450\.000/)
  })

  it('falls back to the driver email and copes with missing numbers', () => {
    const view = toTripView({ id: 1, status: 'SCHEDULED', driver: { email: 'd@test.vn' } })

    expect(view.operator).toBe('d@test.vn')
    expect(view.loadFactor).toBe(0)
    // Unknown, not 0: Delete must not be offered on a guess (B37 d).
    expect(view.ticketCount).toBeNull()
    expect(view.timeRange).toBe('--:-- - --:--')
  })

  it('formats a Date as a zone-less local date-time for the BE', () => {
    expect(toLocalDateTimeParam(new Date(2030, 0, 2, 3, 4, 5))).toBe('2030-01-02T03:04:05')
  })
})
