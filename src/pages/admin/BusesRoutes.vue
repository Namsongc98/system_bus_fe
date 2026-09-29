<script setup>
// BusesRoutes — /admin/buses-routes
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import ModalCreateBus from '@/components/common/Modal/ModalCreateBus.vue'
import ModalCreateRoute from '@/components/common/Modal/ModalCreateRoute.vue'
import ModalDeleteConfirm from '@/components/common/Modal/ModalDeleteConfirm.vue'
import FleetBusCard from '@/components/common/FleetBusCard.vue'
import RouteMiniMap from '@/components/common/RouteMiniMap.vue'
import RouteNetworkCard from '@/components/common/RouteNetworkCard.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseEmptyState from '@/components/elements/BaseEmptyState.vue'
import BasePagination from '@/components/elements/BasePagination.vue'
import { useBusRouteStore } from '@/stores/busRoute'

const store = useBusRouteStore()
const { buses, busPage, busesLoading, busesError, routes, routePage, routesLoading, routesError } =
  storeToRefs(store)

const selectedRouteId = ref(null)
const isBusModalOpen = ref(false)
const busToEdit = ref(null)
const isRouteModalOpen = ref(false)
const routeToEdit = ref(null)
const isDeleteOpen = ref(false)
const deleteTarget = ref(null)

// BusResponse / RouteResponse → card props. Only BE fields (spec review 1.1 D3 = A).
function normalizeBus(bus) {
  return { id: bus.id, plate: bus.plateNumber, capacity: bus.capacity, status: bus.status }
}

function normalizeRoute(route) {
  return {
    id: route.id,
    origin: route.startPoint,
    destination: route.endPoint,
    subtitle: route.routeName,
    distance: route.distanceKm,
    status: route.status === 'INACTIVE' ? 'suspended' : 'active',
  }
}

const busCards = computed(() => buses.value.map(normalizeBus))
// The skeleton / error block replaces the list only when there is nothing to show yet; a
// refresh after a page change or mutation keeps the current cards on screen.
const showBusesLoading = computed(() => busesLoading.value && !busCards.value.length)
const showBusesError = computed(() => !!busesError.value)
const hasBusList = computed(
  () => !showBusesLoading.value && !(busesError.value && !busCards.value.length)
)
const routeCards = computed(() => routes.value.map(normalizeRoute))
const showRoutesLoading = computed(() => routesLoading.value && !routeCards.value.length)
const hasRouteList = computed(
  () => !showRoutesLoading.value && !(routesError.value && !routeCards.value.length)
)
const selectedRoute = computed(
  () => routeCards.value.find((route) => String(route.id) === String(selectedRouteId.value)) || null
)
const findBus = (id) => buses.value.find((bus) => String(bus.id) === String(id)) || null
const findRoute = (id) => routes.value.find((route) => String(route.id) === String(id)) || null

function loadBuses(page) {
  return store.fetchBuses({ page })
}

// Keep the selection if the route is still listed, otherwise pick the first active one.
function ensureRouteSelection() {
  if (!findRoute(selectedRouteId.value)) {
    selectedRouteId.value =
      routes.value.find((route) => route.status === 'ACTIVE')?.id ?? routes.value[0]?.id ?? null
  }
}

async function loadRoutes(page) {
  await store.fetchRoutes({ page })
  ensureRouteSelection()
}

function selectRoute(route) {
  selectedRouteId.value = String(selectedRouteId.value) === String(route.id) ? null : route.id
}

function openBusModal(card = null) {
  busToEdit.value = card ? findBus(card.id) : null
  isBusModalOpen.value = true
}

function openRouteModal(card = null) {
  routeToEdit.value = card ? findRoute(card.id) : null
  isRouteModalOpen.value = true
}

function openDeleteBus(card) {
  deleteTarget.value = {
    entityType: 'bus',
    entityName: card.plate,
    onConfirm: () => store.deleteBus(card.id),
  }
  isDeleteOpen.value = true
}

function openDeleteRoute(card) {
  deleteTarget.value = {
    entityType: 'route',
    entityName: card.subtitle,
    onConfirm: async () => {
      await store.deleteRoute(card.id)
      ensureRouteSelection()
    },
  }
  isDeleteOpen.value = true
}

onMounted(() => {
  loadBuses(0)
  loadRoutes(0)
})
</script>

<template>
  <div
    class="grid grid-cols-1 gap-8 p-4 md:p-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)]"
  >
    <section class="flex flex-col gap-6 pb-8">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl leading-9 font-extrabold text-sky-950">Buses Fleet</h1>
          <p class="mt-1 text-sm leading-5 text-gray-700">
            <template v-if="hasBusList">
              {{ busPage.totalElements }} vehicles in your network.
            </template>
            <template v-else>Manage the vehicles in your network.</template>
          </p>
        </div>
        <BaseButton
          label="Add New Bus"
          size="md"
          html-type="button"
          class="self-start sm:self-auto"
          @click="openBusModal()"
        >
          <template #icon-left>
            <span class="size-2 rounded-full bg-white"></span>
          </template>
          Add New Bus
        </BaseButton>
      </header>

      <div
        v-if="showBusesLoading"
        role="status"
        class="rounded-2xl bg-white/70 p-5 text-sm font-semibold text-sky-700 shadow-sm"
        data-testid="buses-loading"
      >
        Loading buses...
      </div>

      <div v-if="showBusesError" role="alert" class="flex flex-col gap-3" data-testid="buses-error">
        <BaseEmptyState :title="busesError" tone="danger" />
        <BaseButton
          label="Retry"
          type="outline"
          size="sm"
          class="self-center"
          @click="loadBuses(busPage.page)"
        />
      </div>

      <template v-if="hasBusList">
        <BaseEmptyState
          v-if="!busCards.length && !busesError"
          title="No buses yet"
          description="Register your first vehicle to start scheduling trips."
          data-testid="buses-empty"
        />
        <div
          class="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3"
          :aria-busy="busesLoading"
        >
          <FleetBusCard
            v-for="bus in busCards"
            :key="bus.id"
            :bus="bus"
            @edit="openBusModal"
            @delete="openDeleteBus"
          />
          <FleetBusCard :bus="{ id: 'new' }" is-add-card @add="openBusModal()" />
        </div>
        <BasePagination
          v-if="busPage.totalPages > 1"
          :page="busPage.page"
          :total-pages="busPage.totalPages"
          :has-prev-page="busPage.page > 0"
          :has-next-page="busPage.page + 1 < busPage.totalPages"
          :loading="busesLoading"
          @prev="loadBuses(busPage.page - 1)"
          @next="loadBuses(busPage.page + 1)"
        />
      </template>
    </section>

    <section class="flex flex-col gap-6 pb-11">
      <header class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl leading-9 font-extrabold text-sky-950">Routes Network</h2>
          <p class="mt-1 text-sm leading-5 text-gray-700">
            <template v-if="hasRouteList"
              >{{ routePage.totalElements }} inter-city routes.</template
            >
            <template v-else>Manage the inter-city routes.</template>
          </p>
        </div>
        <BaseButton
          label="Add Route"
          type="secondary"
          size="md"
          html-type="button"
          class="self-start"
          @click="openRouteModal()"
        >
          <template #icon-left>
            <span class="size-2.5 rounded-full bg-zinc-900"></span>
          </template>
          Add Route
        </BaseButton>
      </header>

      <div
        v-if="showRoutesLoading"
        role="status"
        class="rounded-2xl bg-white/70 p-5 text-sm font-semibold text-sky-700 shadow-sm"
        data-testid="routes-loading"
      >
        Loading routes...
      </div>

      <div v-if="routesError" role="alert" class="flex flex-col gap-3" data-testid="routes-error">
        <BaseEmptyState :title="routesError" tone="danger" />
        <BaseButton
          label="Retry"
          type="outline"
          size="sm"
          class="self-center"
          @click="loadRoutes(routePage.page)"
        />
      </div>

      <template v-if="hasRouteList">
        <BaseEmptyState
          v-if="!routeCards.length && !routesError"
          title="No routes yet"
          description="Create your first route to connect an origin and a destination."
          data-testid="routes-empty"
        />
        <div class="flex flex-col gap-4" :aria-busy="routesLoading">
          <RouteNetworkCard
            v-for="route in routeCards"
            :key="route.id"
            :route="route"
            :selected="String(route.id) === String(selectedRouteId)"
            @select="selectRoute"
            @edit="openRouteModal"
            @delete="openDeleteRoute"
          />
        </div>
        <BasePagination
          v-if="routePage.totalPages > 1"
          :page="routePage.page"
          :total-pages="routePage.totalPages"
          :has-prev-page="routePage.page > 0"
          :has-next-page="routePage.page + 1 < routePage.totalPages"
          :loading="routesLoading"
          @prev="loadRoutes(routePage.page - 1)"
          @next="loadRoutes(routePage.page + 1)"
        />
      </template>

      <RouteMiniMap :route="selectedRoute" />
    </section>

    <ModalCreateBus v-model="isBusModalOpen" :bus="busToEdit" />
    <ModalCreateRoute v-model="isRouteModalOpen" :route="routeToEdit" />
    <ModalDeleteConfirm
      v-if="deleteTarget"
      v-model="isDeleteOpen"
      :entity-type="deleteTarget.entityType"
      :entity-name="deleteTarget.entityName"
      :on-confirm="deleteTarget.onConfirm"
    />
  </div>
</template>
