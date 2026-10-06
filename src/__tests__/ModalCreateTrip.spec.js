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
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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
          // D1 = A (spec 1.3): a bus with another trip can still take a non-overlapping one.
          { id: 98, busNumber: 'BUS-098', status: 'IN_USE' },
        ],
      },
    })
    userService.getAll.mockResolvedValue({
      data: {
        data: {
          content: [
            { id: 3, email: 'driver@example.com', role: 'DRIVER', active: true },
            { id: 4, email: 'locked.driver@example.com', role: 'DRIVER', active: false },
          ],
        },
      },
    })
    tripService.create.mockResolvedValue({
      data: {
        data: { id: 10 },
      },
    })
    tripService.update.mockResolvedValue({ data: { data: { id: 5 } } })
    tripService.getAll.mockResolvedValue({ data: { data: { content: [], totalElements: 0 } } })
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

    // B31: the largest page the BE allows, not just the first default page.
    expect(routeService.getAll).toHaveBeenCalledWith({ status: 'ACTIVE', size: 100 })
    expect(busService.getAll).toHaveBeenCalledWith({ size: 100 })
    expect(userService.getAll).toHaveBeenCalledWith({ role: 'DRIVER', size: 100 })
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
    expect(wrapper.text()).toContain('BUS-098')
    expect(wrapper.text()).toContain('driver@example.com')
    // Locked drivers (task 1.2) are not offered.
    expect(wrapper.text()).not.toContain('locked.driver@example.com')

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
    })
    expect(toast.success).toHaveBeenCalledWith('Trip created successfully')
    expect(wrapper.emitted('saved')?.[0]?.[0]).toEqual({ id: 10 })
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })

  it('shows option loading errors inside the modal', async () => {
    routeService.getAll.mockRejectedValueOnce(new Error('Routes unavailable'))

    const wrapper = mountModal()
    await flushPromises()

    expect(wrapper.text()).toContain('Some trip setup data is unavailable')
  })

  it('keeps the modal open on review with the BE message when create fails', async () => {
    tripService.create.mockRejectedValueOnce({
      status: 409,
      message: 'Xe 29A-12345 đã có chuyến khác trong khung giờ này',
    })
    const wrapper = mountModal()
    await flushPromises()

    await advanceToReview(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('Xe 29A-12345 đã có chuyến khác trong khung giờ này')
    expect(wrapper.get('[data-testid="submit-error"]').text()).toContain('đã có chuyến khác')
    expect(wrapper.text()).toContain('Final Review')
    expect(wrapper.emitted('saved')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('Back to Schedule after a refusal keeps the entered data and clears the error', async () => {
    tripService.create.mockRejectedValueOnce({
      status: 400,
      message: 'Giờ khởi hành không được ở quá khứ',
    })
    const wrapper = mountModal()
    await flushPromises()
    await advanceToReview(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    await getButton(wrapper, 'Back to Schedule').trigger('click')
    await flushPromises()

    const inputs = wrapper.findAll('input')
    expect(inputs[0].element.value).toBe('2026-04-10T08:00')
    expect(inputs[1].element.value).toBe('2026-04-10T10:30')
    expect(wrapper.find('[data-testid="submit-error"]').exists()).toBe(false)
  })

  it('a BE field error survives Back to Schedule and shows next to its input', async () => {
    tripService.create.mockRejectedValueOnce({
      status: 400,
      message: 'Giờ khởi hành không được ở quá khứ',
      errors: { departureTime: 'Giờ khởi hành không được ở quá khứ' },
    })
    const wrapper = mountModal()
    await flushPromises()
    await advanceToReview(wrapper)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    await getButton(wrapper, 'Back to Schedule').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Set the departure')
    expect(wrapper.text()).toContain('Giờ khởi hành không được ở quá khứ')
  })

  it('cannot be closed or reset while saving', async () => {
    let resolve
    tripService.create.mockReturnValueOnce(new Promise((r) => (resolve = r)))
    const wrapper = mountModal()
    await flushPromises()
    await advanceToReview(wrapper)
    await wrapper.get('form').trigger('submit')

    await wrapper.get('[aria-label="Close create trip modal"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.text()).toContain('Final Review')
    resolve({ data: { data: { id: 10 } } })
    await flushPromises()
  })

  it('a load aborted by logout shows no error and is retried next time (B37 d)', async () => {
    routeService.getAll.mockRejectedValueOnce({ name: 'CanceledError', code: 'ERR_CANCELED' })
    const wrapper = mountModal()
    await flushPromises()

    expect(wrapper.text()).not.toContain('Some trip setup data is unavailable')

    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })
    await flushPromises()
    expect(routeService.getAll).toHaveBeenCalledTimes(2)
  })

  it('a complete load is cached across reopenings', async () => {
    const wrapper = mountModal()
    await flushPromises()
    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })
    await flushPromises()

    expect(routeService.getAll).toHaveBeenCalledTimes(1)
  })

  it('reloads the options next time when a load failed', async () => {
    routeService.getAll.mockRejectedValueOnce(new Error('Routes unavailable'))
    const wrapper = mountModal()
    await flushPromises()
    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })
    await flushPromises()

    expect(routeService.getAll).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).not.toContain('Some trip setup data is unavailable')
  })

  describe('edit mode', () => {
    const trip = {
      id: 5,
      status: 'SCHEDULED',
      departureTime: '2026-04-11T07:00:00',
      arrivalTime: '2026-04-11T09:15:00',
      route: { id: 1, routeName: 'Ha Noi - Hai Phong' },
      bus: { id: 2, plateNumber: '29A-12345', capacity: 40 },
      driver: { id: 3, email: 'driver@example.com' },
    }

    it('keeps the current bus visible as unavailable when it is no longer offered', async () => {
      const wrapper = mountModal({
        trip: { ...trip, bus: { id: 99, plateNumber: 'BUS-099', capacity: 40 } },
      })
      await flushPromises()
      await getButton(wrapper, 'Next').trigger('click')
      await flushPromises()

      expect(wrapper.text()).toContain('(unavailable)')
      expect(wrapper.findAll('select')[0].element.value).toBe('99')
    })

    it('prefills every step from the trip and sends PUT without status', async () => {
      const wrapper = mountModal({ trip })
      await flushPromises()

      expect(wrapper.text()).toContain('Edit Trip')
      for (let step = 0; step < 3; step += 1) {
        await getButton(wrapper, 'Next').trigger('click')
        await flushPromises()
      }
      expect(wrapper.text()).toContain('Final Review')
      expect(wrapper.text()).toContain('Save Changes')

      await wrapper.get('form').trigger('submit')
      await flushPromises()

      expect(tripService.update).toHaveBeenCalledWith(5, {
        routeId: 1,
        busId: 2,
        driverId: 3,
        departureTime: '2026-04-11T07:00',
        arrivalTime: '2026-04-11T09:15',
      })
      expect(tripService.create).not.toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Trip updated successfully')
    })
  })
})
