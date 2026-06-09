<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import IconBus from '@/assets/icons/IconBus.svg'

/**
 * FleetBusCard — presentational fleet vehicle card.
 *
 * @typedef {Object} FleetBus
 * @property {string|number} id
 * @property {string} plate
 * @property {string} model
 * @property {string|number} capacity
 * @property {string|number} uptime
 * @property {string} age
 * @property {string} status
 * @property {string[]} drivers
 * @property {string} maintenanceNote
 */
const props = defineProps({
  bus: { type: Object, required: true },
  isAddCard: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

const isMaintenance = computed(() => props.bus.status === 'maintenance')
const statusLabel = computed(() => (isMaintenance.value ? 'Maintenance' : 'Active'))
const statusClass = computed(() =>
  isMaintenance.value ? 'bg-red-700/10 text-red-700' : 'bg-emerald-500/20 text-emerald-600'
)
const statusDotClass = computed(() => (isMaintenance.value ? 'bg-red-700' : 'bg-emerald-400'))
const modelLines = computed(() => String(props.bus.model || 'Unknown model').split(' '))
const stats = computed(() => [
  { label: 'Capacity', value: props.bus.capacity || 'N/A' },
  { label: 'Uptime', value: `${props.bus.uptime || 0}%` },
  { label: 'Age', value: props.bus.age || 'N/A' },
])
</script>

<template>
  <article
    v-if="isAddCard"
    class="flex min-h-60 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300/50 px-5 py-16 text-slate-300"
  >
    <span class="mb-2 flex size-9 items-center justify-center rounded-full border-2 border-current">
      <span class="text-2xl leading-none">+</span>
    </span>
    <p class="text-sm leading-5 font-bold">Register Vehicle</p>
  </article>

  <article
    v-else
    class="flex min-h-60 flex-col justify-between gap-4 rounded-2xl bg-white/70 p-5 shadow-sm outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-md"
  >
    <header class="flex items-start justify-between gap-4">
      <div class="flex min-w-0 items-center gap-3">
        <div
          class="flex h-12 w-10 shrink-0 items-center justify-center rounded-[48px] bg-sky-500/20"
        >
          
          <img src="/src/assets/icons/IconBus.svg" alt="Bus Icon" class="size-full p-2" />
        </div>
        <div class="min-w-0">
          <h3 class="truncate text-base leading-6 font-bold text-zinc-900">{{ bus.plate }}</h3>
          <p class="text-[10px] leading-4 font-bold tracking-wide text-gray-700 uppercase">
            <template v-for="line in modelLines" :key="line"> {{ line }}<br /> </template>
          </p>
        </div>
      </div>

      <span
        class="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] leading-4 font-bold tracking-wide uppercase"
        :class="statusClass"
      >
        <span class="size-1.5 rounded-full" :class="statusDotClass"></span>
        {{ statusLabel }}
      </span>
    </header>

    <dl class="grid grid-cols-1 gap-2">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-[48px] bg-stone-100 p-2 text-center"
      >
        <dt class="text-[10px] leading-4 font-bold text-gray-500 uppercase">{{ stat.label }}</dt>
        <dd class="text-sm leading-5 font-extrabold text-zinc-900">{{ stat.value }}</dd>
      </div>
    </dl>

    <footer class="flex items-center justify-between gap-4 border-t border-slate-300/10 pt-4">
      <div v-if="isMaintenance" class="flex min-w-0 items-center gap-1">
        <span class="size-3 rounded-sm bg-red-700"></span>
        <p class="truncate text-[10px] leading-4 font-bold text-red-700">
          {{ bus.maintenanceNote || 'Service scheduled' }}
        </p>
      </div>
      <div v-else class="flex items-start">
        <span
          v-for="(driver, index) in bus.drivers.slice(0, 2)"
          :key="driver"
          class="flex size-6 items-center justify-center rounded-full border-2 border-white bg-sky-100 text-[10px] font-bold text-sky-800"
          :class="{ '-ml-2': index > 0 }"
          :title="driver"
        >
          {{ driver.charAt(0).toUpperCase() }}
        </span>
        <span
          v-if="bus.drivers.length > 2"
          class="-ml-2 flex size-6 items-center justify-center rounded-full border-2 border-white bg-stone-200 text-[10px] font-bold text-gray-500"
        >
          +{{ bus.drivers.length - 2 }}
        </span>
      </div>

      <BaseButton
        unstyled
        aria-label="View bus details"
        class="flex size-8 shrink-0 items-center justify-center rounded-full text-sky-700 hover:bg-sky-50"
        @click="emit('select', bus)"
      >
        <span class="h-1 w-4 rounded-full bg-current"></span>
      </BaseButton>
    </footer>
  </article>
</template>
