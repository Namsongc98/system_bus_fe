import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/userService'

export const USER_PAGE_SIZE = 10
// UserRole on the BE (common-library UserRole.java). Badge counts always carry every key.
export const USER_ROLE_KEYS = ['ADMIN', 'DRIVER', 'COLLECTOR', 'CUSTOMER', 'EMPLOYEE']

function getPayload(response) {
  return response?.data?.data ?? response?.data ?? null
}

// BE lists return PageResponse { content, page, size, totalElements, totalPages } (task 0.7).
function toPage(payload) {
  return {
    content: Array.isArray(payload?.content) ? payload.content : [],
    page: Number(payload?.page) || 0,
    size: Number(payload?.size) || USER_PAGE_SIZE,
    totalElements: Number(payload?.totalElements) || 0,
    totalPages: Number(payload?.totalPages) || 0,
  }
}

function emptyPage() {
  return { page: 0, size: USER_PAGE_SIZE, totalElements: 0, totalPages: 0 }
}

function emptyCounts() {
  return { total: 0, byRole: Object.fromEntries(USER_ROLE_KEYS.map((role) => [role, 0])) }
}

// Session-abort cancellations are not a failure of this screen (B22 L24).
function isCanceled(err) {
  return err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED'
}

// The axios interceptor rejects with the BE error body { status, message, errors }.
function errorMessage(err, fallback) {
  return err?.message || fallback
}

// Rethrown so the caller can toast the BE message; the HTTP status and field errors ride along.
function toError(err, fallback) {
  return Object.assign(new Error(errorMessage(err, fallback)), {
    status: err?.status,
    errors: err?.errors,
  })
}

export const useUserStore = defineStore('user', () => {
  // A response that arrives after a newer list request was sent (tab switch, page change,
  // refresh after a mutation) is dropped.
  let listRequestId = 0

  const users = ref([])
  const page = ref(emptyPage())
  const role = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const counts = ref(emptyCounts())
  const countsError = ref(null)

  const saving = ref(false)
  // Id of the user whose lock/unlock is in flight.
  const statusUpdatingId = ref(null)

  const profile = ref(null)

  // `role` defaults to the last filter used, so a refresh after a mutation keeps the tab.
  async function fetchAll({
    page: pageNumber = page.value.page,
    role: roleFilter = role.value,
  } = {}) {
    const requestId = ++listRequestId
    // Another tab: drop the previous tab's rows so a slow or failed request never shows them
    // under the new tab, and so Retry starts from that tab's first page.
    if ((roleFilter || null) !== role.value) {
      users.value = []
      page.value = emptyPage()
    }
    role.value = roleFilter || null
    loading.value = true
    error.value = null
    try {
      const params = { page: pageNumber, size: USER_PAGE_SIZE }
      if (roleFilter) params.role = roleFilter
      const result = toPage(getPayload(await userService.getAll(params)))
      if (requestId !== listRequestId) return users.value
      // The page shrank under us (role changed away from this tab): go to the new last page.
      if (!result.content.length && pageNumber > 0 && result.totalPages > 0) {
        return fetchAll({ page: result.totalPages - 1, role: roleFilter })
      }
      users.value = result.content
      page.value = {
        page: result.page,
        size: result.size,
        totalElements: result.totalElements,
        totalPages: result.totalPages,
      }
      return users.value
    } catch (err) {
      if (requestId !== listRequestId) return users.value
      if (!isCanceled(err)) error.value = errorMessage(err, 'Unable to load users')
      return []
    } finally {
      if (requestId === listRequestId) loading.value = false
    }
  }

  async function fetchCounts() {
    countsError.value = null
    try {
      const payload = getPayload(await userService.getCounts())
      const next = emptyCounts()
      next.total = Number(payload?.total) || 0
      USER_ROLE_KEYS.forEach((key) => {
        next.byRole[key] = Number(payload?.byRole?.[key]) || 0
      })
      counts.value = next
    } catch (err) {
      if (!isCanceled(err)) countsError.value = errorMessage(err, 'Unable to load user counts')
    }
    return counts.value
  }

  // Create and update can move a user in or out of the current tab: refresh the list and badges.
  async function save(request, fallback) {
    saving.value = true
    let result
    try {
      result = getPayload(await request())
    } catch (err) {
      throw toError(err, fallback)
    } finally {
      saving.value = false
    }
    await Promise.all([fetchAll(), fetchCounts()])
    return result
  }

  const createUser = (payload) => save(() => userService.create(payload), 'Unable to create user')
  const updateUser = (id, payload) =>
    save(() => userService.update(id, payload), 'Unable to update user')

  // Locking does not change role or counts, so the returned UserResponse replaces the row in place.
  async function setUserActive(id, active) {
    statusUpdatingId.value = id
    try {
      const updated = getPayload(await userService.setStatus(id, active))
      if (updated?.id !== undefined) {
        users.value = users.value.map((user) => (String(user.id) === String(id) ? updated : user))
      }
      return updated
    } catch (err) {
      throw toError(err, active ? 'Unable to unlock user' : 'Unable to lock user')
    } finally {
      statusUpdatingId.value = null
    }
  }

  // Own profile (4.1) — BE endpoint not built yet.
  async function fetchProfile() {
    const payload = getPayload(await userService.getProfile())
    profile.value = payload
    return payload
  }

  async function updateProfile(payload) {
    const updated = getPayload(await userService.updateProfile(payload))
    profile.value = updated
    return updated
  }

  return {
    users,
    page,
    role,
    loading,
    error,
    counts,
    countsError,
    saving,
    statusUpdatingId,
    profile,
    fetchAll,
    fetchCounts,
    createUser,
    updateUser,
    setUserActive,
    fetchProfile,
    updateProfile,
  }
})
