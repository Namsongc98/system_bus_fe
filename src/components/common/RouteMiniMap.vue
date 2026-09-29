<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  route: { type: Object, default: null },
})

// Routes carry no coordinates yet (spec review 1.1 D3 = A): show the network area and the
// route's endpoint names, and only draw a line when real start/end points are provided.
const DEFAULT_CENTER = [16.0544, 106.5]
const DEFAULT_ZOOM = 5

const mapContainer = ref(null)
// Leaflet objects must not be deep-proxied by Vue.
const mapInstance = shallowRef(null)
const routeLayer = shallowRef(null)
const routeMarkers = shallowRef([])

const routeTitle = computed(() =>
  props.route ? `${props.route.origin} → ${props.route.destination}` : 'Network Overview'
)
const routeCaption = computed(() => {
  if (!props.route) return 'Select a route to highlight it'
  return props.route.distance
    ? `${props.route.subtitle} · ${props.route.distance} km`
    : props.route.subtitle
})

function getPoints() {
  const { start, end } = props.route || {}
  return Array.isArray(start) && Array.isArray(end) ? { start, end } : null
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
  }).setView(DEFAULT_CENTER, DEFAULT_ZOOM)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
  }).addTo(mapInstance.value)
}

function renderRoute() {
  if (!mapInstance.value) return

  clearRoute()

  const points = getPoints()
  if (!points) {
    mapInstance.value.setView(DEFAULT_CENTER, DEFAULT_ZOOM)
    mapInstance.value.invalidateSize()
    return
  }

  const { start, end } = points
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
      <p class="text-lg leading-7 font-normal text-white">{{ routeTitle }}</p>
      <p class="text-xs leading-4 text-white/80">{{ routeCaption }}</p>
    </div>
  </section>
</template>
