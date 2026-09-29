import { defineStore } from 'pinia'
import { ref } from 'vue'
import { busService, routeService } from '@/services/busRouteService'

export const BUS_PAGE_SIZE = 12
export const ROUTE_PAGE_SIZE = 10

function getPayload(response) {
  return response?.data?.data ?? response?.data ?? null
}

// BE lists return PageResponse { content, page, size, totalElements, totalPages } (task 0.7).
function toPage(payload, size) {
  return {
    content: Array.isArray(payload?.content) ? payload.content : [],
    page: Number(payload?.page) || 0,
    size: Number(payload?.size) || size,
    totalElements: Number(payload?.totalElements) || 0,
    totalPages: Number(payload?.totalPages) || 0,
  }
}

function emptyPage(size) {
  return { page: 0, size, totalElements: 0, totalPages: 0 }
}

// Session-abort cancellations are not a failure of this screen (B22 L24).
function isCanceled(err) {
  return err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED'
}

// The axios interceptor rejects with the BE error body { status, message, errors }.
function errorMessage(err, fallback) {
  return err?.message || fallback
}

export const useBusRouteStore = defineStore('busRoute', () => {
  // Each list keeps a request counter: a response that arrives after a newer request
  // was sent (retry, page change, mutation refresh) is dropped.
  let busRequestId = 0
  let routeRequestId = 0

  const buses = ref([])
  const busPage = ref(emptyPage(BUS_PAGE_SIZE))
  const busStatus = ref(null)
  const busesLoading = ref(false)
  const busesError = ref(null)

  const routes = ref([])
  const routePage = ref(emptyPage(ROUTE_PAGE_SIZE))
  const routeStatus = ref(null)
  const routesLoading = ref(false)
  const routesError = ref(null)

  const saving = ref(false)
  const deleting = ref(false)

  // `status` defaults to the last filter used, so a refresh after a mutation keeps it.
  async function fetchBuses({ page = busPage.value.page, status = busStatus.value } = {}) {
    const requestId = ++busRequestId
    busStatus.value = status || null
    busesLoading.value = true
    busesError.value = null
    try {
      const params = { page, size: BUS_PAGE_SIZE }
      if (status) params.status = status
      const result = toPage(getPayload(await busService.getAll(params)), BUS_PAGE_SIZE)
      if (requestId !== busRequestId) return buses.value
      // The last item of a later page was deleted: go to the new last page instead of an empty one.
      if (!result.content.length && page > 0 && result.totalPages > 0) {
        return fetchBuses({ page: result.totalPages - 1, status })
      }
      buses.value = result.content
      busPage.value = {
        page: result.page,
        size: result.size,
        totalElements: result.totalElements,
        totalPages: result.totalPages,
      }
      return buses.value
    } catch (err) {
      if (requestId !== busRequestId) return buses.value
      if (!isCanceled(err)) busesError.value = errorMessage(err, 'Unable to load buses')
      return []
    } finally {
      if (requestId === busRequestId) busesLoading.value = false
    }
  }

  async function fetchRoutes({ page = routePage.value.page, status = routeStatus.value } = {}) {
    const requestId = ++routeRequestId
    routeStatus.value = status || null
    routesLoading.value = true
    routesError.value = null
    try {
      const params = { page, size: ROUTE_PAGE_SIZE }
      if (status) params.status = status
      const result = toPage(getPayload(await routeService.getAll(params)), ROUTE_PAGE_SIZE)
      if (requestId !== routeRequestId) return routes.value
      if (!result.content.length && page > 0 && result.totalPages > 0) {
        return fetchRoutes({ page: result.totalPages - 1, status })
      }
      routes.value = result.content
      routePage.value = {
        page: result.page,
        size: result.size,
        totalElements: result.totalElements,
        totalPages: result.totalPages,
      }
      return routes.value
    } catch (err) {
      if (requestId !== routeRequestId) return routes.value
      if (!isCanceled(err)) routesError.value = errorMessage(err, 'Unable to load routes')
      return []
    } finally {
      if (requestId === routeRequestId) routesLoading.value = false
    }
  }

  // Mutations re-fetch the current page and rethrow the BE message so the modal can toast it.
  // The HTTP status and field errors ride along on the thrown Error.
  async function mutate(flag, request, refresh, fallback) {
    flag.value = true
    let result
    try {
      result = getPayload(await request())
    } catch (err) {
      throw Object.assign(new Error(errorMessage(err, fallback)), {
        status: err?.status,
        errors: err?.errors,
      })
    } finally {
      flag.value = false
    }
    await refresh()
    return result
  }

  const createBus = (payload) =>
    mutate(saving, () => busService.create(payload), fetchBuses, 'Unable to create bus')
  const updateBus = (id, payload) =>
    mutate(saving, () => busService.update(id, payload), fetchBuses, 'Unable to update bus')
  const deleteBus = (id) =>
    mutate(deleting, () => busService.remove(id), fetchBuses, 'Unable to delete bus')

  const createRoute = (payload) =>
    mutate(saving, () => routeService.create(payload), fetchRoutes, 'Unable to create route')
  const updateRoute = (id, payload) =>
    mutate(saving, () => routeService.update(id, payload), fetchRoutes, 'Unable to update route')
  const deleteRoute = (id) =>
    mutate(deleting, () => routeService.remove(id), fetchRoutes, 'Unable to delete route')

  return {
    buses,
    busPage,
    busStatus,
    busesLoading,
    busesError,
    routes,
    routePage,
    routeStatus,
    routesLoading,
    routesError,
    saving,
    deleting,
    fetchBuses,
    fetchRoutes,
    createBus,
    updateBus,
    deleteBus,
    createRoute,
    updateRoute,
    deleteRoute,
  }
})
