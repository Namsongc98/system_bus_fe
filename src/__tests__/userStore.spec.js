import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { USER_PAGE_SIZE, useUserStore } from '@/stores/user'
import { userService } from '@/services/userService'

vi.mock('@/services/userService', () => ({
  userService: {
    getAll: vi.fn(),
    getCounts: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    setStatus: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}))

function pageResponse(content, { page = 0, totalElements, totalPages } = {}) {
  return {
    data: {
      status: 200,
      data: {
        content,
        page,
        size: USER_PAGE_SIZE,
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

const driver = { id: 1, email: 'd@test.vn', role: 'DRIVER', active: true, fullName: 'Tài Xế' }
const customer = { id: 2, email: 'c@test.vn', role: 'CUSTOMER', active: true, fullName: null }

describe('user store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    userService.getAll.mockResolvedValue(pageResponse([driver, customer]))
    userService.getCounts.mockResolvedValue({
      data: { data: { total: 2, byRole: { DRIVER: 1, CUSTOMER: 1 } } },
    })
  })

  it('loads a PageResponse and sends the role filter', async () => {
    const store = useUserStore()
    userService.getAll.mockResolvedValueOnce(
      pageResponse([driver], { page: 1, totalElements: 11, totalPages: 2 })
    )

    await store.fetchAll({ page: 1, role: 'DRIVER' })

    expect(userService.getAll).toHaveBeenCalledWith({
      page: 1,
      size: USER_PAGE_SIZE,
      role: 'DRIVER',
    })
    expect(store.users).toEqual([driver])
    expect(store.page).toEqual({ page: 1, size: USER_PAGE_SIZE, totalElements: 11, totalPages: 2 })
  })

  it('keeps the last role filter on a refresh without arguments', async () => {
    const store = useUserStore()
    await store.fetchAll({ page: 0, role: 'COLLECTOR' })
    userService.getAll.mockClear()

    await store.fetchAll()

    expect(userService.getAll).toHaveBeenCalledWith({
      page: 0,
      size: USER_PAGE_SIZE,
      role: 'COLLECTOR',
    })
  })

  it('drops a response that arrives after a newer request', async () => {
    const store = useUserStore()
    const slow = deferred()
    userService.getAll.mockReturnValueOnce(slow.promise)
    userService.getAll.mockResolvedValueOnce(pageResponse([customer]))

    const first = store.fetchAll({ page: 0, role: 'DRIVER' })
    await store.fetchAll({ page: 0, role: 'CUSTOMER' })
    slow.resolve(pageResponse([driver]))
    await first

    expect(store.users).toEqual([customer])
    expect(store.loading).toBe(false)
  })

  it('moves to the new last page when the current page came back empty', async () => {
    const store = useUserStore()
    userService.getAll
      .mockResolvedValueOnce(pageResponse([], { page: 2, totalElements: 15, totalPages: 2 }))
      .mockResolvedValueOnce(pageResponse([driver], { page: 1, totalElements: 15, totalPages: 2 }))

    await store.fetchAll({ page: 2, role: null })

    expect(userService.getAll).toHaveBeenLastCalledWith({ page: 1, size: USER_PAGE_SIZE })
    expect(store.users).toEqual([driver])
  })

  it('shows the error and clears nothing else on a failed load, ignoring cancellations', async () => {
    const store = useUserStore()
    await store.fetchAll({ page: 0 })
    userService.getAll.mockRejectedValueOnce({ status: 500, message: 'Server down' })

    await store.fetchAll()

    expect(store.error).toBe('Server down')
    expect(store.users).toEqual([driver, customer])

    userService.getAll.mockRejectedValueOnce({ name: 'CanceledError' })
    await store.fetchAll()
    expect(store.error).toBeNull()
  })

  it('fills every role key in counts', async () => {
    const store = useUserStore()

    await store.fetchCounts()

    expect(store.counts).toEqual({
      total: 2,
      byRole: { ADMIN: 0, DRIVER: 1, COLLECTOR: 0, CUSTOMER: 1, EMPLOYEE: 0 },
    })
    expect(store.countsError).toBeNull()
  })

  it('records a counts error without throwing', async () => {
    const store = useUserStore()
    userService.getCounts.mockRejectedValueOnce({ message: 'nope' })

    await store.fetchCounts()

    expect(store.countsError).toBe('nope')
  })

  it('creates a user, then refreshes the list and counts', async () => {
    const store = useUserStore()
    userService.create.mockResolvedValue({ data: { data: { ...driver, id: 9 } } })

    const created = await store.createUser({ email: 'n@test.vn' })

    expect(created.id).toBe(9)
    expect(userService.getAll).toHaveBeenCalled()
    expect(userService.getCounts).toHaveBeenCalled()
    expect(store.saving).toBe(false)
  })

  it('rethrows a save error with the BE message, status and field errors', async () => {
    const store = useUserStore()
    userService.update.mockRejectedValue({
      status: 400,
      message: 'Họ tên không được để trống',
      errors: { fullName: 'Họ tên không được để trống' },
    })

    await expect(store.updateUser(1, {})).rejects.toMatchObject({
      message: 'Họ tên không được để trống',
      status: 400,
      errors: { fullName: 'Họ tên không được để trống' },
    })
    expect(store.saving).toBe(false)
    expect(userService.getAll).not.toHaveBeenCalled()
  })

  it('locks a user and replaces the row in place without refetching', async () => {
    const store = useUserStore()
    await store.fetchAll({ page: 0 })
    userService.getAll.mockClear()
    userService.setStatus.mockResolvedValue({ data: { data: { ...driver, active: false } } })

    await store.setUserActive(1, false)

    expect(userService.setStatus).toHaveBeenCalledWith(1, false)
    expect(store.users[0].active).toBe(false)
    expect(store.users[1]).toEqual(customer)
    expect(userService.getAll).not.toHaveBeenCalled()
    expect(store.statusUpdatingId).toBeNull()
  })

  it('rethrows a 409 from locking and leaves the row unchanged', async () => {
    const store = useUserStore()
    await store.fetchAll({ page: 0 })
    userService.setStatus.mockRejectedValue({
      status: 409,
      message: 'Tài xế còn chuyến chưa kết thúc',
    })

    await expect(store.setUserActive(1, false)).rejects.toMatchObject({ status: 409 })
    expect(store.users[0].active).toBe(true)
    expect(store.statusUpdatingId).toBeNull()
  })
})
