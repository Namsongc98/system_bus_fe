<script setup>
import { computed } from 'vue'

/**
 * RevenueSummaryCard — presentational KPI card for revenue reports.
 */
const props = defineProps({
  card: { type: Object, required: true },
})

const toneClasses = computed(() => {
  const classes = {
    sky: {
      halo: 'bg-sky-100',
      icon: 'bg-sky-100 text-sky-600',
    },
    purple: {
      halo: 'bg-purple-100',
      icon: 'bg-purple-100 text-purple-600',
    },
    emerald: {
      halo: 'bg-emerald-100',
      icon: 'bg-emerald-100 text-emerald-600',
    },
  }

  return classes[props.card.tone] || classes.sky
})

const trendClass = computed(() =>
  props.card.trendDirection === 'down' ? 'text-red-700' : 'text-emerald-800'
)
</script>

<template>
  <article
    class="relative flex min-h-48 flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-[0px_12px_64px_0px_rgba(27,27,28,0.06)]"
  >
    <div
      class="absolute -top-16 -right-8 size-32 rounded-full opacity-30"
      :class="toneClasses.halo"
    ></div>

    <div class="relative flex flex-col items-start gap-1">
      <div
        class="flex size-12 items-center justify-center rounded-[48px]"
        :class="toneClasses.icon"
      >
        <span class="h-4 w-5 rounded-sm bg-current"></span>
      </div>

      <p class="pt-3 text-sm leading-5 text-gray-700">{{ card.label }}</p>
      <p class="text-3xl leading-9 font-normal text-zinc-900">{{ card.value }}</p>

      <div class="flex items-center gap-2 pt-3">
        <span
          class="h-1.5 w-3 rounded-full"
          :class="card.trendDirection === 'down' ? 'bg-red-700' : 'bg-emerald-800'"
        ></span>
        <span class="text-xs leading-4 font-bold" :class="trendClass">{{ card.trend }}</span>
        <span class="text-xs leading-4 text-gray-700">{{ card.caption }}</span>
      </div>
    </div>
  </article>
</template>
