import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
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
    remove: vi.fn(),
  },
  routeService: {
    getAll: vi.fn(),
    remove: vi.fn(),
  },
}))

function pageResponse(content, { page = 0, totalElements, totalPages } = {}) {
  return {
    data: {
      data: {
        content,
        page,
        size: 12,
        totalElements: totalElements ?? content.length,
        totalPages: totalPages ?? (content.length ? 1 : 0),
      },
    },
  }
}

const apiBuses = [
  { id: 1, plateNumber: 'VN-100-A', capacity: 45, status: 'AVAILABLE' },
  { id: 2, plateNumber: 'VN-200-B', capacity: 29, status: 'MAINTENANCE' },
]

const apiRoutes = [
  {
    id: 3,
    routeName: 'Southern Highland Express',
    startPoint: 'Ho Chi Minh City',
    endPoint: 'Da Lat',
    distanceKm: 308,
    status: 'ACTIVE',
  },
]

function mountPage() {
  return mount(BusesRoutes, {
    global: {
      stubs: {
        UButton: {
          props: ['disabled', 'loading', 'type', 'label'],
          emits: ['click'],
          template:
            '<button v-bind="$attrs" :type="type" :disabled="disabled || loading" @click="$emit(`click`)"><slot name="leading" /><slot>{{ label }}</slot><slot name="trailing" /></button>',
        },
        UIcon: {
          template: '<span data-testid="icon"></span>',
        },
        ModalCreateBus: {
          props: ['modelValue', 'bus'],
          template:
            '<div v-if="modelValue" data-testid="bus-modal">{{ bus ? `edit:${bus.plateNumber}` : `create` }}</div>',
        },
        ModalCreateRoute: {
          props: ['modelValue', 'route'],
          template:
            '<div v-if="modelValue" data-testid="route-modal">{{ route ? `edit:${route.routeName}` : `create` }}</div>',
        },
        ModalDeleteConfirm: {
          props: ['modelValue', 'entityType', 'entityName', 'onConfirm'],
          template:
            '<div v-if="modelValue" data-testid="delete-modal">{{ entityType }}:{{ entityName }}<button type="button" @click="onConfirm()">Confirm</button></div>',
        },
      },
    },
  })
}

function buttonWithText(wrapper, text) {
  return wrapper.findAll('button').find((button) => button.text() === text)
}

describe('BusesRoutes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    busService.getAll.mockResolvedValue(pageResponse(apiBuses))
    routeService.getAll.mockResolvedValue(pageResponse(apiRoutes))
    busService.remove.mockResolvedValue({ data: {} })
    routeService.remove.mockResolvedValue({ data: {} })
  })

  it('loads the first page of buses and routes on mount', async () => {
    mountPage()
    await flushPromises()

    expect(busService.getAll).toHaveBeenCalledWith({ page: 0, size: 12 })
    expect(routeService.getAll).toHaveBeenCalledWith({ page: 0, size: 10 })
  })

  it('renders BE buses and routes with the real vehicle count and no sample data', async () => {
    busService.getAll.mockResolvedValue(
      pageResponse(apiBuses, { totalElements: 14, totalPages: 2 })
    )
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('14 vehicles in your network.')
    expect(wrapper.text()).toContain('VN-100-A')
    expect(wrapper.text()).toContain('Maintenance')
    expect(wrapper.text()).toContain('45 seats')
    expect(wrapper.text()).toContain('Ho Chi Minh City -> Da Lat')
    expect(wrapper.text()).toContain('Southern Highland Express')
    expect(wrapper.text()).toContain('308 KM')
    expect(wrapper.text()).not.toContain('FL-4289-X')
    expect(wrapper.text()).not.toContain('Uptime')
    expect(wrapper.find('[data-testid="route-mini-map"]').exists()).toBe(true)
  })

  it('shows a loading state per column while requests are pending', async () => {
    busService.getAll.mockReturnValue(new Promise(() => {}))
    routeService.getAll.mockReturnValue(new Promise(() => {}))
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.find('[data-testid="buses-loading"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="routes-loading"]').exists()).toBe(true)
  })

  it('shows empty states when there are no buses or routes', async () => {
    busService.getAll.mockResolvedValue(pageResponse([]))
    routeService.getAll.mockResolvedValue(pageResponse([]))
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.find('[data-testid="buses-empty"]').text()).toContain('No buses yet')
    expect(wrapper.find('[data-testid="routes-empty"]').text()).toContain('No routes yet')
  })

  it('shows the BE error with a retry button instead of sample data', async () => {
    busService.getAll.mockRejectedValueOnce({ status: 500, message: 'Buses unavailable' })
    const wrapper = mountPage()
    await flushPromises()

    const errorBlock = wrapper.get('[data-testid="buses-error"]')
    expect(errorBlock.text()).toContain('Buses unavailable')
    expect(wrapper.text()).not.toContain('FL-9901-B')

    await buttonWithText(errorBlock, 'Retry').trigger('click')
    await flushPromises()

    expect(busService.getAll).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[data-testid="buses-error"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('VN-100-A')
  })

  it('pages through buses with the pagination control', async () => {
    busService.getAll.mockResolvedValue(
      pageResponse(apiBuses, { totalElements: 14, totalPages: 2 })
    )
    const wrapper = mountPage()
    await flushPromises()

    await buttonWithText(wrapper, 'Next').trigger('click')
    await flushPromises()

    expect(busService.getAll).toHaveBeenLastCalledWith({ page: 1, size: 12 })
  })

  it('opens the bus modal in create mode from the header and the add card', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await buttonWithText(wrapper, 'Add New Bus').trigger('click')
    expect(wrapper.get('[data-testid="bus-modal"]').text()).toBe('create')

    await wrapper.get('[aria-label="Register vehicle"]').trigger('click')
    expect(wrapper.get('[data-testid="bus-modal"]').text()).toBe('create')
  })

  it('opens the bus modal in edit mode with the BE bus', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.get('[aria-label="Edit bus VN-200-B"]').trigger('click')

    expect(wrapper.get('[data-testid="bus-modal"]').text()).toBe('edit:VN-200-B')
  })

  it('deletes a bus through the shared confirm modal and reloads the list', async () => {
    const wrapper = mountPage()
    await flushPromises()
    busService.getAll.mockClear()

    await wrapper.get('[aria-label="Delete bus VN-100-A"]').trigger('click')
    const modal = wrapper.get('[data-testid="delete-modal"]')
    expect(modal.text()).toContain('bus:VN-100-A')

    await modal.get('button').trigger('click')
    await flushPromises()

    expect(busService.remove).toHaveBeenCalledWith(1)
    expect(busService.getAll).toHaveBeenCalledTimes(1)
  })

  it('opens the route modal in create and edit mode', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await buttonWithText(wrapper, 'Add Route').trigger('click')
    expect(wrapper.get('[data-testid="route-modal"]').text()).toBe('create')

    await wrapper.get('[aria-label="Edit route Ho Chi Minh City to Da Lat"]').trigger('click')
    expect(wrapper.get('[data-testid="route-modal"]').text()).toBe('edit:Southern Highland Express')
  })

  it('deletes a route by its route name and reloads routes', async () => {
    const wrapper = mountPage()
    await flushPromises()
    routeService.getAll.mockClear()

    await wrapper.get('[aria-label="Delete route Ho Chi Minh City to Da Lat"]').trigger('click')
    const modal = wrapper.get('[data-testid="delete-modal"]')
    expect(modal.text()).toContain('route:Southern Highland Express')

    await modal.get('button').trigger('click')
    await flushPromises()

    expect(routeService.remove).toHaveBeenCalledWith(3)
    expect(routeService.getAll).toHaveBeenCalledTimes(1)
  })

  it('does not render the old driver assignment workflow', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).not.toContain('Selected driver')
    expect(wrapper.text()).not.toContain('Save assignment')
    expect(wrapper.text()).not.toContain('Driver vehicle management')
  })

  it('keeps the current cards on screen while a page change is loading', async () => {
    busService.getAll.mockResolvedValueOnce(
      pageResponse(apiBuses, { totalElements: 14, totalPages: 2 })
    )
    const wrapper = mountPage()
    await flushPromises()
    busService.getAll.mockReturnValue(new Promise(() => {}))

    await buttonWithText(wrapper, 'Next').trigger('click')

    expect(wrapper.find('[data-testid="buses-loading"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('VN-100-A')
  })

  it('keeps the list and shows the error when a refresh fails', async () => {
    const wrapper = mountPage()
    await flushPromises()
    busService.getAll.mockRejectedValueOnce({ status: 500, message: 'Refresh failed' })

    await wrapper.get('[aria-label="Delete bus VN-100-A"]').trigger('click')
    await wrapper.get('[data-testid="delete-modal"] button').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-testid="buses-error"]').text()).toContain('Refresh failed')
    expect(wrapper.text()).toContain('VN-100-A')
  })

  it('selects the next active route after the selected route is deleted', async () => {
    const second = {
      ...apiRoutes[0],
      id: 4,
      routeName: 'Coastal',
      startPoint: 'Hue',
      endPoint: 'Da Nang',
    }
    routeService.getAll.mockResolvedValueOnce(pageResponse([apiRoutes[0], second]))
    const wrapper = mountPage()
    await flushPromises()
    routeService.getAll.mockResolvedValueOnce(pageResponse([second]))

    await wrapper.get('[aria-label="Delete route Ho Chi Minh City to Da Lat"]').trigger('click')
    await wrapper.get('[data-testid="delete-modal"] button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Hue → Da Nang')
  })
})
