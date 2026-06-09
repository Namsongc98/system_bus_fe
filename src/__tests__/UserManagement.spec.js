import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UserManagement from '@/pages/admin/UserManagement.vue'
import { userService } from '@/services/userService'

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('@/services/userService', () => ({
  userService: {
    getAll: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    deleteById: vi.fn(),
  },
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => toast,
}))

function mountPage() {
  return mount(UserManagement, {
    global: {
      plugins: [createPinia()],
      stubs: {
        UButton: {
          props: ['disabled', 'loading', 'type'],
          emits: ['click'],
          template:
            '<button :type="type" :disabled="disabled || loading" @click="$emit(`click`)"><slot name="leading" /><slot /><slot name="trailing" /></button>',
        },
        UIcon: {
          template: '<span data-testid="icon"></span>',
        },
      },
    },
  })
}

describe('UserManagement', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    userService.getAll.mockResolvedValue({
      data: {
        data: {
          content: [
            {
              id: 1,
              fullName: 'API Admin',
              email: 'admin@example.com',
              role: 'ROLE_ADMIN',
              status: 'active',
              lastLoginAt: 'Today',
            },
            {
              _id: 'customer-1',
              username: 'API Customer',
              email: 'customer@example.com',
              role: 'customer',
              enabled: false,
            },
          ],
          totalElements: 22,
        },
      },
    })
    userService.deleteById.mockResolvedValue({ data: { success: true } })
  })

  it('fetches users on mount with the first page params', async () => {
    mountPage()
    await flushPromises()

    expect(userService.getAll).toHaveBeenCalledWith({ page: 0, size: 10 })
  })

  it('renders API users with normalized profile, role, and status fields', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('API Admin')
    expect(wrapper.text()).toContain('admin@example.com')
    expect(wrapper.text()).toContain('ADMIN')
    expect(wrapper.text()).toContain('API Customer')
    expect(wrapper.text()).toContain('CUSTOMER')
    expect(wrapper.text()).toContain('No recent activity')
    expect(wrapper.find('[aria-label="Inactive user"]').exists()).toBe(true)
  })

  it('refetches with selected role and resets to the first page', async () => {
    const wrapper = mountPage()
    await flushPromises()
    userService.getAll.mockClear()

    await wrapper
      .findAll('button')
      .find((button) => button.text().includes('Customers'))
      .trigger('click')
    await flushPromises()

    expect(userService.getAll).toHaveBeenCalledWith({ page: 0, size: 10, role: 'customer' })
  })

  it('fetches the next and previous pages from pagination controls', async () => {
    const wrapper = mountPage()
    await flushPromises()
    userService.getAll.mockClear()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Next')
      .trigger('click')
    await flushPromises()

    expect(userService.getAll).toHaveBeenLastCalledWith({ page: 1, size: 10 })

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Previous')
      .trigger('click')
    await flushPromises()

    expect(userService.getAll).toHaveBeenLastCalledWith({ page: 0, size: 10 })
  })

  it('shows fallback feedback when the API returns no users', async () => {
    userService.getAll.mockResolvedValueOnce({ data: { data: { content: [], totalElements: 0 } } })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('No users were returned by the API')
    expect(wrapper.text()).toContain('Sarah Jenkins')
  })

  it('shows error feedback without crashing when user loading fails', async () => {
    userService.getAll.mockRejectedValueOnce(new Error('Users unavailable'))

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Users unavailable')
    expect(wrapper.text()).toContain('Liam Peterson')
  })

  it('confirms, deletes, shows a toast, and refreshes the list', async () => {
    const wrapper = mountPage()
    await flushPromises()
    userService.getAll.mockClear()

    await wrapper.get('[aria-label="Delete API Admin"]').trigger('click')
    await flushPromises()

    expect(window.confirm).toHaveBeenCalledWith('Delete API Admin? This action cannot be undone.')
    expect(userService.deleteById).toHaveBeenCalledWith(1)
    expect(toast.success).toHaveBeenCalledWith('User deleted successfully')
    expect(userService.getAll).toHaveBeenCalledWith({ page: 0, size: 10 })
  })
})
