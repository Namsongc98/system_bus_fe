import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ModalCreateTrip from '@/components/common/Modal/ModalCreateTrip.vue'
import { busService, routeService } from '@/services/busRouteService'
import { tripService } from '@/services/tripService'
import { userService } from '@/services/userService'

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('@/services/busRouteService', () => ({
  routeService: {
    getAll: vi.fn(),
  },
  busService: {
    getAll: vi.fn(),
  },
}))

vi.mock('@/services/tripService', () => ({
  tripService: {
    create: vi.fn(),
  },
}))

vi.mock('@/services/userService', () => ({
  userService: {
    getAll: vi.fn(),
  },
}))

vi.mock('@/composables/useToast', () => ({
  useToast: () => toast,
}))

function mountModal(props = {}) {
  return mount(ModalCreateTrip, {
    props: {
      modelValue: true,
      ...props,
    },
    global: {
      plugins: [createPinia()],
      stubs: {
        BaseModal: {
          props: ['modelValue', 'size'],
          emits: ['update:modelValue', 'close'],
          template: '<div v-if="modelValue"><slot /></div>',
        },
        BaseButton: {
          props: {
            disabled: { type: Boolean, default: false },
            loading: { type: Boolean, default: false },
            htmlType: { type: String, default: 'button' },
            type: { type: String, default: 'button' },
          },
          emits: ['click'],
          template:
            '<button :type="htmlType || type || `button`" :disabled="disabled || loading" @click="$emit(`click`)"><slot /><slot name="icon-right" /></button>',
        },
        BaseInput: {
          props: ['modelValue', 'type', 'label', 'error', 'disabled'],
          emits: ['update:modelValue'],
          template:
            '<label><span>{{ label }}</span><input :type="type" :value="modelValue" :disabled="disabled" @input="$emit(`update:modelValue`, $event.target.value)" /><span v-if="error">{{ error }}</span></label>',
        },
        USelect: {
          props: ['modelValue', 'items', 'disabled'],
          emits: ['update:model-value'],
          template:
            '<select :value="modelValue" :disabled="disabled" @change="$emit(`update:model-value`, $event.target.value)"><option value="">Choose</option><option v-for="item in items" :key="item.value" :value="item.value">{{ item.label }}</option></select>',
        },
        UIcon: {
          template: '<span data-testid="icon"></span>',
        },
      },
    },
  })
}

function getButton(wrapper, text) {
  return wrapper.findAll('button').find((button) => button.text() === text)
}

async function advanceToResources(wrapper) {
  await wrapper.findAll('select')[0].setValue('1')
  await getButton(wrapper, 'Next').trigger('click')
  await flushPromises()
}

async function advanceToSchedule(wrapper) {
  await advanceToResources(wrapper)
  const selects = wrapper.findAll('select')
  await selects[0].setValue('2')
  await selects[1].setValue('3')
  await getButton(wrapper, 'Next').trigger('click')
  await flushPromises()
}

async function advanceToReview(wrapper) {
  await advanceToSchedule(wrapper)
  const inputs = wrapper.findAll('input')
  await inputs[0].setValue('2026-04-10T08:00')
  await inputs[1].setValue('2026-04-10T10:30')
  await getButton(wrapper, 'Next').trigger('click')
  await flushPromises()
}

describe('ModalCreateTrip', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    routeService.getAll.mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            routeName: 'Ha Noi - Hai Phong',
            startPoint: 'Ha Noi',
            endPoint: 'Hai Phong',
            distanceKm: 120,
          },
        ],
      },
    })
    busService.getAll.mockResolvedValue({
      data: {
        data: [
          {
            id: 2,
            busNumber: 'BUS-001',
            licensePlate: '29A-12345',
            capacity: 40,
            status: 'AVAILABLE',
          },
          { id: 99, busNumber: 'BUS-099', status: 'MAINTENANCE' },
        ],
      },
    })
    userService.getAll.mockResolvedValue({
      data: {
        data: {
          content: [{ id: 3, email: 'driver@example.com', role: 'DRIVER' }],
        },
      },
    })
    tripService.create.mockResolvedValue({
      data: {
        data: { id: 10 },
      },
    })
  })

  it('renders wizard progress steps and starts on Route', async () => {
    const wrapper = mountModal()
    await flushPromises()

    expect(wrapper.text()).toContain('Schedule New Trip')
    expect(wrapper.text()).toContain('Route')
    expect(wrapper.text()).toContain('Resources')
    expect(wrapper.text()).toContain('Schedule')
    expect(wrapper.text()).toContain('Review')
    expect(wrapper.text()).toContain('Select the corridor')
    expect(wrapper.text()).toContain('Next')
  })

  it('loads route, bus, and driver options when opened', async () => {
    const wrapper = mountModal()
    await flushPromises()

    expect(routeService.getAll).toHaveBeenCalledWith({ status: 'ACTIVE' })
    expect(busService.getAll).toHaveBeenCalled()
    expect(userService.getAll).toHaveBeenCalledWith({ role: 'DRIVER' })
    expect(wrapper.text()).toContain('Ha Noi - Hai Phong')
  })

  it('blocks Next on the route step when route is missing', async () => {
    const wrapper = mountModal()
    await flushPromises()

    await getButton(wrapper, 'Next').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Select a route')
    expect(wrapper.text()).toContain('Select the corridor')
  })

  it('advances through resources and blocks missing bus and driver', async () => {
    const wrapper = mountModal()
    await flushPromises()

    await advanceToResources(wrapper)

    expect(wrapper.text()).toContain('Assign the bus unit')
    expect(wrapper.text()).toContain('BUS-001 - 29A-12345')
    expect(wrapper.text()).not.toContain('BUS-099')
    expect(wrapper.text()).toContain('driver@example.com')

    await getButton(wrapper, 'Next').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Select a bus unit')
    expect(wrapper.text()).toContain('Select a driver')
  })

  it('advances to schedule and validates time order', async () => {
    const wrapper = mountModal()
    await flushPromises()

    await advanceToSchedule(wrapper)

    expect(wrapper.text()).toContain('Set the departure')

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('2026-04-10T10:30')
    await inputs[1].setValue('2026-04-10T08:00')
    await getButton(wrapper, 'Next').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Arrival must be after departure')
    expect(wrapper.text()).toContain('Set the departure')
  })

  it('supports Back navigation from later steps', async () => {
    const wrapper = mountModal()
    await flushPromises()

    await advanceToSchedule(wrapper)

    await getButton(wrapper, 'Back to Resources').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Assign the bus unit')
  })

  it('renders final review after valid route, resources, and schedule steps', async () => {
    const wrapper = mountModal()
    await flushPromises()

    await advanceToReview(wrapper)

    expect(wrapper.text()).toContain('Final Review')
    expect(wrapper.text()).toContain('Scheduled')
    expect(wrapper.text()).toContain('Ha Noi')
    expect(wrapper.text()).toContain('Hai Phong')
    expect(wrapper.text()).toContain('BUS-001 - 29A-12345')
    expect(wrapper.text()).toContain('driver@example.com')
    expect(wrapper.text()).toContain('2h 30m duration')
  })

  it('submits the normalized payload from the review step and closes on success', async () => {
    const wrapper = mountModal()
    await flushPromises()

    await advanceToReview(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(tripService.create).toHaveBeenCalledWith({
      routeId: 1,
      busId: 2,
      driverId: 3,
      departureTime: '2026-04-10T08:00',
      arrivalTime: '2026-04-10T10:30',
      status: 'SCHEDULED',
    })
    expect(toast.success).toHaveBeenCalledWith('Trip created successfully')
    expect(wrapper.emitted('created')?.[0]?.[0]).toEqual({ id: 10 })
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })

  it('shows option loading errors inside the modal', async () => {
    routeService.getAll.mockRejectedValueOnce(new Error('Routes unavailable'))

    const wrapper = mountModal()
    await flushPromises()

    expect(wrapper.text()).toContain('Some trip setup data is unavailable')
  })

  it('keeps the modal open on review when create fails', async () => {
    tripService.create.mockRejectedValueOnce(new Error('Create failed'))
    const wrapper = mountModal()
    await flushPromises()

    await advanceToReview(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('Create failed')
    expect(wrapper.text()).toContain('Final Review')
    expect(wrapper.emitted('created')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
