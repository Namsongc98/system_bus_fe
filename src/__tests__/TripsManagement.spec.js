import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import TripsManagement from '@/pages/admin/TripsManagement.vue'
import { tripService } from '@/services/tripService'

vi.mock('@/services/tripService', () => ({
  tripService: {
    getAll: vi.fn(),
  },
}))

function mountPage() {
  return mount(TripsManagement, {
    global: {
      stubs: {
        UButton: {
          props: ['disabled', 'loading', 'type'],
          emits: ['click'],
          template:
            '<button :type="type" :disabled="disabled || loading" @click="$emit(`click`)"><slot name="leading" /><slot /><slot name="trailing" /></button>',
        },
        USelect: {
          props: ['modelValue', 'items', 'disabled'],
          emits: ['update:model-value'],
          template:
            '<select :value="modelValue" :disabled="disabled" @change="$emit(`update:model-value`, $event.target.value)"><option v-for="item in items" :key="item.value" :value="item.value">{{ item.label }}</option></select>',
        },
        BaseSortFilter: {
          props: ['modelValue', 'options', 'label', 'disabled'],
          emits: ['update:modelValue'],
          template:
            '<label><span>{{ label }}</span><select :value="modelValue" :disabled="disabled" @change="$emit(`update:modelValue`, $event.target.value)"><option v-for="item in options" :key="item.value" :value="item.value">{{ item.label }}</option></select></label>',
        },
        ModalCreateTrip: {
          props: ['modelValue'],
          emits: ['update:modelValue', 'created'],
          template:
            '<div v-if="modelValue" data-testid="create-trip-modal"><button type="button" @click="$emit(`created`)">Emit Created</button></div>',
        },
        ModalTripDetails: {
          props: ['modelValue', 'trip'],
          emits: ['update:modelValue'],
          template:
            '<div v-if="modelValue" data-testid="trip-details-modal">{{ trip.code }} {{ trip.route }}</div>',
        },
        TripsCalendarGrid: {
          props: ['trips'],
          emits: ['trip-click'],
          template:
            '<div data-testid="trips-calendar"><button v-if="trips.length" type="button" data-testid="calendar-trip" @click="$emit(`trip-click`, trips[0])">{{ trips[0].code }}</button></div>',
        },
      },
    },
  })
}

describe('TripsManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    tripService.getAll.mockResolvedValue({ data: { data: [] } })
  })

  it('renders the trips management shell and fallback data', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('Trips Management')
    expect(wrapper.text()).toContain('Calendar')
    expect(wrapper.text()).toContain('List View')
    expect(wrapper.text()).toContain('New Trip')
    expect(wrapper.text()).toContain('Upcoming Highlights')
    expect(wrapper.text()).toContain('#TR-2045')
    expect(wrapper.find('[data-testid="trips-calendar"]').exists()).toBe(true)
  })

  it('calls tripService.getAll on mount', async () => {
    mountPage()
    await flushPromises()

    expect(tripService.getAll).toHaveBeenCalledTimes(1)
  })

  it('renders API trips when available', async () => {
    tripService.getAll.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'api-trip',
            code: 'TR-9999',
            origin: 'Miami',
            destination: 'Orlando',
            driverName: 'API Driver',
            busCode: 'API-501',
            capacity: 40,
            booked: 20,
            status: 'scheduled',
          },
        ],
      },
    })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.text()).toContain('#TR-9999')
    expect(wrapper.text()).toContain('MIA ➔ ORL')
    expect(wrapper.text()).toContain('API Driver')
  })

  it('filters trips by status', async () => {
    const wrapper = mountPage()
    await flushPromises()

    const statusSelect = wrapper.findAll('select')[0]
    await statusSelect.setValue('scheduled')

    expect(wrapper.text()).toContain('#TR-3112')
    expect(wrapper.text()).not.toContain('#TR-2045')
  })

  it('switches to list view without rendering the calendar grid', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'List View')
      .trigger('click')

    expect(wrapper.find('[data-testid="trips-calendar"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Trip ID')
  })

  it('opens trip details when a calendar event is selected', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.get('[data-testid="calendar-trip"]').trigger('click')

    const modal = wrapper.get('[data-testid="trip-details-modal"]')
    expect(modal.text()).toContain('#TR-2045')
    expect(modal.text()).toContain('New York')
  })

  it('opens the create trip modal from the New Trip button', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'New Trip')
      .trigger('click')

    expect(wrapper.find('[data-testid="create-trip-modal"]').exists()).toBe(true)
  })

  it('refreshes trips after the create trip modal emits created', async () => {
    const wrapper = mountPage()
    await flushPromises()
    tripService.getAll.mockClear()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'New Trip')
      .trigger('click')
    await wrapper.get('[data-testid="create-trip-modal"] button').trigger('click')
    await flushPromises()

    expect(tripService.getAll).toHaveBeenCalledTimes(1)
  })
})
