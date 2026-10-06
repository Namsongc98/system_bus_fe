<script setup>
// TripsManagement — /admin/trips
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import ModalCreateTrip from '@/components/common/Modal/ModalCreateTrip.vue'
import ModalDeleteConfirm from '@/components/common/Modal/ModalDeleteConfirm.vue'
import ModalTripDetails from '@/components/common/Modal/ModalTripDetails.vue'
import TripHighlightCard from '@/components/common/TripHighlightCard.vue'
import TripsCalendarGrid from '@/components/common/TripsCalendarGrid.vue'
import TripsListTable from '@/components/common/TripsListTable.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseEmptyState from '@/components/elements/BaseEmptyState.vue'
import BasePagination from '@/components/elements/BasePagination.vue'
import BaseSortFilter from '@/components/elements/BaseSortFilter.vue'
import BaseTabs from '@/components/elements/BaseTabs.vue'
import {
  TRIPS_MANAGEMENT_ALL_ROUTES_OPTION,
  TRIPS_MANAGEMENT_STATUS_OPTIONS,
  TRIPS_MANAGEMENT_VIEW_TABS,
} from '@/constants/admin/tripsManagement'
import { TRIP_CALENDAR_LIMIT, useTripStore } from '@/stores/trip'
import { toTripView } from '@/utils/tripView'

const tripStore = useTripStore()
const {
  trips,
  page,
  loading,
  error,
  calendarTrips,
  calendarTotal,
  calendarLoading,
  calendarError,
  highlights,
  routeOptions,
} = storeToRefs(tripStore)

const selectedView = ref('calendar')
const statusFilter = ref('all')
const routeFilter = ref('all')

const isTripFormOpen = ref(false)
const editingTrip = ref(null)
const isTripDetailsOpen = ref(false)
const selectedTrip = ref(null)
const isDeleteOpen = ref(false)
const deletingTrip = ref(null)

const routeFilterOptions = computed(() => [
  TRIPS_MANAGEMENT_ALL_ROUTES_OPTION,
  ...routeOptions.value,
])
const listRows = computed(() => trips.value.map(toTripView))
const calendarRows = computed(() => calendarTrips.value.map(toTripView))
const highlightRows = computed(() => highlights.value.map(toTripView))
const calendarCapped = computed(() => calendarTotal.value > TRIP_CALENDAR_LIMIT)

// The loading / error block replaces the list only when there is nothing to show yet (1.1 L3).
const showListLoading = computed(() => loading.value && !listRows.value.length)
const showListEmpty = computed(() => !loading.value && !error.value && !listRows.value.length)

function currentFilters() {
  return {
    status: statusFilter.value === 'all' ? null : statusFilter.value,
    routeId: routeFilter.value === 'all' ? null : routeFilter.value,
  }
}

// Filters are applied on the server to the list and to the calendar range.
function reloadForFilters() {
  tripStore.applyFilters(currentFilters())
  return Promise.all([tripStore.fetchAll({ page: 0 }), tripStore.fetchCalendar()])
}

function onStatusFilter(value) {
  statusFilter.value = value
  reloadForFilters()
}

function onRouteFilter(value) {
  routeFilter.value = value
  reloadForFilters()
}

function onCalendarRange(range) {
  tripStore.fetchCalendar(range)
}

function loadList(pageNumber) {
  return tripStore.fetchAll({ page: pageNumber })
}

function showAllScheduled() {
  selectedView.value = 'list'
  onStatusFilter('SCHEDULED')
}

function openCreateTrip() {
  editingTrip.value = null
  isTripFormOpen.value = true
}

function openEditTrip(rawTrip) {
  editingTrip.value = rawTrip
  isTripFormOpen.value = true
}

function openTripDetails(trip) {
  selectedTrip.value = trip
  isTripDetailsOpen.value = true
}

function openDeleteTrip(trip) {
  deletingTrip.value = trip
  isDeleteOpen.value = true
}

onMounted(() => {
  tripStore.applyFilters(currentFilters())
  // The calendar loads its own range when it renders (range-change).
  return Promise.all([
    tripStore.fetchRouteOptions(),
    tripStore.fetchAll({ page: 0 }),
    tripStore.fetchHighlights(),
  ])
})
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
          aria-label="Trips view mode"
          @update:model-value="selectedView = $event"
        />
        <BaseButton size="md" html-type="button" @click="openCreateTrip">
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
        :model-value="statusFilter"
        :options="TRIPS_MANAGEMENT_STATUS_OPTIONS"
        label="Status"
        @update:model-value="onStatusFilter"
      />
      <BaseSortFilter
        :model-value="routeFilter"
        :options="routeFilterOptions"
        label="Route"
        @update:model-value="onRouteFilter"
      />
    </section>

    <template v-if="selectedView === 'calendar'">
      <div
        v-if="calendarError"
        role="alert"
        class="flex flex-col gap-3"
        data-testid="calendar-error"
      >
        <BaseEmptyState :title="calendarError" tone="danger" class="text-left" />
        <BaseButton
          label="Retry"
          type="outline"
          size="sm"
          class="self-center"
          @click="tripStore.fetchCalendar()"
        />
      </div>
      <BaseEmptyState
        v-if="calendarCapped"
        :title="`Showing the first ${TRIP_CALENDAR_LIMIT} of ${calendarTotal} trips in this range. Narrow the filters or use List View.`"
        tone="warning"
        class="text-left"
        data-testid="calendar-capped"
      />
      <TripsCalendarGrid
        :trips="calendarRows"
        :aria-busy="calendarLoading"
        @trip-click="openTripDetails"
        @range-change="onCalendarRange"
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
            @click="showAllScheduled"
          >
            View All
          </BaseButton>
        </header>

        <div v-if="highlightRows.length" class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <TripHighlightCard v-for="trip in highlightRows" :key="trip.id" :trip="trip" />
        </div>
        <p v-else class="mt-6 text-sm text-gray-600" data-testid="highlights-empty">
          No upcoming scheduled trips.
        </p>
      </section>
    </template>

    <template v-else>
      <div
        v-if="showListLoading"
        role="status"
        class="rounded-2xl bg-white/70 p-5 text-sm font-semibold text-sky-700 shadow-sm"
        data-testid="trips-loading"
      >
        Loading trips...
      </div>

      <div v-if="error" role="alert" class="flex flex-col gap-3" data-testid="trips-error">
        <BaseEmptyState :title="error" tone="danger" class="text-left" />
        <BaseButton
          label="Retry"
          type="outline"
          size="sm"
          class="self-center"
          @click="loadList(tripStore.requestedPage)"
        />
      </div>

      <BaseEmptyState
        v-if="showListEmpty"
        title="No trips match these filters"
        description="Create a trip with New Trip, or change the status / route filter."
        data-testid="trips-empty"
      />

      <TripsListTable
        v-if="listRows.length"
        :trips="listRows"
        :total="page.totalElements"
        :aria-busy="loading"
        @open="openTripDetails"
      >
        <template #pagination>
          <BasePagination
            v-if="page.totalPages > 1"
            :page="page.page"
            :total-pages="page.totalPages"
            :has-prev-page="page.page > 0"
            :has-next-page="page.page + 1 < page.totalPages"
            :loading="loading"
            @prev="loadList(page.page - 1)"
            @next="loadList(page.page + 1)"
          />
        </template>
      </TripsListTable>
    </template>

    <ModalCreateTrip v-model="isTripFormOpen" :trip="editingTrip" />
    <ModalTripDetails
      v-model="isTripDetailsOpen"
      :trip="selectedTrip"
      @edit="openEditTrip"
      @delete="openDeleteTrip"
    />
    <ModalDeleteConfirm
      v-model="isDeleteOpen"
      entity-type="trip"
      :entity-name="deletingTrip?.code ?? ''"
      :on-confirm="() => tripStore.remove(deletingTrip.id)"
    />
  </div>
</template>
