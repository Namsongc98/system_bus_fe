import { defineStore } from 'pinia'
import { ref } from 'vue'
import { busService, routeService } from '@/services/busRouteService'
import { tripService } from '@/services/tripService'
import { userService } from '@/services/userService'
import { toLocalDateTimeParam } from '@/utils/tripView'

export const TRIP_PAGE_SIZE = 10
// Spec review 1.3 D7 = A: the calendar loads at most this many trips for the visible range.
export const TRIP_CALENDAR_LIMIT = 100
const HIGHLIGHT_COUNT = 2

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

function emptyPage() {
  return { page: 0, size: TRIP_PAGE_SIZE, totalElements: 0, totalPages: 0 }
}

// Session-abort cancellations are not a failure of this screen (B22 L24).
function isCanceled(err) {
  return err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED'
}

// The axios interceptor rejects with the BE error body { status, message, errors }.
function errorMessage(err, fallback) {
  return err?.message || fallback
}

function toError(err, fallback) {
  return Object.assign(new Error(errorMessage(err, fallback)), {
    status: err?.status,
    errors: err?.errors,
  })
}

function toCollection(response) {
  const payload = getPayload(response)
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  return []
}

// Drop empty filters so the request only carries what is set.
function filterParams({ status, routeId }) {
  const params = {}
  if (status) params.status = status
  if (routeId) params.routeId = routeId
  return params
}

export const useTripStore = defineStore('trip', () => {
  // Each list keeps a request counter: a response that arrives after a newer request is dropped.
  let listRequestId = 0
  let calendarRequestId = 0
  let highlightRequestId = 0

  // Shared by the list and the calendar (status / route filter bar).
  const filters = ref({ status: null, routeId: null })

  const trips = ref([])
  const page = ref(emptyPage())
  // Page of the last list request — Retry asks for it again, not for the last page that loaded.
  const requestedPage = ref(0)
  const loading = ref(false)
  const error = ref(null)

  const calendarTrips = ref([])
  const calendarRange = ref(null)
  const calendarTotal = ref(0)
  const calendarLoading = ref(false)
  const calendarError = ref(null)

  const highlights = ref([])

  // Route filter options: every route, active or not (old trips may use an inactive route).
  const routeOptions = ref([])

  const saving = ref(false)
  // Id of the trip whose status change / delete is in flight.
  const busyTripId = ref(null)

  function sameFilters(next) {
    return (
      (next.status || null) === filters.value.status &&
      (next.routeId || null) === filters.value.routeId
    )
  }

  // Changing a filter drops the rows of the previous filter so they never show under the new one
  // (1.2 L4) and Retry starts from the first page.
  function applyFilters(next) {
    if (sameFilters(next)) return false
    filters.value = { status: next.status || null, routeId: next.routeId || null }
    trips.value = []
    page.value = emptyPage()
    requestedPage.value = 0
    calendarTrips.value = []
    calendarTotal.value = 0
    return true
  }

  async function fetchAll({ page: pageNumber = requestedPage.value } = {}) {
    const requestId = ++listRequestId
    requestedPage.value = pageNumber
    loading.value = true
    error.value = null
    try {
      const params = { ...filterParams(filters.value), page: pageNumber, size: TRIP_PAGE_SIZE }
      const result = toPage(getPayload(await tripService.getAll(params)), TRIP_PAGE_SIZE)
      if (requestId !== listRequestId) return trips.value
      // The last trip of a later page was deleted: go to the new last page instead of an empty one.
      if (!result.content.length && pageNumber > 0 && result.totalPages > 0) {
        return fetchAll({ page: result.totalPages - 1 })
      }
      trips.value = result.content
      page.value = {
        page: result.page,
        size: result.size,
        totalElements: result.totalElements,
        totalPages: result.totalPages,
      }
      return trips.value
    } catch (err) {
      if (requestId !== listRequestId) return trips.value
      if (!isCanceled(err)) error.value = errorMessage(err, 'Unable to load trips')
      return []
    } finally {
      if (requestId === listRequestId) loading.value = false
    }
  }

  // Calendar: every trip departing in [from, to) of the visible range, same status / route filter.
  async function fetchCalendar(range = calendarRange.value) {
    if (!range?.from || !range?.to) return calendarTrips.value
    const requestId = ++calendarRequestId
    calendarRange.value = range
    calendarLoading.value = true
    calendarError.value = null
    // The "showing the first 100" warning belongs to the range being loaded, not the previous one.
    calendarTotal.value = 0
    try {
      const params = {
        ...filterParams(filters.value),
        from: toLocalDateTimeParam(range.from),
        to: toLocalDateTimeParam(range.to),
        page: 0,
        size: TRIP_CALENDAR_LIMIT,
      }
      const result = toPage(getPayload(await tripService.getAll(params)), TRIP_CALENDAR_LIMIT)
      if (requestId !== calendarRequestId) return calendarTrips.value
      calendarTrips.value = result.content
      calendarTotal.value = result.totalElements
      return calendarTrips.value
    } catch (err) {
      if (requestId !== calendarRequestId) return calendarTrips.value
      if (!isCanceled(err)) calendarError.value = errorMessage(err, 'Unable to load the calendar')
      return []
    } finally {
      if (requestId === calendarRequestId) calendarLoading.value = false
    }
  }

  // "Upcoming Highlights": the next scheduled departures from now on.
  async function fetchHighlights() {
    const requestId = ++highlightRequestId
    try {
      const params = {
        status: 'SCHEDULED',
        from: toLocalDateTimeParam(new Date()),
        page: 0,
        size: HIGHLIGHT_COUNT,
      }
      const result = toPage(getPayload(await tripService.getAll(params)), HIGHLIGHT_COUNT)
      if (requestId === highlightRequestId) highlights.value = result.content
    } catch (err) {
      // Highlights are secondary: keep the last ones; the list shows the real error.
      if (requestId === highlightRequestId && !isCanceled(err)) highlights.value = []
    }
    return highlights.value
  }

  async function fetchRouteOptions() {
    try {
      const result = toPage(getPayload(await routeService.getAll({ page: 0, size: 100 })), 100)
      routeOptions.value = result.content.map((route) => ({
        label: route.routeName || `${route.startPoint} ➔ ${route.endPoint}`,
        value: String(route.id),
      }))
    } catch (err) {
      // The filter keeps "All Routes" only; the trip list still loads.
      if (!isCanceled(err)) routeOptions.value = []
    }
    return routeOptions.value
  }

  /**
   * Raw options for the create / edit wizard (B35 e: loaded here, not by the component).
   * Each list is an array, or null when its request failed so the wizard can offer a retry.
   * canceled: a request was aborted with the session (logout) — not a failure to report (B37 d).
   */
  async function fetchFormOptions() {
    const results = await Promise.allSettled([
      // Largest page the BE allows (B31). D1 = A: an IN_USE bus can still take a non-overlapping
      // trip; the wizard hides only MAINTENANCE and the BE checks overlaps on submit.
      routeService.getAll({ status: 'ACTIVE', size: 100 }),
      busService.getAll({ size: 100 }),
      userService.getAll({ role: 'DRIVER', size: 100 }),
    ])
    const [routes, buses, drivers] = results.map((result) =>
      result.status === 'fulfilled' ? toCollection(result.value) : null
    )
    const canceled = results.some(
      (result) => result.status === 'rejected' && isCanceled(result.reason)
    )
    return { routes, buses, drivers, canceled }
  }

  async function fetchById(id) {
    try {
      return getPayload(await tripService.getById(id))
    } catch (err) {
      throw toError(err, 'Unable to load trip')
    }
  }

  function refreshAll() {
    return Promise.all([fetchAll(), fetchCalendar(), fetchHighlights()])
  }

  async function mutate(flag, request, fallback) {
    let result
    flag()
    try {
      result = getPayload(await request())
    } catch (err) {
      throw toError(err, fallback)
    } finally {
      saving.value = false
      busyTripId.value = null
    }
    await refreshAll()
    return result
  }

  const create = (payload) =>
    mutate(
      () => (saving.value = true),
      () => tripService.create(payload),
      'Unable to create trip'
    )
  const update = (id, payload) =>
    mutate(
      () => (saving.value = true),
      () => tripService.update(id, payload),
      'Unable to update trip'
    )
  const changeStatus = (id, status) =>
    mutate(
      () => (busyTripId.value = id),
      () => tripService.updateStatus(id, status),
      'Unable to change trip status'
    )
  const remove = (id) =>
    mutate(
      () => (busyTripId.value = id),
      () => tripService.remove(id),
      'Unable to delete trip'
    )

  return {
    filters,
    trips,
    page,
    requestedPage,
    loading,
    error,
    calendarTrips,
    calendarRange,
    calendarTotal,
    calendarLoading,
    calendarError,
    highlights,
    routeOptions,
    saving,
    busyTripId,
    applyFilters,
    fetchAll,
    fetchCalendar,
    fetchHighlights,
    fetchRouteOptions,
    fetchFormOptions,
    fetchById,
    refreshAll,
    create,
    update,
    changeStatus,
    remove,
  }
})
