import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import RevenueReports from '@/pages/admin/RevenueReports.vue'
import {
  getRevenueByDate,
  getRevenueByRoute,
  getRevenueReport,
  getTopCustomers,
} from '@/services/revenueService'

vi.mock('@/services/revenueService', () => ({
  getRevenueReport: vi.fn(),
  getRevenueByRoute: vi.fn(),
  getRevenueByDate: vi.fn(),
  getTopCustomers: vi.fn(),
}))

function mountPage() {
  return mount(RevenueReports, {
    global: {
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

describe('RevenueReports', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getRevenueReport.mockResolvedValue({ data: {} })
    getRevenueByRoute.mockResolvedValue({ data: [] })
    getRevenueByDate.mockResolvedValue({ data: [] })
    getTopCustomers.mockResolvedValue({ data: [] })
  })

  it('renders the new sticky filters and export action', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Revenue Reports')
    expect(wrapper.text()).toContain('Daily')
    expect(wrapper.text()).toContain('Weekly')
    expect(wrapper.text()).toContain('Monthly')
    expect(wrapper.text()).toContain('Export PDF')
    expect(wrapper.text()).toContain('Oct 01 - Oct 31')
  })

  it('calls all revenue APIs on mount', async () => {
    mountPage()
    await flushPromises()

    expect(getRevenueReport).toHaveBeenCalledWith({ period: 'daily' })
    expect(getRevenueByRoute).toHaveBeenCalledWith({ period: 'daily' })
    expect(getRevenueByDate).toHaveBeenCalledWith({ period: 'daily' })
    expect(getTopCustomers).toHaveBeenCalledWith({ period: 'daily' })
  })

  it('refetches APIs when switching period tabs', async () => {
    const wrapper = mountPage()
    await flushPromises()
    vi.clearAllMocks()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Weekly')
      .trigger('click')
    await flushPromises()

    expect(getRevenueReport).toHaveBeenCalledWith({ period: 'weekly' })
    expect(getRevenueByRoute).toHaveBeenCalledWith({ period: 'weekly' })
    expect(getRevenueByDate).toHaveBeenCalledWith({ period: 'weekly' })
    expect(getTopCustomers).toHaveBeenCalledWith({ period: 'weekly' })
  })

  it('renders fallback report sections when APIs are empty', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('$482,950.00')
    expect(wrapper.text()).toContain('LDN-MCR')
    expect(wrapper.text()).toContain('#FV-204')
    expect(wrapper.text()).toContain('Revenue Density')
    expect(wrapper.text()).toContain('Elena Rodriguez')
  })

  it('renders API-provided values when services return records', async () => {
    getRevenueReport.mockResolvedValueOnce({
      data: {
        totalRevenue: 999999,
        avgRevenuePerTrip: 2222,
        avgRevenuePerBus: 3333,
        revenueGrowth: 4.5,
        buses: [
          {
            busId: '#API-1',
            operator: 'API Operator',
            earnings: 45678,
            trips: 12,
            status: 'maintenance',
          },
        ],
      },
    })
    getRevenueByRoute.mockResolvedValueOnce({
      data: [{ label: 'API-RTE', revenue: 88888, loadFactor: 77 }],
    })
    getRevenueByDate.mockResolvedValueOnce({
      data: { heatmap: [{ value: 8 }, { value: 1 }] },
    })
    getTopCustomers.mockResolvedValueOnce({
      data: { staff: [{ id: 1, name: 'API Staff', role: 'Revenue Lead', score: 99 }] },
    })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('$999,999.00')
    expect(wrapper.text()).toContain('API-RTE')
    expect(wrapper.text()).toContain('#API-1')
    expect(wrapper.text()).toContain('API Operator')
    expect(wrapper.text()).toContain('API Staff')
  })

  it('does not render the previous RevenueReports UI labels', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).not.toContain('Revenue by Date')
    expect(wrapper.text()).not.toContain('Top Customers')
    expect(wrapper.text()).not.toContain('FromTo')
    expect(wrapper.text()).not.toContain('From ')
    expect(wrapper.text()).not.toContain(' To ')
    expect(wrapper.text()).not.toContain('Apply')
  })
})
