import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { BUS_PAGE_SIZE, ROUTE_PAGE_SIZE, useBusRouteStore } from '@/stores/busRoute'
import { busService, routeService } from '@/services/busRouteService'

vi.mock('@/services/busRouteService', () => ({
  busService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  routeService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

function pageResponse(content, { page = 0, size = BUS_PAGE_SIZE, totalElements, totalPages } = {}) {
  return {
    data: {
      status: 200,
      data: {
        content,
        page,
        size,
        totalElements: totalElements ?? content.length,
        totalPages: totalPages ?? (content.length ? 1 : 0),
      },
    },
  }
}

const bus = { id: 1, plateNumber: '51A-00001', capacity: 45, status: 'AVAILABLE' }
const route = { id: 2, routeName: 'HN - HP', startPoint: 'Hà Nội', endPoint: 'Hải Phòng' }

describe('busRoute store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchBuses maps PageResponse and sends page, size and status', async () => {
    busService.getAll.mockResolvedValue(
      pageResponse([bus], { page: 1, totalElements: 13, totalPages: 2 })
    )
    const store = useBusRouteStore()

    await store.fetchBuses({ page: 1, status: 'AVAILABLE' })

    expect(busService.getAll).toHaveBeenCalledWith({
      page: 1,
      size: BUS_PAGE_SIZE,
      status: 'AVAILABLE',
    })
    expect(store.buses).toEqual([bus])
    expect(store.busPage).toEqual({
      page: 1,
      size: BUS_PAGE_SIZE,
      totalElements: 13,
      totalPages: 2,
    })
    expect(store.busesLoading).toBe(false)
    expect(store.busesError).toBeNull()
  })

  it('fetchRoutes maps PageResponse with the route page size', async () => {
    routeService.getAll.mockResolvedValue(pageResponse([route], { size: ROUTE_PAGE_SIZE }))
    const store = useBusRouteStore()

    await store.fetchRoutes({ page: 0 })

    expect(routeService.getAll).toHaveBeenCalledWith({ page: 0, size: ROUTE_PAGE_SIZE })
    expect(store.routes).toEqual([route])
    expect(store.routePage.totalElements).toBe(1)
  })

  it('stores the BE message on error and never falls back to sample data', async () => {
    busService.getAll.mockRejectedValue({ status: 500, message: 'Server exploded' })
    const store = useBusRouteStore()

    await store.fetchBuses({ page: 0 })

    expect(store.busesError).toBe('Server exploded')
    expect(store.buses).toEqual([])
    expect(store.busesLoading).toBe(false)
  })

  it('does not record an error for a cancelled request', async () => {
    const canceled = Object.assign(new Error('Session ended'), { name: 'CanceledError' })
    routeService.getAll.mockRejectedValue(canceled)
    const store = useBusRouteStore()

    await store.fetchRoutes({ page: 0 })

    expect(store.routesError).toBeNull()
  })

  it('steps back a page when the requested page came back empty', async () => {
    busService.getAll
      .mockResolvedValueOnce(pageResponse([], { page: 1, totalElements: 12, totalPages: 1 }))
      .mockResolvedValueOnce(pageResponse([bus], { page: 0, totalElements: 12, totalPages: 1 }))
    const store = useBusRouteStore()

    await store.fetchBuses({ page: 1 })

    expect(busService.getAll).toHaveBeenLastCalledWith({ page: 0, size: BUS_PAGE_SIZE })
    expect(store.buses).toEqual([bus])
    expect(store.busPage.page).toBe(0)
  })

  it('createBus re-fetches the current page and returns the created bus', async () => {
    busService.create.mockResolvedValue({ data: { data: bus } })
    busService.getAll.mockResolvedValue(pageResponse([bus]))
    const store = useBusRouteStore()

    const created = await store.createBus({ plateNumber: '51A-00001' })

    expect(created).toEqual(bus)
    expect(busService.getAll).toHaveBeenCalledWith({ page: 0, size: BUS_PAGE_SIZE })
    expect(store.saving).toBe(false)
  })

  it('updateRoute and deleteRoute re-fetch routes', async () => {
    routeService.update.mockResolvedValue({ data: { data: route } })
    routeService.remove.mockResolvedValue({ data: { data: null } })
    routeService.getAll.mockResolvedValue(pageResponse([route]))
    const store = useBusRouteStore()

    await store.updateRoute(2, { routeName: 'HN - HP' })
    await store.deleteRoute(2)

    expect(routeService.update).toHaveBeenCalledWith(2, { routeName: 'HN - HP' })
    expect(routeService.remove).toHaveBeenCalledWith(2)
    expect(routeService.getAll).toHaveBeenCalledTimes(2)
    expect(store.deleting).toBe(false)
  })

  it('rethrows the BE message on a failed mutation without re-fetching', async () => {
    busService.remove.mockRejectedValue({
      status: 409,
      message: 'Xe đang được gán cho chuyến chưa kết thúc',
    })
    const store = useBusRouteStore()

    await expect(store.deleteBus(1)).rejects.toThrow('Xe đang được gán cho chuyến chưa kết thúc')
    expect(busService.getAll).not.toHaveBeenCalled()
    expect(store.deleting).toBe(false)
  })

  it('keeps the status filter when a mutation refreshes the list', async () => {
    busService.getAll.mockResolvedValue(pageResponse([bus]))
    busService.remove.mockResolvedValue({ data: { data: null } })
    const store = useBusRouteStore()

    await store.fetchBuses({ page: 0, status: 'AVAILABLE' })
    await store.deleteBus(1)

    expect(busService.getAll).toHaveBeenLastCalledWith({
      page: 0,
      size: BUS_PAGE_SIZE,
      status: 'AVAILABLE',
    })
  })

  it('ignores a response that arrives after a newer request', async () => {
    let resolveOld
    busService.getAll
      .mockReturnValueOnce(new Promise((resolve) => (resolveOld = resolve)))
      .mockResolvedValueOnce(pageResponse([bus], { page: 1, totalElements: 13, totalPages: 2 }))
    const store = useBusRouteStore()

    const older = store.fetchBuses({ page: 0 })
    await store.fetchBuses({ page: 1 })
    resolveOld(pageResponse([{ ...bus, id: 99 }]))
    await older

    expect(store.buses).toEqual([bus])
    expect(store.busPage.page).toBe(1)
    expect(store.busesLoading).toBe(false)
  })

  it('jumps to the new last page when the requested page no longer exists', async () => {
    routeService.getAll
      .mockResolvedValueOnce(pageResponse([], { page: 5, totalElements: 25, totalPages: 3 }))
      .mockResolvedValueOnce(pageResponse([route], { page: 2, totalElements: 25, totalPages: 3 }))
    const store = useBusRouteStore()

    await store.fetchRoutes({ page: 5 })

    expect(routeService.getAll).toHaveBeenLastCalledWith({ page: 2, size: ROUTE_PAGE_SIZE })
    expect(store.routePage.page).toBe(2)
  })

  it('keeps the HTTP status and field errors on a failed mutation and resets saving', async () => {
    busService.create.mockRejectedValue({
      status: 400,
      message: 'Biển số xe không được để trống',
      errors: { plateNumber: 'Biển số xe không được để trống' },
    })
    const store = useBusRouteStore()

    const error = await store.createBus({}).catch((err) => err)

    expect(error.status).toBe(400)
    expect(error.errors).toEqual({ plateNumber: 'Biển số xe không được để trống' })
    expect(store.saving).toBe(false)
  })

  it('falls back to a generic message when the error has none', async () => {
    routeService.create.mockRejectedValue({})
    const store = useBusRouteStore()

    await expect(store.createRoute({})).rejects.toThrow('Unable to create route')
  })
})
