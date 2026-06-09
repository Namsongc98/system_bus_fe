import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import DashboardView from '@/pages/admin/DashboardView.vue'
import { ROUTE_NAMES } from '@/constants/routes'
import { adminService } from '@/services/adminService'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ path: '/admin/dashboard', name: ROUTE_NAMES.ADMIN_DASHBOARD }),
}))

vi.mock('@/services/adminService', () => ({
  adminService: {
    getDashboard: vi.fn(),
    getStats: vi.fn(),
    getRevenue: vi.fn(),
  },
}))

function mountPage() {
  return mount(DashboardView, {
    global: {
      plugins: [createPinia()],
      stubs: {
        UButton: {
          props: ['disabled', 'loading', 'type'],
          emits: ['click'],
          template:
            '<button :type="type" :disabled="disabled || loading" @click="$emit(`click`)"><slot name="leading" /><slot /><slot name="trailing" /></button>',
        },
      },
    },
  })
}

describe('DashboardView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    adminService.getDashboard.mockResolvedValue({ data: { data: {} } })
    adminService.getStats.mockResolvedValue({ data: { data: {} } })
    adminService.getRevenue.mockResolvedValue({ data: { data: [] } })
  })

  it('renders fallback KPI cards when API data is empty', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('₫125.5M')
    expect(wrapper.text()).toContain('342')
    expect(wrapper.text()).toContain('8,450')
    expect(wrapper.text()).toContain('1,245')
  })

  it('renders the fallback revenue trend chart', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Revenue Trend')
    expect(wrapper.text()).toContain('JAN')
    expect(wrapper.text()).toContain('JUN')
  })

  it('renders loading state while dashboard requests are pending', async () => {
    adminService.getDashboard.mockReturnValue(new Promise(() => {}))
    adminService.getStats.mockReturnValue(new Promise(() => {}))
    adminService.getRevenue.mockReturnValue(new Promise(() => {}))

    const wrapper = mountPage()
    await nextTick()

    expect(wrapper.text()).toContain('Loading dashboard data...')
  })

  it('renders an error banner while keeping fallback UI visible', async () => {
    adminService.getDashboard.mockRejectedValueOnce(new Error('Dashboard unavailable'))

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Dashboard unavailable')
    expect(wrapper.text()).toContain('Showing review data')
    expect(wrapper.text()).toContain('Loyal Voyagers')
  })

  it('routes New Booking to admin tickets', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.get('[data-testid="new-booking-button"]').trigger('click')

    expect(push).toHaveBeenCalledWith({ name: ROUTE_NAMES.ADMIN_TICKETS })
  })

  it('refetches revenue when chart period changes', async () => {
    const wrapper = mountPage()
    await flushPromises()
    adminService.getRevenue.mockClear()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Weekly')
      .trigger('click')
    await flushPromises()

    expect(adminService.getRevenue).toHaveBeenCalledWith({ period: 'weekly' })
  })

  it('renders loyal customers and live bookings from fallback data', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Nguyen Van A')
    expect(wrapper.text()).toContain('PLATINUM')
    expect(wrapper.text()).toContain('Ticket #FV-2849 Sold')
    expect(wrapper.text()).toContain('LIVE PULSE')
  })
})
