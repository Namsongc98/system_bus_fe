import { describe, expect, it } from 'vitest'
import { API_ENDPOINTS } from '@/constants/api_endpoint'

describe('API_ENDPOINTS match existing BE paths', () => {
  it('uses the singular BE resource paths', () => {
    expect(API_ENDPOINTS.BUSES.BASE).toBe('/bus')
    expect(API_ENDPOINTS.BUSES.BY_ID(5)).toBe('/bus/5')
    expect(API_ENDPOINTS.ROUTES.BASE).toBe('/route')
    expect(API_ENDPOINTS.ROUTES.BY_ID(5)).toBe('/route/5')
    expect(API_ENDPOINTS.TRIPS.BASE).toBe('/trip')
    expect(API_ENDPOINTS.TRIPS.BY_ID(5)).toBe('/trip/5')
    expect(API_ENDPOINTS.TICKETS.BASE).toBe('/ticket')
    expect(API_ENDPOINTS.SALARY.BASE_SALARY).toBe('/base_salary')
  })

  it('points the admin user endpoints at UserController (1.2), with no delete', () => {
    expect(API_ENDPOINTS.USERS.BASE).toBe('/user')
    expect(API_ENDPOINTS.USERS.COUNTS).toBe('/user/counts')
    expect(API_ENDPOINTS.USERS.BY_ID(5)).toBe('/user/5')
    expect(API_ENDPOINTS.USERS.STATUS(5)).toBe('/user/5/status')
  })

  it('keeps the paths that already matched BE', () => {
    expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/auth/login')
    expect(API_ENDPOINTS.AUTH.ME).toBe('/auth/me')
    expect(API_ENDPOINTS.BOOKING.BASE).toBe('/booking')
    expect(API_ENDPOINTS.ADMIN.DASHBOARD).toBe('/admin/dashboard')
    expect(API_ENDPOINTS.ADMIN.REVENUE).toBe('/admin/revenue')
    expect(API_ENDPOINTS.REVENUE).toEqual({
      REPORT: '/revenue/report',
      BY_ROUTE: '/revenue/by-route',
      BY_DATE: '/revenue/by-date',
      TOP_CUSTOMERS: '/revenue/top-customers',
    })
  })

  it('leaves paths without a BE endpoint unchanged until their task builds it', () => {
    expect(API_ENDPOINTS.USERS.PROFILE).toBe('/users/profile')
    expect(API_ENDPOINTS.TRIPS.SEARCH).toBe('/trips/search')
    expect(API_ENDPOINTS.SEATS.BY_TRIP(7)).toBe('/trips/7/seats')
    expect(API_ENDPOINTS.TICKETS.MINE).toBe('/tickets/my')
  })
})
