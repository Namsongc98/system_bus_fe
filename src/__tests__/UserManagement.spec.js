import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UserManagement from '@/pages/admin/UserManagement.vue'
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

// The signed-in admin is user 1.
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ user: { id: 1, role: 'admin' } }),
}))

const ModalUserFormStub = {
  name: 'ModalUserForm',
  props: ['modelValue', 'user'],
  template:
    '<div v-if="modelValue" data-testid="user-form">{{ user ? `edit:${user.id}` : `create` }}</div>',
}
const ModalUserStatusStub = {
  name: 'ModalUserStatus',
  props: ['modelValue', 'user'],
  template: '<div v-if="modelValue" data-testid="user-status">{{ user && user.id }}</div>',
}

function pageResponse(content, { page = 0, totalElements, totalPages } = {}) {
  return {
    data: {
      data: {
        content,
        page,
        size: 10,
        totalElements: totalElements ?? content.length,
        totalPages: totalPages ?? (content.length ? 1 : 0),
      },
    },
  }
}

const admin = {
  id: 1,
  email: 'admin@test.vn',
  role: 'ADMIN',
  active: true,
  fullName: 'Quản Trị',
  createdAt: '2026-01-10T08:00:00',
}
const lockedCustomer = {
  id: 2,
  email: 'khach@test.vn',
  role: 'CUSTOMER',
  active: false,
  fullName: null,
  createdAt: '2026-02-03T10:00:00',
}

function mountPage() {
  return mount(UserManagement, {
    global: {
      plugins: [createPinia()],
      stubs: {
        ModalUserForm: ModalUserFormStub,
        ModalUserStatus: ModalUserStatusStub,
        UButton: {
          props: ['disabled', 'loading', 'type'],
          emits: ['click'],
          template:
            '<button :type="type" :disabled="disabled || loading" @click="$emit(`click`)"><slot name="leading" /><slot /><slot name="trailing" /></button>',
        },
        UIcon: { template: '<span data-testid="icon"></span>' },
      },
    },
  })
}

function button(wrapper, text) {
  return wrapper.findAll('button').find((b) => b.text().includes(text))
}

describe('UserManagement', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    userService.getAll.mockResolvedValue(
      pageResponse([admin, lockedCustomer], { totalElements: 22, totalPages: 3 })
    )
    userService.getCounts.mockResolvedValue({
      data: { data: { total: 22, byRole: { ADMIN: 2, DRIVER: 5, COLLECTOR: 3, CUSTOMER: 12 } } },
    })
  })

  it('loads the first page and the counts on mount', async () => {
    mountPage()
    await flushPromises()

    expect(userService.getAll).toHaveBeenCalledWith({ page: 0, size: 10 })
    expect(userService.getCounts).toHaveBeenCalledTimes(1)
  })

  it('renders real users: full name or email, role, status and creation date', async () => {
    const wrapper = mountPage()
    await flushPromises()

    const adminRow = wrapper.get('[data-testid="user-row-1"]')
    expect(adminRow.text()).toContain('Quản Trị')
    expect(adminRow.text()).toContain('(you)')
    expect(adminRow.text()).toContain('ADMIN')
    expect(adminRow.text()).toContain('Active')
    expect(adminRow.text()).toContain('10 Jan 2026')

    const customerRow = wrapper.get('[data-testid="user-row-2"]')
    // No profile: the email is the display name.
    expect(customerRow.findAll('p')[0].text()).toContain('khach@test.vn')
    expect(customerRow.text()).toContain('Locked')
    expect(wrapper.text()).not.toContain('Sarah Jenkins')
  })

  it('shows badge counts from the counts API, not from the current page', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(button(wrapper, 'All').text()).toContain('22')
    expect(button(wrapper, 'Customers').text()).toContain('12')
    expect(button(wrapper, 'Drivers').text()).toContain('5')
  })

  it('hides the badges when the counts fail', async () => {
    userService.getCounts.mockRejectedValueOnce({ message: 'nope' })
    const wrapper = mountPage()
    await flushPromises()

    expect(button(wrapper, 'Drivers').text()).toBe('Drivers')
  })

  it('sends the uppercase role for a tab and goes back to the first page', async () => {
    const wrapper = mountPage()
    await flushPromises()
    await button(wrapper, 'Next').trigger('click')
    await flushPromises()
    userService.getAll.mockClear()

    await button(wrapper, 'Drivers').trigger('click')
    await flushPromises()

    expect(userService.getAll).toHaveBeenCalledWith({ page: 0, size: 10, role: 'DRIVER' })
    expect(button(wrapper, 'Drivers').attributes('aria-selected')).toBe('true')
  })

  it('pages with the selected role kept', async () => {
    const wrapper = mountPage()
    await flushPromises()
    await button(wrapper, 'Customers').trigger('click')
    await flushPromises()
    userService.getAll.mockClear()

    await button(wrapper, 'Next').trigger('click')
    await flushPromises()

    expect(userService.getAll).toHaveBeenLastCalledWith({ page: 1, size: 10, role: 'CUSTOMER' })
  })

  it('shows an empty state for the tab, never sample data', async () => {
    userService.getAll.mockResolvedValue(pageResponse([]))
    const wrapper = mountPage()
    await flushPromises()

    await button(wrapper, 'Collectors').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="users-empty"]').text()).toContain('No collectors yet')
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('shows the error with a retry, never sample data', async () => {
    userService.getAll.mockRejectedValueOnce({ status: 500, message: 'Users unavailable' })
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.get('[data-testid="users-error"]').text()).toContain('Users unavailable')
    expect(wrapper.text()).not.toContain('Liam Peterson')
    expect(wrapper.find('table').exists()).toBe(false)

    await button(wrapper, 'Retry').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="users-error"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="user-row-1"]').exists()).toBe(true)
  })

  it('never shows the previous tab rows after a failed tab switch, and Retry reloads that tab', async () => {
    const wrapper = mountPage()
    await flushPromises()
    await button(wrapper, 'Next').trigger('click')
    await flushPromises()
    userService.getAll.mockRejectedValueOnce({ message: 'Network down' })

    await button(wrapper, 'Customers').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="user-row-1"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Network down')
    userService.getAll.mockClear()

    await button(wrapper, 'Retry').trigger('click')
    await flushPromises()

    expect(userService.getAll).toHaveBeenCalledWith({ page: 0, size: 10, role: 'CUSTOMER' })
  })

  it('shows the loading state, not the old tab, while a tab switch is in flight', async () => {
    const wrapper = mountPage()
    await flushPromises()
    userService.getAll.mockReturnValueOnce(new Promise(() => {}))

    await button(wrapper, 'Drivers').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="users-loading"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="user-row-1"]').exists()).toBe(false)
  })

  it('keeps the table when a later refresh fails', async () => {
    const wrapper = mountPage()
    await flushPromises()
    userService.getAll.mockRejectedValueOnce({ message: 'Temporary failure' })

    await button(wrapper, 'Next').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Temporary failure')
    expect(wrapper.find('[data-testid="user-row-1"]').exists()).toBe(true)
  })

  it('opens the create form from the floating button and the edit form from a row', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.get('[aria-label="Create user"]').trigger('click')
    expect(wrapper.get('[data-testid="user-form"]').text()).toBe('create')

    await wrapper.get('[aria-label="Edit khach@test.vn"]').trigger('click')
    expect(wrapper.get('[data-testid="user-form"]').text()).toBe('edit:2')
  })

  it('opens the lock dialog for another user and disables it on your own row', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.get('[aria-label="Lock Quản Trị"]').attributes('disabled')).toBeDefined()

    await wrapper.get('[aria-label="Unlock khach@test.vn"]').trigger('click')
    expect(wrapper.get('[data-testid="user-status"]').text()).toBe('2')
  })

  it('has no delete action and no bulk selection', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.find('[aria-label^="Delete"]').exists()).toBe(false)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false)
  })
})
