<script setup>
// BusesRoutes — /admin/buses-routes
import { computed, onMounted, ref } from 'vue'
import ModalCreateBus from '@/components/common/Modal/ModalCreateBus.vue'
import ModalCreateRoute from '@/components/common/Modal/ModalCreateRoute.vue'
import ModalDeleteRoute from '@/components/common/Modal/ModalDeleteRoute.vue'
import FleetBusCard from '@/components/common/FleetBusCard.vue'
import RouteMiniMap from '@/components/common/RouteMiniMap.vue'
import RouteNetworkCard from '@/components/common/RouteNetworkCard.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseEmptyState from '@/components/elements/BaseEmptyState.vue'
import {
  BUSES_ROUTES_FALLBACK_BUSES,
  BUSES_ROUTES_FALLBACK_ROUTES,
} from '@/constants/admin/busesRoutes'
import { busService, routeService } from '@/services/busRouteService'

const buses = ref(BUSES_ROUTES_FALLBACK_BUSES)
const routes = ref(BUSES_ROUTES_FALLBACK_ROUTES)
const selectedRouteId = ref(BUSES_ROUTES_FALLBACK_ROUTES[0].id)
const loading = ref(false)
const error = ref('')
const isCreateBusOpen = ref(false)
const isCreateRouteOpen = ref(false)
const isDeleteRouteOpen = ref(false)
const routeToDelete = ref(null)

const activeBusCount = computed(() => buses.value.filter((bus) => bus.status === 'active').length)
const selectedRoute = computed(
  () =>
    routes.value.find((route) => String(route.id) === String(selectedRouteId.value)) ||
    routes.value[0]
)

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

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeStatus(value, active) {
  const status = String(value || '').toLowerCase()
  if (status.includes('maintenance') || status.includes('service')) return 'maintenance'
  if (status.includes('suspend') || status.includes('inactive') || active === false)
    return 'suspended'
  return 'active'
}

function getDrivers(bus) {
  const driverValues = firstDefined(bus.drivers, bus.driverNames, bus.assignedDrivers, [])
  if (Array.isArray(driverValues)) {
    return driverValues.map((driver) =>
      typeof driver === 'string'
        ? driver
        : firstDefined(driver.name, driver.fullName, driver.username, `Driver #${driver.id}`)
    )
  }

  const driver = firstDefined(bus.driverName, bus.driver?.name, bus.driver?.fullName)
  return driver ? [driver] : []
}

function getCoordinate(entity, keys, fallback) {
  const value = keys.map((key) => entity?.[key]).find((item) => item !== undefined && item !== null)
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeBus(bus, index) {
  return {
    id: firstDefined(bus.id, bus.busId, bus.plateNumber, index),
    plate: firstDefined(
      bus.plate,
      bus.plateNumber,
      bus.plate_number,
      bus.licensePlate,
      `Bus #${index + 1}`
    ),
    model: firstDefined(bus.model, bus.type, bus.name, 'Unknown model'),
    capacity: firstDefined(bus.capacity, bus.seats, bus.seatCount, 'N/A'),
    uptime: firstDefined(bus.uptime, bus.uptimePercent, bus.availability, 96),
    age: firstDefined(
      bus.age,
      bus.vehicleAge,
      bus.year ? `${new Date().getFullYear() - bus.year}y` : 'N/A'
    ),
    status: normalizeStatus(firstDefined(bus.status, bus.state), bus.active),
    drivers: getDrivers(bus),
    maintenanceNote: firstDefined(bus.maintenanceNote, bus.serviceNote, bus.note, ''),
  }
}

function normalizeRoute(route, index) {
  const origin = firstDefined(route.origin, route.from, route.startPoint, route.departure, 'Origin')
  const destination = firstDefined(
    route.destination,
    route.to,
    route.endPoint,
    route.arrival,
    'Destination'
  )
  const status = normalizeStatus(firstDefined(route.status, route.state), route.active)

  return {
    id: firstDefined(route.id, route.routeId, `${origin}-${destination}-${index}`),
    origin,
    destination,
    subtitle: firstDefined(route.subtitle, route.name, route.routeName, 'Intercity Corridor'),
    distance: firstDefined(route.distance, route.distanceKm, route.lengthKm, 0),
    averageTime: firstDefined(route.averageTime, route.duration, route.estimatedDuration, 'N/A'),
    stops: firstDefined(route.stops, route.stopCount, route.totalStops, 0),
    status,
    demandLabel: firstDefined(
      route.demandLabel,
      route.statusLabel,
      status === 'suspended' ? 'Temporarily Suspended' : 'High Demand'
    ),
    demandTone: firstDefined(route.demandTone, status === 'suspended' ? 'suspended' : 'high'),
    activeBuses: firstDefined(route.activeBuses, route.busCount, route.totalBuses, 0),
    start: [
      getCoordinate(
        route,
        ['startLat', 'originLat', 'fromLat', 'departureLat'],
        BUSES_ROUTES_FALLBACK_ROUTES[index % BUSES_ROUTES_FALLBACK_ROUTES.length].start[0]
      ),
      getCoordinate(
        route,
        ['startLng', 'originLng', 'fromLng', 'departureLng'],
        BUSES_ROUTES_FALLBACK_ROUTES[index % BUSES_ROUTES_FALLBACK_ROUTES.length].start[1]
      ),
    ],
    end: [
      getCoordinate(
        route,
        ['endLat', 'destinationLat', 'toLat', 'arrivalLat'],
        BUSES_ROUTES_FALLBACK_ROUTES[index % BUSES_ROUTES_FALLBACK_ROUTES.length].end[0]
      ),
      getCoordinate(
        route,
        ['endLng', 'destinationLng', 'toLng', 'arrivalLng'],
        BUSES_ROUTES_FALLBACK_ROUTES[index % BUSES_ROUTES_FALLBACK_ROUTES.length].end[1]
      ),
    ],
  }
}

function useFallback(reason) {
  buses.value = BUSES_ROUTES_FALLBACK_BUSES
  routes.value = BUSES_ROUTES_FALLBACK_ROUTES
  selectedRouteId.value = BUSES_ROUTES_FALLBACK_ROUTES[0].id
  error.value = reason
}

async function fetchFleetNetwork() {
  loading.value = true
  error.value = ''

  const [busResult, routeResult] = await Promise.allSettled([
    busService.getAll(),
    routeService.getAll(),
  ])

  const nextBuses =
    busResult.status === 'fulfilled' ? getCollection(busResult.value).map(normalizeBus) : []
  const nextRoutes =
    routeResult.status === 'fulfilled' ? getCollection(routeResult.value).map(normalizeRoute) : []

  if (nextBuses.length || nextRoutes.length) {
    buses.value = nextBuses.length ? nextBuses : BUSES_ROUTES_FALLBACK_BUSES
    routes.value = nextRoutes.length ? nextRoutes : BUSES_ROUTES_FALLBACK_ROUTES
    selectedRouteId.value =
      routes.value.find((route) => route.status === 'active')?.id || routes.value[0]?.id || null
    error.value =
      busResult.status === 'rejected' || routeResult.status === 'rejected'
        ? 'Some fleet data is unavailable. Showing available data with sample fallbacks.'
        : ''
  } else {
    useFallback('Fleet APIs returned no records. Showing sample fleet network data.')
  }

  loading.value = false
}

function selectRoute(route) {
  selectedRouteId.value =
    String(selectedRouteId.value) === String(route.id) ? null : route.id
}

function openCreateBusModal() {
  isCreateBusOpen.value = true
}

function openCreateRouteModal() {
  isCreateRouteOpen.value = true
}

function openDeleteRouteModal(route) {
  routeToDelete.value = route
  isDeleteRouteOpen.value = true
}

function handleRouteDeleted(deletedRoute) {
  if (String(selectedRouteId.value) === String(deletedRoute?.id)) {
    selectedRouteId.value = null
  }

  fetchFleetNetwork()
}

onMounted(fetchFleetNetwork)
</script>

<template>
  <div
    class="grid grid-cols-1 gap-8 p-4 md:p-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]"
  >
    <section class="flex flex-col gap-6 pb-8 xl:pb-96">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl leading-9 font-extrabold text-sky-950">Buses Fleet</h1>
          <p class="mt-1 text-sm leading-5 text-gray-700">
            Manage {{ activeBusCount }} active vehicles in your network.
          </p>
        </div>
        <BaseButton
          label="Add New Bus"
          size="md"
          html-type="button"
          class="self-start sm:self-auto"
          @click="openCreateBusModal"
        >
          <template #icon-left>
            <span class="size-2 rounded-full bg-white"></span>
          </template>
          Add New Bus
        </BaseButton>
      </header>

      <BaseEmptyState v-if="error" :title="error" tone="warning" class="text-left" />

      <div
        v-if="loading"
        class="rounded-2xl bg-white/70 p-5 text-sm font-semibold text-sky-700 shadow-sm"
      >
        Loading fleet network...
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        <FleetBusCard v-for="bus in buses" :key="bus.id" :bus="bus" />
        <FleetBusCard :bus="{ id: 'new' }" is-add-card />
      </div>
    </section>

    <section class="flex flex-col gap-6 pb-11">
      <header class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl leading-9 font-extrabold text-sky-950">Routes Network</h2>
          <p class="mt-1 text-sm leading-5 text-gray-700">
            Global inter-city connection<br class="hidden sm:block" />
            matrix.
          </p>
        </div>
        <BaseButton
          label="Add Route"
          type="secondary"
          size="md"
          html-type="button"
          class="self-start"
          @click="openCreateRouteModal"
        >
          <template #icon-left>
            <span class="size-2.5 rounded-full bg-zinc-900"></span>
          </template>
          Add Route
        </BaseButton>
      </header>

      <div class="flex flex-col gap-4">
        <RouteNetworkCard
          v-for="route in routes"
          :key="route.id"
          :route="route"
          :selected="String(route.id) === String(selectedRouteId)"
          @select="selectRoute"
          @delete="openDeleteRouteModal"
        />
      </div>

      <RouteMiniMap :route="selectedRoute" />
    </section>

    <ModalCreateBus v-model="isCreateBusOpen" @created="fetchFleetNetwork" />
    <ModalCreateRoute v-model="isCreateRouteOpen" @created="fetchFleetNetwork" />
    <ModalDeleteRoute
      v-model="isDeleteRouteOpen"
      :route="routeToDelete"
      @deleted="handleRouteDeleted"
    />
  </div>
</template>
