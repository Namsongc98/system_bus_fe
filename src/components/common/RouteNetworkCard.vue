<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseToggleSwitch from '@/components/elements/BaseToggleSwitch.vue'

/**
 * RouteNetworkCard — presentational route summary card.
 * Stats the BE does not return (avg time, stops, demand, active buses) are only shown
 * when present (spec review 1.1 D3 = A).
 *
 * @typedef {Object} NetworkRoute
 * @property {string|number} id
 * @property {string} origin
 * @property {string} destination
 * @property {string} subtitle
 * @property {string|number} distance
 * @property {string} averageTime
 * @property {string|number} stops
 * @property {string} status
 * @property {string} demandLabel
 * @property {string|number} activeBuses
 */
const props = defineProps({
  route: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})

const emit = defineEmits(['select', 'edit', 'delete'])

const isSuspended = computed(() => props.route.status === 'suspended')
const isPremium = computed(() => props.route.demandTone === 'premium')
const cardClass = computed(() =>
  isSuspended.value ? 'bg-white/50 opacity-80 bg-blend-saturation' : 'bg-white/70'
)
const iconClass = computed(() =>
  isSuspended.value ? 'bg-stone-200 text-gray-700' : 'bg-purple-200/30 text-violet-700'
)
const demandClass = computed(() => {
  if (isSuspended.value) return 'text-gray-700'
  if (isPremium.value) return 'text-sky-700'
  return 'text-emerald-800'
})
const statusLabel = computed(
  () => props.route.demandLabel || (isSuspended.value ? 'Inactive' : 'Active')
)
const hasValue = (value) => value !== undefined && value !== null && value !== ''
const stats = computed(() =>
  [
    { label: 'Distance', value: `${props.route.distance || 'N/A'} KM`, show: true },
    {
      label: 'Avg Time',
      value: props.route.averageTime,
      show: hasValue(props.route.averageTime),
    },
    {
      label: 'Stops',
      value: String(props.route.stops ?? '').padStart(2, '0'),
      show: hasValue(props.route.stops),
    },
  ].filter((stat) => stat.show)
)

const routeLabel = computed(() => `${props.route.origin} to ${props.route.destination}`)
</script>

<template>
  <article
    class="flex flex-col gap-4 rounded-2xl p-6 shadow-sm outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-md transition hover:-translate-y-px hover:shadow-md"
    :class="[cardClass, selected ? 'ring-2 ring-sky-500/40' : '']"
  >
    <header class="flex items-start justify-between gap-4">
      <div class="flex min-w-0 items-center gap-4">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-full"
          :class="iconClass"
        >
          <img src="@/assets/icons/IconRoute.svg" alt="" class="size-6" />
        </div>
        <div class="min-w-0">
          <h4 class="truncate text-lg leading-6 font-bold text-zinc-900">
            {{ route.origin }} -> {{ route.destination }}
          </h4>
          <p class="truncate text-xs leading-4 font-medium text-gray-700">{{ route.subtitle }}</p>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <BaseButton
          unstyled
          :aria-label="`Edit route ${routeLabel}`"
          class="!flex !size-8 !items-center !justify-center !rounded-full !p-0 !text-sky-700 transition hover:!bg-sky-50"
          size="sm"
          @click="emit('edit', route)"
        >
          <UIcon name="i-heroicons-pencil-square" class="size-4" />
        </BaseButton>

        <BaseButton
          unstyled
          color="error"
          variant="ghost"
          :aria-label="`Delete route ${routeLabel}`"
          class="!flex !size-8 !items-center !justify-center !rounded-full !bg-red-500 !p-0 !text-white !shadow-none transition hover:!bg-red-600"
          size="sm"
          @click="emit('delete', route)"
        >
          <UIcon name="i-heroicons-trash" class="size-4" />
        </BaseButton>

        <BaseToggleSwitch
          :model-value="selected"
          :aria-label="`Select ${routeLabel}`"
          @change="emit('select', route)"
        />
      </div>
    </header>

    <dl
      class="grid rounded-[48px] bg-stone-100 px-4 py-3"
      :style="{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }"
    >
      <div v-for="(stat, index) in stats" :key="stat.label" class="flex items-center">
        <div class="min-w-0">
          <dt class="text-[10px] leading-4 font-bold text-gray-500 uppercase">{{ stat.label }}</dt>
          <dd class="truncate text-sm leading-5 font-extrabold text-zinc-900">{{ stat.value }}</dd>
        </div>
        <div v-if="index < stats.length - 1" class="mx-auto h-8 w-px bg-slate-300/30"></div>
      </div>
    </dl>

    <footer class="flex items-center justify-between gap-4">
      <div class="flex min-w-0 items-center gap-2" :class="demandClass">
        <span class="size-3 shrink-0 rounded-sm bg-current"></span>
        <p class="truncate text-xs leading-4 font-bold">{{ statusLabel }}</p>
      </div>
      <p v-if="hasValue(route.activeBuses)" class="shrink-0 text-xs leading-4 text-zinc-900">
        <span class="text-gray-700">Active Buses: </span>{{ route.activeBuses }}
      </p>
    </footer>
  </article>
</template>
