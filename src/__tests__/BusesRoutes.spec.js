import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import BusesRoutes from '@/pages/admin/BusesRoutes.vue'
import { busService, routeService } from '@/services/busRouteService'

const leafletLayer = {
  addTo: vi.fn(() => leafletLayer),
  bindTooltip: vi.fn(() => leafletLayer),
  getBounds: vi.fn(() => [
    [51.5, -0.1],
    [53.4, -2.2],
  ]),
  remove: vi.fn(),
}

const leafletMap = {
  setView: vi.fn(() => leafletMap),
  fitBounds: vi.fn(),
  invalidateSize: vi.fn(),
  remove: vi.fn(),
}

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => leafletMap),
    tileLayer: vi.fn(() => leafletLayer),
    polyline: vi.fn(() => leafletLayer),
    circleMarker: vi.fn(() => leafletLayer),
  },
}))

vi.mock('@/services/busRouteService', () => ({
  busService: {
    getAll: vi.fn(),
  },
  routeService: {
    getAll: vi.fn(),
    remove: vi.fn(),
  },
}))

const apiBuses = [
  {
    id: 1,
    plateNumber: 'VN-100-A',
    model: 'Hyundai Universe',
    capacity: 45,
    uptime: 91,
    age: '3y',
    status: 'active',
    driverNames: ['Long', 'Minh'],
  },
]

const apiRoutes = [
  {
    id: 2,
    origin: 'Ho Chi Minh City',
    destination: 'Da Lat',
    name: 'Southern Highland Express',
    distanceKm: 308,
    duration: '7h 30m',
    stops: 4,
    status: 'active',
    activeBuses: 6,
    startLat: 10.7769,
    startLng: 106.7009,
    endLat: 11.9404,
    endLng: 108.4583,
  },
]

function mountPage() {
  return mount(BusesRoutes, {
    global: {
      stubs: {
        UButton: {
          props: ['disabled', 'loading', 'type'],
          emits: ['click'],
          template:
            '<button v-bind="$attrs" :type="type" :disabled="disabled || loading" @click="$emit(`click`)"><slot name="leading" /><slot /><slot name="trailing" /></button>',
        },
        UIcon: {
          template: '<span data-testid="icon"></span>',
        },
        ModalCreateBus: {
          props: ['modelValue'],
          emits: ['update:modelValue', 'created'],
          template:
            '<div v-if="modelValue" data-testid="create-bus-modal"><button type="button" @click="$emit(`created`)">Emit Created</button></div>',
        },
        ModalCreateRoute: {
          props: ['modelValue'],
          emits: ['update:modelValue', 'created'],
          template:
            '<div v-if="modelValue" data-testid="create-route-modal"><button type="button" @click="$emit(`created`)">Emit Created</button></div>',
        },
        ModalDeleteRoute: {
          props: ['modelValue', 'route'],
          emits: ['update:modelValue', 'deleted'],
          template:
            '<div v-if="modelValue" data-testid="delete-route-modal"><p>{{ route?.subtitle }}</p><button type="button" @click="$emit(`deleted`, route)">Emit Deleted</button></div>',
        },
      },
    },
  })
}

describe('BusesRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    busService.getAll.mockResolvedValue({ data: { data: [] } })
    routeService.getAll.mockResolvedValue({ data: { data: [] } })
  })

  it('calls bus and route APIs on mount', async () => {
    mountPage()
    await flushPromises()

    expect(busService.getAll).toHaveBeenCalledTimes(1)
    expect(routeService.getAll).toHaveBeenCalledTimes(1)
  })

  it('renders fallback fleet, routes, and mini map when APIs are empty', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Buses Fleet')
    expect(wrapper.text()).toContain('Routes Network')
    expect(wrapper.text()).toContain('FL-4289-X')
    expect(wrapper.text()).toContain('London -> Manchester')
    expect(wrapper.find('[data-testid="route-mini-map"]').exists()).toBe(true)
  })

  it('renders API-provided buses and routes when records are available', async () => {
    busService.getAll.mockResolvedValueOnce({ data: { data: apiBuses } })
    routeService.getAll.mockResolvedValueOnce({ data: { data: apiRoutes } })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('VN-100-A')
    expect(wrapper.text()).toContain('Hyundai')
    expect(wrapper.text()).toContain('Ho Chi Minh City -> Da Lat')
    expect(wrapper.text()).toContain('Southern Highland Express')
    expect(wrapper.text()).toContain('308 KM')
  })

  it('uses sample fallbacks when the fleet APIs fail', async () => {
    busService.getAll.mockRejectedValueOnce(new Error('Buses unavailable'))
    routeService.getAll.mockRejectedValueOnce(new Error('Routes unavailable'))

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Fleet APIs returned no records')
    expect(wrapper.text()).toContain('FL-9901-B')
    expect(wrapper.text()).toContain('Birmingham -> Leeds')
  })

  it('does not render the old driver assignment workflow', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).not.toContain('Selected driver')
    expect(wrapper.text()).not.toContain('Save assignment')
    expect(wrapper.text()).not.toContain('Current plate')
    expect(wrapper.text()).not.toContain('Driver vehicle management')
  })

  it('opens the create route modal from the Add Route button', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Add Route')
      .trigger('click')

    expect(wrapper.find('[data-testid="create-route-modal"]').exists()).toBe(true)
  })

  it('opens the create bus modal from the Add New Bus button', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Add New Bus')
      .trigger('click')

    expect(wrapper.find('[data-testid="create-bus-modal"]').exists()).toBe(true)
  })

  it('refreshes fleet network after the create bus modal emits created', async () => {
    const wrapper = mountPage()
    await flushPromises()
    busService.getAll.mockClear()
    routeService.getAll.mockClear()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Add New Bus')
      .trigger('click')
    await wrapper.get('[data-testid="create-bus-modal"] button').trigger('click')
    await flushPromises()

    expect(busService.getAll).toHaveBeenCalledTimes(1)
    expect(routeService.getAll).toHaveBeenCalledTimes(1)
  })

  it('refreshes fleet network after the create route modal emits created', async () => {
    const wrapper = mountPage()
    await flushPromises()
    busService.getAll.mockClear()
    routeService.getAll.mockClear()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Add Route')
      .trigger('click')
    await wrapper.get('[data-testid="create-route-modal"] button').trigger('click')
    await flushPromises()

    expect(busService.getAll).toHaveBeenCalledTimes(1)
    expect(routeService.getAll).toHaveBeenCalledTimes(1)
  })

  it('opens the delete route modal from a route card delete button', async () => {
    busService.getAll.mockResolvedValueOnce({ data: { data: apiBuses } })
    routeService.getAll.mockResolvedValueOnce({ data: { data: apiRoutes } })

    const wrapper = mountPage()
    await flushPromises()

    await wrapper.get('[aria-label="Delete route Ho Chi Minh City to Da Lat"]').trigger('click')

    expect(wrapper.find('[data-testid="delete-route-modal"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Southern Highland Express')
  })

  it('refreshes fleet network after the delete route modal emits deleted', async () => {
    busService.getAll.mockResolvedValueOnce({ data: { data: apiBuses } })
    routeService.getAll.mockResolvedValueOnce({ data: { data: apiRoutes } })

    const wrapper = mountPage()
    await flushPromises()
    busService.getAll.mockClear()
    routeService.getAll.mockClear()

    await wrapper.get('[aria-label="Delete route Ho Chi Minh City to Da Lat"]').trigger('click')
    await wrapper.get('[data-testid="delete-route-modal"] button').trigger('click')
    await flushPromises()

    expect(busService.getAll).toHaveBeenCalledTimes(1)
    expect(routeService.getAll).toHaveBeenCalledTimes(1)
  })
})
