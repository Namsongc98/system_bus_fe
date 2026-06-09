import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TripsCalendarGrid from '@/components/common/TripsCalendarGrid.vue'

vi.mock('@fullcalendar/vue3', () => ({
  default: {
    name: 'FullCalendar',
    props: ['options'],
    template: '<div data-testid="full-calendar"></div>',
  },
}))

vi.mock('@fullcalendar/daygrid', () => ({
  default: { name: 'dayGridPlugin' },
}))

const trips = [
  {
    id: 'scheduled-trip',
    code: '#TR-1001',
    shortId: 'TR-100…',
    status: 'scheduled',
    departureTime: '2026-06-10T08:00:00',
    arrivalTime: '2026-06-10T10:30:00',
  },
  {
    id: 'invalid-trip',
    code: '#TR-1002',
    shortId: 'TR-100…',
    status: 'completed',
    departureTime: '',
    arrivalTime: '',
  },
]

describe('TripsCalendarGrid', () => {
  it('maps valid trips to FullCalendar events and skips trips without a departure date', () => {
    const wrapper = mount(TripsCalendarGrid, {
      props: { trips },
    })

    const options = wrapper.getComponent({ name: 'FullCalendar' }).props('options')

    expect(options.initialView).toBe('dayGridMonth')
    expect(options.firstDay).toBe(1)
    expect(options.dayMaxEvents).toBe(3)
    expect(options.events).toHaveLength(1)
    expect(options.events[0]).toMatchObject({
      id: 'scheduled-trip',
      title: 'TR-100…',
      start: '2026-06-10T08:00:00',
      end: '2026-06-10T10:30:00',
      classNames: ['trip-event--scheduled'],
      extendedProps: {
        status: 'scheduled',
        trip: trips[0],
      },
    })
  })

  it('emits the original trip when FullCalendar reports an event click', () => {
    const wrapper = mount(TripsCalendarGrid, {
      props: { trips },
    })
    const options = wrapper.getComponent({ name: 'FullCalendar' }).props('options')

    options.eventClick({
      event: {
        extendedProps: {
          trip: trips[0],
        },
      },
    })

    expect(wrapper.emitted('trip-click')).toEqual([[trips[0]]])
  })

  it('omits an invalid arrival time while retaining a valid departure', () => {
    const wrapper = mount(TripsCalendarGrid, {
      props: {
        trips: [
          {
            ...trips[0],
            arrivalTime: '2026-06-10T07:00:00',
          },
        ],
      },
    })

    const [event] = wrapper.getComponent({ name: 'FullCalendar' }).props('options').events

    expect(event.start).toBe('2026-06-10T08:00:00')
    expect(event).not.toHaveProperty('end')
  })
})
