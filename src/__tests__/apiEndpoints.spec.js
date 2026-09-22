import { describe, expect, it } from 'vitest'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

// Task 0.2: FE paths must match the BE controller mappings that exist today.
// Evidence per path: .claude/docs/review/0.2-api-endpoints.md
describe('API_ENDPOINTS aligned with BE paths', () => {
  it('uses singular BE resources for bus, route, trip, ticket', () => {
    expect(API_ENDPOINTS.BUSES.BASE).toBe('/bus')
    expect(API_ENDPOINTS.BUSES.BY_ID(5)).toBe('/bus/5')
    expect(API_ENDPOINTS.ROUTES.BASE).toBe('/route')
    expect(API_ENDPOINTS.ROUTES.BY_ID(7)).toBe('/route/7')
    expect(API_ENDPOINTS.TRIPS.BASE).toBe('/trip')
    expect(API_ENDPOINTS.TRIPS.BY_ID(9)).toBe('/trip/9')
    expect(API_ENDPOINTS.TICKETS.BASE).toBe('/ticket')
  })

  it('uses the underscore base salary path', () => {
    expect(API_ENDPOINTS.SALARY.BASE_SALARY).toBe('/base_salary')
  })

  it('keeps paths that already matched BE unchanged', () => {
    expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/auth/login')
    expect(API_ENDPOINTS.AUTH.REGISTER).toBe('/auth/register')
    expect(API_ENDPOINTS.AUTH.UPDATE_PASSWORD).toBe('/auth/update-password')
    expect(API_ENDPOINTS.BOOKING.BASE).toBe('/booking')
    expect(API_ENDPOINTS.ADMIN.DASHBOARD).toBe('/admin/dashboard')
    expect(API_ENDPOINTS.ADMIN.REVENUE).toBe('/admin/revenue')
    expect(API_ENDPOINTS.REVENUE.REPORT).toBe('/revenue/report')
    expect(API_ENDPOINTS.REVENUE.BY_ROUTE).toBe('/revenue/by-route')
    expect(API_ENDPOINTS.REVENUE.BY_DATE).toBe('/revenue/by-date')
    expect(API_ENDPOINTS.REVENUE.TOP_CUSTOMERS).toBe('/revenue/top-customers')
    expect(API_ENDPOINTS.SALARY.BASE).toBe('/salary')
  })

  it('leaves BE-missing endpoints on their old path (decision A)', () => {
    expect(API_ENDPOINTS.USERS.BASE).toBe('/users')
    expect(API_ENDPOINTS.TRIPS.SEARCH).toBe('/trips/search')
    expect(API_ENDPOINTS.SEATS.BY_TRIP(3)).toBe('/trips/3/seats')
    expect(API_ENDPOINTS.TICKETS.MINE).toBe('/tickets/my')
  })

  it('is frozen at the top level', () => {
    expect(Object.isFrozen(API_ENDPOINTS)).toBe(true)
  })
})
