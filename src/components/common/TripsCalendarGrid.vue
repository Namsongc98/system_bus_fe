<script setup>
import { computed } from 'vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/vue3'

const props = defineProps({
  trips: { type: Array, default: () => [] },
})

// range-change: { from, to } Dates of the visible range, so the page loads its trips (spec 1.3 D7).
const emit = defineEmits(['trip-click', 'range-change'])

const statusClasses = {
  scheduled: 'trip-event--scheduled',
  ongoing: 'trip-event--ongoing',
  completed: 'trip-event--completed',
  cancelled: 'trip-event--cancelled',
}

function isValidDateTime(value) {
  return Boolean(value) && Number.isFinite(new Date(value).getTime())
}

function buildCalendarEvent(trip) {
  if (!isValidDateTime(trip.departureTime)) return null

  const event = {
    id: String(trip.id),
    title: trip.shortId || trip.code || String(trip.id),
    start: trip.departureTime,
    classNames: [statusClasses[trip.status] || statusClasses.scheduled],
    extendedProps: {
      status: trip.status,
      trip,
    },
  }

  if (
    isValidDateTime(trip.arrivalTime) &&
    new Date(trip.arrivalTime).getTime() > new Date(trip.departureTime).getTime()
  ) {
    event.end = trip.arrivalTime
  }

  return event
}

const calendarEvents = computed(() => props.trips.map(buildCalendarEvent).filter(Boolean))

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  firstDay: 1,
  headerToolbar: {
    left: 'title',
    center: '',
    right: 'prev,next today',
  },
  buttonText: {
    today: 'Today',
  },
  events: calendarEvents.value,
  displayEventTime: false,
  // Events open the details modal on click only; make them focusable / Enter-activatable too.
  eventInteractive: true,
  dayMaxEvents: 3,
  fixedWeekCount: false,
  eventClick: ({ event }) => emit('trip-click', event.extendedProps.trip),
  datesSet: ({ start, end }) => emit('range-change', { from: start, to: end }),
}))
</script>

<template>
  <section
    class="trips-calendar rounded-lg bg-white p-4 shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-300/10 sm:p-6"
  >
    <div class="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2">
      <div
        v-for="item in [
          { label: 'Scheduled', className: 'bg-sky-500' },
          { label: 'Ongoing', className: 'bg-emerald-500' },
          { label: 'Completed', className: 'bg-zinc-400' },
          { label: 'Cancelled', className: 'bg-rose-500' },
        ]"
        :key="item.label"
        class="flex items-center gap-2"
      >
        <span class="size-2.5 rounded-full" :class="item.className"></span>
        <span class="text-xs font-medium text-zinc-700">{{ item.label }}</span>
      </div>
    </div>

    <FullCalendar :options="calendarOptions">
      <template #eventContent="{ event }">
        <span class="block truncate px-1.5 py-0.5 text-[11px] font-bold">
          {{ event.title }}
          <span class="sr-only">— {{ event.extendedProps.trip?.statusLabel }}</span>
        </span>
      </template>
    </FullCalendar>
  </section>
</template>

<style scoped>
.trips-calendar :deep(.fc) {
  --fc-border-color: rgb(226 232 240);
  --fc-button-bg-color: rgb(255 255 255);
  --fc-button-border-color: rgb(203 213 225);
  --fc-button-text-color: rgb(39 39 42);
  --fc-button-hover-bg-color: rgb(248 250 252);
  --fc-button-hover-border-color: rgb(148 163 184);
  --fc-button-active-bg-color: rgb(241 245 249);
  --fc-button-active-border-color: rgb(148 163 184);
  --fc-today-bg-color: rgb(14 165 233 / 0.06);
  color: rgb(39 39 42);
  font-family: inherit;
}

.trips-calendar :deep(.fc .fc-toolbar) {
  align-items: center;
  gap: 0.75rem;
}

.trips-calendar :deep(.fc .fc-toolbar-title) {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.75rem;
}

.trips-calendar :deep(.fc .fc-button) {
  border-radius: 0.375rem;
  box-shadow: none;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.trips-calendar :deep(.fc .fc-col-header-cell-cushion) {
  padding: 0.75rem 0.25rem;
  color: rgb(63 63 70);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.trips-calendar :deep(.fc .fc-daygrid-day-frame) {
  min-height: 7.5rem;
}

.trips-calendar :deep(.fc .fc-daygrid-day-number) {
  padding: 0.5rem;
  color: rgb(39 39 42);
  font-size: 0.875rem;
  font-weight: 500;
}

.trips-calendar :deep(.fc .fc-day-today .fc-daygrid-day-number) {
  color: rgb(3 105 161);
  font-weight: 700;
}

.trips-calendar :deep(.fc .fc-daygrid-event) {
  border-width: 0 0 0 4px;
  border-radius: 0.25rem;
  cursor: pointer;
  margin: 0 0.25rem 0.25rem;
}

.trips-calendar :deep(.fc .trip-event--scheduled) {
  border-left-color: rgb(14 165 233);
  background: rgb(14 165 233 / 0.1);
  color: rgb(12 74 110);
}

.trips-calendar :deep(.fc .trip-event--ongoing) {
  border-left-color: rgb(16 185 129);
  background: rgb(16 185 129 / 0.1);
  color: rgb(19 78 74);
}

.trips-calendar :deep(.fc .trip-event--completed) {
  border-left-color: rgb(161 161 170);
  background: rgb(212 212 216 / 0.3);
  color: rgb(82 82 91);
}

.trips-calendar :deep(.fc .trip-event--cancelled) {
  border-left-color: rgb(244 63 94);
  background: rgb(244 63 94 / 0.1);
  color: rgb(159 18 57);
}

.trips-calendar :deep(.fc .fc-more-link) {
  color: rgb(3 105 161);
  font-size: 0.75rem;
  font-weight: 600;
}

@media (max-width: 639px) {
  .trips-calendar {
    overflow-x: auto;
  }

  .trips-calendar :deep(.fc) {
    min-width: 44rem;
  }

  .trips-calendar :deep(.fc .fc-toolbar) {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
