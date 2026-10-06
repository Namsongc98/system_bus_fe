import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import ModalTripDetails from '@/components/common/Modal/ModalTripDetails.vue'
import { toTripView } from '@/utils/tripView'

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))

const store = vi.hoisted(() => ({
  busyTripId: null,
  fetchById: vi.fn(),
  changeStatus: vi.fn(),
}))

vi.mock('@/stores/trip', () => ({ useTripStore: () => store }))
vi.mock('@/composables/useToast', () => ({ useToast: () => toast }))

function tripResponse(overrides = {}) {
  return {
    id: 5,
    status: 'SCHEDULED',
    departureTime: '2030-01-10T08:00:00',
    arrivalTime: '2030-01-10T11:00:00',
    route: { id: 1, routeName: 'HN - HP', startPoint: 'Hà Nội', endPoint: 'Hải Phòng' },
    bus: { id: 2, plateNumber: '29A-20001', capacity: 40 },
    driver: { id: 3, email: 'd@test.vn', fullName: null },
    bookedSeats: 0,
    revenue: 0,
    // Every booked seat is a ticket; cancelled tickets only add to ticketCount.
    ticketCount: overrides.bookedSeats ?? 0,
    ...overrides,
  }
}

function mountModal(trip) {
  return mount(ModalTripDetails, {
    props: { modelValue: true, trip: toTripView(trip) },
    global: {
      stubs: {
        BaseModal: { props: ['modelValue'], template: '<div v-if="modelValue"><slot /></div>' },
        BaseButton: {
          props: { disabled: Boolean, loading: Boolean },
          emits: ['click'],
          template:
            '<button :disabled="disabled || loading" @click="$emit(`click`)"><slot /></button>',
        },
        UIcon: { template: '<span></span>' },
      },
    },
  })
}

function button(wrapper, text) {
  return wrapper.findAll('button').find((b) => b.text() === text)
}

describe('ModalTripDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.busyTripId = null
  })

  it('reloads the trip on open and shows fresh seats, revenue and driver', async () => {
    store.fetchById.mockResolvedValue(tripResponse({ bookedSeats: 12, revenue: 1800000 }))
    const wrapper = mountModal(tripResponse())
    await flushPromises()

    expect(store.fetchById).toHaveBeenCalledWith(5)
    expect(wrapper.text()).toContain('#TR-5')
    expect(wrapper.text()).toContain('12 / 40 seats (30%)')
    expect(wrapper.text()).toMatch(/1\.800\.000/)
    // No profile: the email stands in for the name.
    expect(wrapper.text()).toContain('d@test.vn')
  })

  it('scheduled trip offers start, cancel, edit, and delete when no ticket is sold', async () => {
    store.fetchById.mockResolvedValue(tripResponse())
    const wrapper = mountModal(tripResponse())
    await flushPromises()

    expect(button(wrapper, 'Start trip')).toBeTruthy()
    expect(button(wrapper, 'Cancel trip')).toBeTruthy()
    expect(button(wrapper, 'Edit')).toBeTruthy()
    expect(button(wrapper, 'Delete')).toBeTruthy()
  })

  it('hides delete once tickets are sold', async () => {
    store.fetchById.mockResolvedValue(tripResponse({ ticketCount: 3, bookedSeats: 3 }))
    const wrapper = mountModal(tripResponse())
    await flushPromises()

    expect(button(wrapper, 'Delete')).toBeUndefined()
  })

  it('hides delete when the ticket count is unknown (B37 d)', async () => {
    const { ticketCount, ...withoutCount } = tripResponse()
    store.fetchById.mockResolvedValue(withoutCount)
    const wrapper = mountModal(withoutCount)
    await flushPromises()

    expect(ticketCount).toBe(0)
    expect(button(wrapper, 'Delete')).toBeUndefined()
  })

  it('hides delete when the only tickets were cancelled (BE would answer 409)', async () => {
    store.fetchById.mockResolvedValue(tripResponse({ ticketCount: 2, bookedSeats: 0 }))
    const wrapper = mountModal(tripResponse())
    await flushPromises()

    expect(button(wrapper, 'Delete')).toBeUndefined()
  })

  it('ongoing trip offers only complete; finished trips are read-only', async () => {
    store.fetchById.mockResolvedValue(tripResponse({ status: 'ONGOING' }))
    const ongoing = mountModal(tripResponse({ status: 'ONGOING' }))
    await flushPromises()
    expect(button(ongoing, 'Complete trip')).toBeTruthy()
    expect(button(ongoing, 'Edit')).toBeUndefined()
    expect(button(ongoing, 'Start trip')).toBeUndefined()

    store.fetchById.mockResolvedValue(tripResponse({ status: 'COMPLETED', bookedSeats: 5 }))
    const done = mountModal(tripResponse({ status: 'COMPLETED' }))
    await flushPromises()
    expect(done.findAll('button').map((b) => b.text())).toEqual(['Close'])
  })

  it('starting a trip changes its status and shows the new one', async () => {
    store.fetchById.mockResolvedValue(tripResponse())
    store.changeStatus.mockResolvedValue(tripResponse({ status: 'ONGOING' }))
    const wrapper = mountModal(tripResponse())
    await flushPromises()

    await button(wrapper, 'Start trip').trigger('click')
    await flushPromises()

    expect(store.changeStatus).toHaveBeenCalledWith(5, 'ONGOING')
    expect(wrapper.text()).toContain('Ongoing')
    expect(toast.success).toHaveBeenCalled()
  })

  it('cancelling asks for a second click and warns about the booked tickets', async () => {
    store.fetchById.mockResolvedValue(tripResponse({ bookedSeats: 4 }))
    store.changeStatus.mockResolvedValue(tripResponse({ status: 'CANCELLED', bookedSeats: 0 }))
    const wrapper = mountModal(tripResponse())
    await flushPromises()

    await button(wrapper, 'Cancel trip').trigger('click')
    expect(store.changeStatus).not.toHaveBeenCalled()
    expect(wrapper.get('[data-testid="cancel-confirm"]').text()).toContain('4 booked ticket(s)')

    await button(wrapper, 'Cancel trip').trigger('click')
    await flushPromises()
    expect(store.changeStatus).toHaveBeenCalledWith(5, 'CANCELLED')
  })

  it('toasts a 409 from the server', async () => {
    store.fetchById.mockResolvedValue(tripResponse())
    store.changeStatus.mockRejectedValue(
      Object.assign(new Error('Không thể chuyển chuyến từ SCHEDULED sang COMPLETED'), {
        status: 409,
      })
    )
    const wrapper = mountModal(tripResponse())
    await flushPromises()

    await button(wrapper, 'Start trip').trigger('click')
    await flushPromises()

    expect(toast.error).toHaveBeenCalledWith('Không thể chuyển chuyến từ SCHEDULED sang COMPLETED')
  })

  it('hands edit and delete back to the page and closes', async () => {
    store.fetchById.mockResolvedValue(tripResponse())
    const wrapper = mountModal(tripResponse())
    await flushPromises()

    await button(wrapper, 'Edit').trigger('click')
    expect(wrapper.emitted('edit')[0][0].id).toBe(5)
    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])

    await button(wrapper, 'Delete').trigger('click')
    expect(wrapper.emitted('delete')[0][0].code).toBe('#TR-5')
  })

  it('drops a slow response for a trip that is no longer open', async () => {
    let resolveFirst
    store.fetchById
      .mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)))
      .mockResolvedValueOnce(tripResponse({ id: 6, bookedSeats: 7 }))
    const wrapper = mountModal(tripResponse())
    await wrapper.setProps({ trip: toTripView(tripResponse({ id: 6 })) })
    await flushPromises()

    resolveFirst(tripResponse({ id: 5, bookedSeats: 30 }))
    await flushPromises()

    expect(wrapper.text()).toContain('#TR-6')
    expect(wrapper.text()).toContain('7 / 40 seats')
  })

  it('shows a load error and keeps the list data visible', async () => {
    store.fetchById.mockRejectedValue(new Error('Trip not found'))
    const wrapper = mountModal(tripResponse())
    await flushPromises()

    expect(wrapper.text()).toContain('Trip not found')
    expect(wrapper.text()).toContain('#TR-5')
    expect(button(wrapper, 'Delete')).toBeUndefined()
  })
})
