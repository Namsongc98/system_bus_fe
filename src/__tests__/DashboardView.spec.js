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
    getRevenue: vi.fn(),
  },
}))

const dashboardPayload = {
  data: {
    period: { startDate: '2026-06-01', endDate: '2026-06-30' },
    kpis: {
      totalRevenue: 125500000,
      revenueTrendPercent: 12.5,
      tripsCompleted: 342,
      tripsTrendPercent: 8.4,
      ticketsSold: 8450,
      ticketsTrendPercent: -2.1,
      activeCustomers: 1245,
      customersTrendPercent: null,
    },
    topRoutes: [
      {
        routeId: 1,
        name: 'Hanoi - Da Nang',
        ticketsSold: 2420,
        sharePercent: 88,
      },
    ],
    loyalCustomers: [
      {
        customerId: 1,
        customer: 'Nguyen Van A',
        trips: 24,
        totalSpent: 18200000,
        rank: 1,
      },
    ],
    recentBookings: [
      {
        ticketId: 2849,
        customer: 'Pham Minh D',
        routeName: 'Hanoi - Da Nang',
        seatNumber: 12,
        amount: 450000,
        occurredAt: new Date(Date.now() - 120000).toISOString(),
      },
    ],
  },
}

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
    adminService.getDashboard.mockResolvedValue(dashboardPayload)
    adminService.getRevenue.mockResolvedValue({
      data: [
        { label: 'JAN', startDate: '2026-01-01', endDate: '2026-01-31', amount: 1000 },
      ],
    })
  })

  it('loads the overview and monthly revenue without a stats request', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(adminService.getDashboard).toHaveBeenCalledOnce()
    expect(adminService.getRevenue).toHaveBeenCalledWith({ period: 'monthly' })
    expect(Object.keys(adminService)).not.toContain('getStats')
    expect(wrapper.text()).toContain('125.500.000')
    expect(wrapper.text()).toContain('+12.5%')
    expect(wrapper.text()).toContain('-2.1%')
    expect(wrapper.text()).toContain('N/A')
  })

  it('renders API route, customer rank, and recent booking data', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Hanoi - Da Nang')
    expect(wrapper.text()).toContain('2,420 tickets')
    expect(wrapper.find('[style="width: 88%;"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Nguyen Van A')
    expect(wrapper.text()).toContain('#1')
    expect(wrapper.text()).toContain('Ticket #2849 sold')
    expect(wrapper.text()).toContain('2m ago')
  })

  it('renders empty states without fallback business data', async () => {
    adminService.getDashboard.mockResolvedValue({
      data: {
        kpis: {
          totalRevenue: 0,
          tripsCompleted: 0,
          ticketsSold: 0,
          activeCustomers: 0,
        },
        topRoutes: [],
        loyalCustomers: [],
        recentBookings: [],
      },
    })
    adminService.getRevenue.mockResolvedValue({ data: [] })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('No revenue data')
    expect(wrapper.text()).toContain('No route performance')
    expect(wrapper.text()).toContain('No loyal customers yet')
    expect(wrapper.text()).toContain('No recent bookings')
    expect(wrapper.text()).not.toContain('PLATINUM')
  })

  it('renders overview loading independently', async () => {
    adminService.getDashboard.mockReturnValue(new Promise(() => {}))

    const wrapper = mountPage()
    await nextTick()

    expect(wrapper.text()).toContain('Loading dashboard data...')
  })

  it('keeps overview data visible when revenue loading fails', async () => {
    adminService.getRevenue.mockRejectedValue(new Error('Revenue unavailable'))

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('125.500.000')
    expect(wrapper.text()).toContain('No revenue data')
    expect(wrapper.get('[role="alert"]').text()).toContain('Revenue unavailable')
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

  it('routes New Booking to admin tickets', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.get('[data-testid="new-booking-button"]').trigger('click')

    expect(push).toHaveBeenCalledWith({ name: ROUTE_NAMES.ADMIN_TICKETS })
  })
})
