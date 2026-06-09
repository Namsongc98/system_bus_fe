<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import BaseButton from '@/components/elements/BaseButton.vue'

const props = defineProps({
  route: { type: Object, default: null },
})

const defaultPoints = {
  start: [51.5074, -0.1278],
  end: [53.4808, -2.2426],
}

const mapContainer = ref(null)
const mapInstance = ref(null)
const routeLayer = ref(null)
const routeMarkers = ref([])

function getPoints() {
  return {
    start: props.route?.start || defaultPoints.start,
    end: props.route?.end || defaultPoints.end,
  }
}

function clearRoute() {
  if (routeLayer.value) {
    routeLayer.value.remove()
    routeLayer.value = null
  }

  routeMarkers.value.forEach((marker) => marker.remove())
  routeMarkers.value = []
}

function ensureMap() {
  if (!mapContainer.value || mapInstance.value) return

  mapInstance.value = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false,
    dragging: true,
    scrollWheelZoom: false,
  }).setView(defaultPoints.start, 6)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
  }).addTo(mapInstance.value)
}

function renderRoute() {
  if (!mapInstance.value) return

  clearRoute()

  const { start, end } = getPoints()
  const title = props.route
    ? `${props.route.origin} to ${props.route.destination}`
    : 'Network Overview'

  routeLayer.value = L.polyline([start, end], {
    color: '#7c3aed',
    weight: 5,
    opacity: 0.85,
  }).addTo(mapInstance.value)

  routeMarkers.value = [
    L.circleMarker(start, {
      radius: 7,
      color: '#0369a1',
      fillColor: '#0369a1',
      fillOpacity: 1,
    })
      .bindTooltip(props.route?.origin || 'Origin')
      .addTo(mapInstance.value),
    L.circleMarker(end, {
      radius: 7,
      color: '#7c3aed',
      fillColor: '#7c3aed',
      fillOpacity: 1,
    })
      .bindTooltip(props.route?.destination || 'Destination')
      .addTo(mapInstance.value),
  ]

  routeLayer.value.bindTooltip(title, { sticky: true })
  mapInstance.value.fitBounds(routeLayer.value.getBounds(), { padding: [24, 24], maxZoom: 7 })
  mapInstance.value.invalidateSize()
}

async function setupMap() {
  await nextTick()
  ensureMap()
  renderRoute()
}

watch(() => props.route, setupMap, { deep: true })

onMounted(setupMap)

onBeforeUnmount(() => {
  clearRoute()

  if (mapInstance.value) {
    mapInstance.value.remove()
    mapInstance.value = null
  }
})
</script>

<template>
  <section
    class="relative h-48 overflow-hidden rounded-2xl bg-white/0 shadow-[inset_0px_2px_4px_1px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-slate-300/20"
    aria-label="Network visualization mini map"
  >
    <div ref="mapContainer" class="h-full w-full bg-slate-100" data-testid="route-mini-map"></div>

    <div
      class="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-r from-zinc-900/60 to-zinc-900/0 p-6"
    >
      <p class="text-lg leading-7 font-normal text-white">Network Overview</p>
      <p class="text-xs leading-4 text-white/80">
        Real-time status of all active transit corridors
      </p>
    </div>

    <BaseButton
      unstyled
      aria-label="Open route map"
      class="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-[6px] hover:bg-white/30"
    >
      <span class="size-4 rounded-sm bg-current"></span>
    </BaseButton>
  </section>
</template>
