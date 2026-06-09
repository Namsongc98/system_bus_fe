<script setup>
// TripsManagement — /admin/trips
import { computed, onMounted, ref } from 'vue'
import ModalCreateTrip from '@/components/common/Modal/ModalCreateTrip.vue'
import ModalTripDetails from '@/components/common/Modal/ModalTripDetails.vue'
import TripHighlightCard from '@/components/common/TripHighlightCard.vue'
import TripsCalendarGrid from '@/components/common/TripsCalendarGrid.vue'
import TripsListTable from '@/components/common/TripsListTable.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseEmptyState from '@/components/elements/BaseEmptyState.vue'
import BaseSortFilter from '@/components/elements/BaseSortFilter.vue'
import BaseTabs from '@/components/elements/BaseTabs.vue'
import {
  TRIPS_MANAGEMENT_BUS_TYPE_OPTIONS,
  TRIPS_MANAGEMENT_FALLBACK_TRIPS,
  TRIPS_MANAGEMENT_ROUTE_OPTIONS,
  TRIPS_MANAGEMENT_STATUS_OPTIONS,
  TRIPS_MANAGEMENT_VIEW_TABS,
} from '@/constants/admin/tripsManagement'
import { tripService } from '@/services/tripService'

const selectedView = ref('calendar')
const statusFilter = ref('all')
const routeFilter = ref('all')
const busTypeFilter = ref('all')
const trips = ref(TRIPS_MANAGEMENT_FALLBACK_TRIPS)
const loading = ref(false)
const warning = ref('')
const isCreateTripOpen = ref(false)
const isTripDetailsOpen = ref(false)
const selectedTrip = ref(null)

const filteredTrips = computed(() =>
  trips.value.filter((trip) => {
    const statusMatch = statusFilter.value === 'all' || trip.status === statusFilter.value
    const routeMatch = routeFilter.value === 'all' || trip.routeShort === routeFilter.value
    const busMatch = busTypeFilter.value === 'all' || trip.busType === busTypeFilter.value
    return statusMatch && routeMatch && busMatch
  })
)

const highlightTrips = computed(() => filteredTrips.value.slice(0, 2))
function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function getPayload(response) {
  return response?.data?.data ?? response?.data ?? response
}

function getCollection(response) {
  const payload = getPayload(response)
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function normalizeStatus(value) {
  const status = String(value || '').toLowerCase()
  if (status.includes('ongoing') || status.includes('running')) return 'ongoing'
  if (status.includes('complete') || status.includes('done')) return 'completed'
  if (status.includes('cancel')) return 'cancelled'
  return 'scheduled'
}

function normalizeTrip(trip, index) {
  const code = firstDefined(trip.code, trip.tripCode, trip.id, `#TR-${index + 1}`)
  const from = firstDefined(trip.from, trip.origin, trip.departure, trip.route?.from, 'Origin')
  const to = firstDefined(trip.to, trip.destination, trip.arrival, trip.route?.to, 'Destination')
  const status = normalizeStatus(firstDefined(trip.status, trip.state))
  const capacity = Number(firstDefined(trip.capacity, trip.totalSeats, trip.seats, 50))
  const booked = Number(firstDefined(trip.booked, trip.bookedSeats, trip.occupiedSeats, 0))
  const loadFactor = capacity ? Math.round((booked / capacity) * 100) : 0
  const bus = firstDefined(trip.busName, trip.bus?.name, trip.bus?.plateNumber, trip.busCode, 'Bus')

  return {
    id: firstDefined(trip.id, code, index),
    code: String(code).startsWith('#') ? String(code) : `#${code}`,
    shortId: String(code).replace('#', '').slice(0, 6) + '…',
    route: `${from} ➔ ${to}`,
    routeShort: firstDefined(
      trip.routeShort,
      `${String(from).slice(0, 3).toUpperCase()} ➔ ${String(to).slice(0, 3).toUpperCase()}`
    ),
    timeRange: firstDefined(
      trip.timeRange,
      `${trip.departureTime || '08:00 AM'} - ${trip.arrivalTime || '12:30 PM'}`
    ),
    departureTime: firstDefined(trip.departureTime, trip.departureDateTime, trip.startTime),
    arrivalTime: firstDefined(trip.arrivalTime, trip.arrivalDateTime, trip.endTime),
    operator: firstDefined(
      trip.driverName,
      trip.operator,
      trip.driver?.name,
      'Unassigned operator'
    ),
    operatorShort: firstDefined(trip.operatorShort, trip.driverName, trip.operator, 'Operator'),
    bus: firstDefined(trip.busLabel, bus),
    busShort: String(bus),
    busType: firstDefined(trip.busType, trip.bus?.type, trip.type, 'Luxury'),
    booked,
    capacity,
    loadFactor: firstDefined(trip.loadFactor, loadFactor),
    status,
    statusLabel: status.charAt(0).toUpperCase() + status.slice(1),
  }
}

function openCreateTripModal() {
  isCreateTripOpen.value = true
}

function openTripDetails(trip) {
  selectedTrip.value = trip
  isTripDetailsOpen.value = true
}

async function fetchTrips() {
  loading.value = true
  warning.value = ''

  try {
    const response = await tripService.getAll()
    const records = getCollection(response)
    if (records.length) {
      trips.value = records.map(normalizeTrip)
    } else {
      trips.value = TRIPS_MANAGEMENT_FALLBACK_TRIPS
      warning.value = 'Trip API returned no records. Showing sample trip management data.'
    }
  } catch (err) {
    trips.value = TRIPS_MANAGEMENT_FALLBACK_TRIPS
    warning.value = err?.message || 'Unable to load trips. Showing sample trip management data.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchTrips)
</script>

<template>
  <div class="flex flex-col gap-8 px-4 pt-6 pb-12 md:px-8 md:pt-10">
    <header class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h1 class="text-3xl leading-9 font-bold text-zinc-900">Trips Management</h1>
        <p class="text-base leading-6 text-gray-700">
          Optimize and monitor your fleet's active voyages.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <BaseTabs
          :model-value="selectedView"
          :options="TRIPS_MANAGEMENT_VIEW_TABS"
          :disabled="loading"
          aria-label="Trips view mode"
          @update:model-value="selectedView = $event"
        />
        <BaseButton size="md" html-type="button" @click="openCreateTripModal">
          <template #icon-left>
            <span class="size-2.5 rounded-full bg-white"></span>
          </template>
          New Trip
        </BaseButton>
      </div>
    </header>

    <section
      class="flex flex-col gap-3 rounded-2xl bg-white/70 p-4 shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-300/10 backdrop-blur-md lg:flex-row lg:items-center"
    >
      <BaseSortFilter
        v-model="statusFilter"
        :options="TRIPS_MANAGEMENT_STATUS_OPTIONS"
        label="Status"
        :disabled="loading"
      />
      <BaseSortFilter
        v-model="routeFilter"
        :options="TRIPS_MANAGEMENT_ROUTE_OPTIONS"
        label="Route"
        :disabled="loading"
      />
      <BaseSortFilter
        v-model="busTypeFilter"
        :options="TRIPS_MANAGEMENT_BUS_TYPE_OPTIONS"
        label="Bus Type"
        :disabled="loading"
      />
    </section>

    <BaseEmptyState v-if="warning" :title="warning" tone="warning" class="text-left" />

    <section
      v-if="loading"
      class="rounded-2xl bg-white/70 p-5 text-sm font-semibold text-sky-700 shadow-sm"
    >
      Loading trips...
    </section>

    <TripsCalendarGrid
      v-if="selectedView === 'calendar'"
      :trips="filteredTrips"
      @trip-click="openTripDetails"
    />

    <section
      class="rounded-2xl bg-white/70 p-6 shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-300/10 backdrop-blur-md"
    >
      <header class="flex items-center justify-between">
        <h2 class="text-lg leading-7 font-bold text-zinc-900">Upcoming Highlights</h2>
        <BaseButton
          unstyled
          html-type="button"
          class="text-sm leading-5 font-semibold text-sky-700 hover:text-sky-900"
        >
          View All
        </BaseButton>
      </header>

      <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <TripHighlightCard v-for="trip in highlightTrips" :key="trip.id" :trip="trip" />
      </div>
    </section>

    <TripsListTable :trips="filteredTrips.slice(0, 2)" />

    <ModalCreateTrip v-model="isCreateTripOpen" @created="fetchTrips" />
    <ModalTripDetails v-model="isTripDetailsOpen" :trip="selectedTrip" />
  </div>
</template>
