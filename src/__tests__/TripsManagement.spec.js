import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TripsManagement from '@/pages/admin/TripsManagement.vue'
import { tripService } from '@/services/tripService'
import { routeService } from '@/services/busRouteService'

vi.mock('@/services/tripService', () => ({
  tripService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('@/services/busRouteService', () => ({
  routeService: { getAll: vi.fn() },
  busService: { getAll: vi.fn() },
}))

const RANGE = { from: new Date(2030, 0, 1), to: new Date(2030, 1, 1) }

function tripResponse(id, overrides = {}) {
  return {
    id,
    status: 'SCHEDULED',
    departureTime: '2030-01-10T08:00:00',
    arrivalTime: '2030-01-10T11:00:00',
    route: { id: 1, routeName: 'HN - HP', startPoint: 'Hà Nội', endPoint: 'Hải Phòng' },
    bus: { id: 2, plateNumber: '29A-20001', capacity: 40, status: 'IN_USE' },
    driver: { id: 3, email: 'd@test.vn', fullName: 'Tài Xế' },
    bookedSeats: 10,
    revenue: 1500000,
    ...overrides,
  }
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

// Answers by the params the store sends: list (page/size 10), calendar (from+to), highlights (size 2).
function routeGetAll(handlers = {}) {
  tripService.getAll.mockImplementation((params) => {
    if (params.size === 2)
      return Promise.resolve(handlers.highlights ?? pageResponse([tripResponse(7)]))
    if (params.from && params.to)
      return Promise.resolve(handlers.calendar ?? pageResponse([tripResponse(8)]))
    return handlers.list ? handlers.list(params) : Promise.resolve(pageResponse([tripResponse(9)]))
  })
}

function mountPage() {
  return mount(TripsManagement, {
    global: {
      plugins: [createPinia()],
      stubs: {
        BaseButton: {
          props: ['disabled', 'loading', 'label'],
          emits: ['click'],
          template:
            '<button :disabled="disabled || loading" @click="$emit(`click`)">{{ label }}<slot /></button>',
        },
        BaseTabs: {
          props: ['modelValue', 'options'],
          emits: ['update:model-value'],
          template:
            '<div><button v-for="o in options" :key="o.value" :data-tab="o.value" @click="$emit(`update:model-value`, o.value)">{{ o.label }}</button></div>',
        },
        BaseSortFilter: {
          props: ['modelValue', 'options', 'label'],
          emits: ['update:modelValue'],
          template:
            '<label><span>{{ label }}</span><select :data-filter="label" :value="modelValue" @change="$emit(`update:modelValue`, $event.target.value)"><option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option></select></label>',
        },
        TripsCalendarGrid: {
          props: ['trips'],
          emits: ['trip-click', 'range-change'],
          template:
            '<div data-testid="trips-calendar"><span v-for="t in trips" :key="t.id">{{ t.code }}</span><button data-testid="calendar-trip" @click="$emit(`trip-click`, trips[0])">open</button><button data-testid="calendar-range" @click="$emit(`range-change`, range)">range</button></div>',
          data: () => ({ range: RANGE }),
        },
        ModalCreateTrip: {
          props: ['modelValue', 'trip'],
          template:
            '<div v-if="modelValue" data-testid="trip-form">{{ trip ? `edit:${trip.id}` : `create` }}</div>',
        },
        ModalTripDetails: {
          props: ['modelValue', 'trip'],
          emits: ['edit', 'delete'],
          template:
            '<div v-if="modelValue" data-testid="trip-details">{{ trip && trip.code }}<button data-testid="details-edit" @click="$emit(`edit`, trip.raw)">edit</button><button data-testid="details-delete" @click="$emit(`delete`, trip)">delete</button></div>',
        },
        ModalDeleteConfirm: {
          props: ['modelValue', 'entityName', 'entityType'],
          template:
            '<div v-if="modelValue" data-testid="trip-delete">{{ entityType }}:{{ entityName }}</div>',
        },
        TripHighlightCard: {
          props: ['trip'],
          template: '<article data-testid="highlight">{{ trip.code }} {{ trip.route }}</article>',
        },
        UIcon: { template: '<span></span>' },
      },
    },
  })
}

function button(wrapper, text) {
  return wrapper.findAll('button').find((b) => b.text() === text)
}

describe('TripsManagement', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    routeGetAll()
    routeService.getAll.mockResolvedValue(
      pageResponse([
        { id: 1, routeName: 'HN - HP' },
        { id: 4, routeName: 'HN - ND' },
      ])
    )
  })

  it('loads the list, highlights and route options on mount — never sample data', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(tripService.getAll).toHaveBeenCalledWith({ page: 0, size: 10 })
    expect(tripService.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'SCHEDULED', size: 2, page: 0 })
    )
    expect(routeService.getAll).toHaveBeenCalledWith({ page: 0, size: 100 })
    expect(wrapper.get('[data-testid="highlight"]').text()).toContain('#TR-7')
    expect(wrapper.get('[data-testid="highlight"]').text()).toContain('Hà Nội ➔ Hải Phòng')
    expect(wrapper.text()).not.toContain('#TR-2045')
    expect(wrapper.findAll('[data-filter="Route"] option').map((o) => o.text())).toEqual([
      'All Routes',
      'HN - HP',
      'HN - ND',
    ])
  })

  it('loads the calendar for the range it reports, with the current filters', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.get('[data-testid="calendar-range"]').trigger('click')
    await flushPromises()

    expect(tripService.getAll).toHaveBeenCalledWith({
      from: '2030-01-01T00:00:00',
      to: '2030-02-01T00:00:00',
      page: 0,
      size: 100,
    })
    expect(wrapper.get('[data-testid="trips-calendar"]').text()).toContain('#TR-8')
  })

  it('warns when the calendar range holds more trips than it loads', async () => {
    routeGetAll({
      calendar: pageResponse([tripResponse(8)], { totalElements: 150, totalPages: 2 }),
    })
    const wrapper = mountPage()
    await flushPromises()
    await wrapper.get('[data-testid="calendar-range"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="calendar-capped"]').text()).toContain('first 100 of 150')
  })

  it('sends the status and route filters to the server and goes back to page 0', async () => {
    const wrapper = mountPage()
    await flushPromises()
    await wrapper.get('[data-testid="calendar-range"]').trigger('click')
    await flushPromises()
    tripService.getAll.mockClear()

    await wrapper.get('[data-filter="Status"]').setValue('CANCELLED')
    await flushPromises()
    await wrapper.get('[data-filter="Route"]').setValue('4')
    await flushPromises()

    expect(tripService.getAll).toHaveBeenCalledWith({
      status: 'CANCELLED',
      routeId: '4',
      page: 0,
      size: 10,
    })
    expect(tripService.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'CANCELLED', routeId: '4', size: 100 })
    )
  })

  it('list view shows the paged table with the real total and pages through it', async () => {
    routeGetAll({
      list: (params) =>
        Promise.resolve(
          pageResponse([tripResponse(params.page === 1 ? 12 : 9)], {
            page: params.page,
            totalElements: 11,
            totalPages: 2,
          })
        ),
    })
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.get('[data-tab="list"]').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="trips-calendar"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('#TR-9')
    expect(wrapper.text()).toContain('Showing 1 of 11 trips')

    await button(wrapper, 'Next').trigger('click')
    await flushPromises()

    expect(tripService.getAll).toHaveBeenLastCalledWith({ page: 1, size: 10 })
    expect(wrapper.text()).toContain('#TR-12')
  })

  it('shows the list error with Retry and the empty state, never sample data', async () => {
    let fail = true
    routeGetAll({
      list: () =>
        fail
          ? Promise.reject({ status: 500, message: 'Trips unavailable' })
          : Promise.resolve(pageResponse([])),
    })
    const wrapper = mountPage()
    await flushPromises()
    await wrapper.get('[data-tab="list"]').trigger('click')

    expect(wrapper.get('[data-testid="trips-error"]').text()).toContain('Trips unavailable')
    expect(wrapper.text()).not.toContain('#TR-2045')

    fail = false
    await button(wrapper, 'Retry').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-testid="trips-error"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="trips-empty"]').exists()).toBe(true)
  })

  it('View All switches to the list filtered on scheduled trips', async () => {
    const wrapper = mountPage()
    await flushPromises()
    tripService.getAll.mockClear()

    await button(wrapper, 'View All').trigger('click')
    await flushPromises()

    expect(tripService.getAll).toHaveBeenCalledWith({ status: 'SCHEDULED', page: 0, size: 10 })
    expect(wrapper.find('[data-testid="trips-calendar"]').exists()).toBe(false)
  })

  it('opens details from the calendar, then edit and delete from the details', async () => {
    const wrapper = mountPage()
    await flushPromises()
    await wrapper.get('[data-testid="calendar-range"]').trigger('click')
    await flushPromises()

    await wrapper.get('[data-testid="calendar-trip"]').trigger('click')
    expect(wrapper.get('[data-testid="trip-details"]').text()).toContain('#TR-8')

    await wrapper.get('[data-testid="details-edit"]').trigger('click')
    expect(wrapper.get('[data-testid="trip-form"]').text()).toBe('edit:8')

    await wrapper.get('[data-testid="details-delete"]').trigger('click')
    expect(wrapper.get('[data-testid="trip-delete"]').text()).toBe('trip:#TR-8')
  })

  it('opens the wizard in create mode from New Trip', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await button(wrapper, 'New Trip').trigger('click')

    expect(wrapper.get('[data-testid="trip-form"]').text()).toBe('create')
  })
})
