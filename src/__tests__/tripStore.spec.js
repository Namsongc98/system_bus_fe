import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { TRIP_CALENDAR_LIMIT, TRIP_PAGE_SIZE, useTripStore } from '@/stores/trip'
import { tripService } from '@/services/tripService'
import { busService, routeService } from '@/services/busRouteService'
import { userService } from '@/services/userService'

vi.mock('@/services/tripService', () => ({
  tripService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('@/services/busRouteService', () => ({
  routeService: { getAll: vi.fn() },
  busService: { getAll: vi.fn() },
}))

vi.mock('@/services/userService', () => ({
  userService: { getAll: vi.fn() },
}))

function pageResponse(content, { page = 0, totalElements, totalPages } = {}) {
  return {
    data: {
      data: {
        content,
        page,
        size: TRIP_PAGE_SIZE,
        totalElements: totalElements ?? content.length,
        totalPages: totalPages ?? (content.length ? 1 : 0),
      },
    },
  }
}

function deferred() {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}

const tripA = { id: 1, status: 'SCHEDULED' }
const tripB = { id: 2, status: 'CANCELLED' }
const RANGE = { from: new Date(2030, 0, 1), to: new Date(2030, 1, 1) }

describe('trip store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    tripService.getAll.mockResolvedValue(pageResponse([tripA]))
  })

  it('loads a page with the active filters only', async () => {
    const store = useTripStore()
    store.applyFilters({ status: 'CANCELLED', routeId: null })
    tripService.getAll.mockResolvedValueOnce(
      pageResponse([tripB], { page: 1, totalElements: 11, totalPages: 2 })
    )

    await store.fetchAll({ page: 1 })

    expect(tripService.getAll).toHaveBeenCalledWith({
      status: 'CANCELLED',
      page: 1,
      size: TRIP_PAGE_SIZE,
    })
    expect(store.trips).toEqual([tripB])
    expect(store.page).toEqual({ page: 1, size: TRIP_PAGE_SIZE, totalElements: 11, totalPages: 2 })
  })

  it('changing a filter drops the previous rows and page', async () => {
    const store = useTripStore()
    await store.fetchAll({ page: 0 })

    expect(store.applyFilters({ status: 'ONGOING' })).toBe(true)
    expect(store.trips).toEqual([])
    expect(store.page.page).toBe(0)
    expect(store.applyFilters({ status: 'ONGOING' })).toBe(false)
  })

  it('drops a list response that arrives after a newer request', async () => {
    const store = useTripStore()
    const slow = deferred()
    tripService.getAll.mockReturnValueOnce(slow.promise)
    tripService.getAll.mockResolvedValueOnce(pageResponse([tripB]))

    const first = store.fetchAll({ page: 0 })
    await store.fetchAll({ page: 0 })
    slow.resolve(pageResponse([tripA]))
    await first

    expect(store.trips).toEqual([tripB])
    expect(store.loading).toBe(false)
  })

  it('moves to the new last page when the current page came back empty', async () => {
    const store = useTripStore()
    tripService.getAll
      .mockResolvedValueOnce(pageResponse([], { page: 2, totalElements: 15, totalPages: 2 }))
      .mockResolvedValueOnce(pageResponse([tripA], { page: 1, totalElements: 15, totalPages: 2 }))

    await store.fetchAll({ page: 2 })

    expect(tripService.getAll).toHaveBeenLastCalledWith({ page: 1, size: TRIP_PAGE_SIZE })
    expect(store.trips).toEqual([tripA])
  })

  it('keeps rows and sets the error on a failed refresh, ignoring cancellations', async () => {
    const store = useTripStore()
    await store.fetchAll({ page: 0 })
    tripService.getAll.mockRejectedValueOnce({ status: 500, message: 'Server down' })

    await store.fetchAll()
    expect(store.error).toBe('Server down')
    expect(store.trips).toEqual([tripA])

    tripService.getAll.mockRejectedValueOnce({ name: 'CanceledError' })
    await store.fetchAll()
    expect(store.error).toBeNull()
  })

  it('calendar loads the range as local date-times, capped, and remembers it', async () => {
    const store = useTripStore()
    store.applyFilters({ routeId: '4' })
    tripService.getAll.mockResolvedValueOnce(pageResponse([tripA], { totalElements: 150 }))

    await store.fetchCalendar(RANGE)

    expect(tripService.getAll).toHaveBeenCalledWith({
      routeId: '4',
      from: '2030-01-01T00:00:00',
      to: '2030-02-01T00:00:00',
      page: 0,
      size: TRIP_CALENDAR_LIMIT,
    })
    expect(store.calendarTrips).toEqual([tripA])
    expect(store.calendarTotal).toBe(150)

    tripService.getAll.mockClear()
    await store.fetchCalendar()
    expect(tripService.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ from: '2030-01-01T00:00:00' })
    )
  })

  it('a new calendar range clears the previous total before loading', async () => {
    const store = useTripStore()
    tripService.getAll.mockResolvedValueOnce(pageResponse([tripA], { totalElements: 150 }))
    await store.fetchCalendar(RANGE)
    let resolve
    tripService.getAll.mockReturnValueOnce(new Promise((r) => (resolve = r)))

    const next = store.fetchCalendar({ from: new Date(2030, 1, 1), to: new Date(2030, 2, 1) })
    expect(store.calendarTotal).toBe(0)
    resolve(pageResponse([tripB], { totalElements: 3 }))
    await next
    expect(store.calendarTotal).toBe(3)
  })

  it('a refresh after a failed page change asks for that page again', async () => {
    const store = useTripStore()
    await store.fetchAll({ page: 0 })
    tripService.getAll.mockRejectedValueOnce({ message: 'offline' })
    await store.fetchAll({ page: 3 })
    tripService.getAll.mockClear()

    await store.fetchAll()

    expect(tripService.getAll).toHaveBeenCalledWith({ page: 3, size: TRIP_PAGE_SIZE })
  })

  it('calendar without a range does nothing', async () => {
    const store = useTripStore()

    await store.fetchCalendar()

    expect(tripService.getAll).not.toHaveBeenCalled()
  })

  it('highlights ask for the next two scheduled trips from now', async () => {
    const store = useTripStore()

    await store.fetchHighlights()

    expect(tripService.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'SCHEDULED', page: 0, size: 2, from: expect.any(String) })
    )
    expect(store.highlights).toEqual([tripA])
  })

  it('route options keep the id as a string value', async () => {
    const store = useTripStore()
    routeService.getAll.mockResolvedValue(pageResponse([{ id: 4, routeName: 'HN - ND' }]))

    await store.fetchRouteOptions()

    expect(routeService.getAll).toHaveBeenCalledWith({ page: 0, size: 100 })
    expect(store.routeOptions).toEqual([{ label: 'HN - ND', value: '4' }])
  })

  it('a mutation refreshes the list, the calendar and the highlights', async () => {
    const store = useTripStore()
    await store.fetchCalendar(RANGE)
    tripService.getAll.mockClear()
    tripService.updateStatus.mockResolvedValue({ data: { data: { ...tripA, status: 'ONGOING' } } })

    const updated = await store.changeStatus(1, 'ONGOING')

    expect(tripService.updateStatus).toHaveBeenCalledWith(1, 'ONGOING')
    expect(updated.status).toBe('ONGOING')
    expect(tripService.getAll).toHaveBeenCalledTimes(3)
    expect(store.busyTripId).toBeNull()
  })

  it('rethrows a mutation error with status and field errors, without refreshing', async () => {
    const store = useTripStore()
    tripService.create.mockRejectedValue({
      status: 400,
      message: 'Tuyến không được để trống',
      errors: { routeId: 'Tuyến không được để trống' },
    })

    await expect(store.create({})).rejects.toMatchObject({
      message: 'Tuyến không được để trống',
      status: 400,
      errors: { routeId: 'Tuyến không được để trống' },
    })
    expect(store.saving).toBe(false)
    expect(tripService.getAll).not.toHaveBeenCalled()
  })

  it('update and remove call the matching service', async () => {
    const store = useTripStore()
    tripService.update.mockResolvedValue({ data: { data: tripA } })
    tripService.remove.mockResolvedValue({ data: { data: null } })

    await store.update(1, { routeId: 1 })
    await store.remove(1)

    expect(tripService.update).toHaveBeenCalledWith(1, { routeId: 1 })
    expect(tripService.remove).toHaveBeenCalledWith(1)
  })

  it('wizard options load routes, buses and drivers through the store (B35 e)', async () => {
    routeService.getAll.mockResolvedValue(pageResponse([{ id: 1 }]))
    busService.getAll.mockResolvedValue(pageResponse([{ id: 2 }]))
    userService.getAll.mockRejectedValue({ status: 500, message: 'down' })
    const store = useTripStore()

    const options = await store.fetchFormOptions()

    expect(routeService.getAll).toHaveBeenCalledWith({ status: 'ACTIVE', size: 100 })
    expect(busService.getAll).toHaveBeenCalledWith({ size: 100 })
    expect(userService.getAll).toHaveBeenCalledWith({ role: 'DRIVER', size: 100 })
    expect(options.routes).toEqual([{ id: 1 }])
    expect(options.buses).toEqual([{ id: 2 }])
    // A failed list is null (not []) so the wizard can tell "failed" from "none yet".
    expect(options.drivers).toBeNull()
    expect(options.canceled).toBe(false)
  })

  it('wizard options flag a request aborted with the session (B37 d)', async () => {
    routeService.getAll.mockRejectedValue({ name: 'CanceledError', code: 'ERR_CANCELED' })
    busService.getAll.mockResolvedValue(pageResponse([]))
    userService.getAll.mockResolvedValue(pageResponse([]))

    const options = await useTripStore().fetchFormOptions()

    expect(options.routes).toBeNull()
    expect(options.canceled).toBe(true)
  })
})
