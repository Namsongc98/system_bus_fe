<script setup>
import { computed } from 'vue'

const props = defineProps({
  routes: { type: Array, default: () => [] },
})

const maxRevenue = computed(() =>
  Math.max(...props.routes.map((route) => Number(route.revenue) || 0), 1)
)

function barHeight(route) {
  const percent = ((Number(route.revenue) || 0) / maxRevenue.value) * 100
  return `${Math.max(32, Math.round(percent))}%`
}

function dotTop(route) {
  const factor = Math.min(100, Math.max(0, Number(route.loadFactor) || 0))
  return `${Math.max(8, 100 - factor)}%`
}
</script>

<template>
  <section class="rounded-2xl bg-white p-6 shadow-[0px_12px_64px_0px_rgba(27,27,28,0.04)] md:p-8">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg leading-7 font-bold text-zinc-900">Revenue by Route</h2>
        <p class="text-xs leading-4 text-gray-700">Top performing corridors this month</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="size-3 rounded-full bg-sky-500"></span>
          <span class="text-xs leading-4 font-medium text-gray-700">Revenue</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="size-3 rounded-full bg-purple-500"></span>
          <span class="text-xs leading-4 font-medium text-gray-700">Load Factor %</span>
        </div>
      </div>
    </header>

    <div class="mt-10 min-w-[520px]">
      <div class="relative flex h-64 items-end justify-center gap-6 px-4">
        <div
          class="absolute inset-0 flex flex-col justify-between border-b border-slate-300/10 pb-px"
          aria-hidden="true"
        >
          <span class="border-t border-slate-300/5"></span>
          <span class="border-t border-slate-300/5"></span>
          <span class="border-t border-slate-300/5"></span>
          <span class="border-t border-slate-300/5"></span>
        </div>

        <div
          v-for="route in routes"
          :key="route.id"
          class="relative z-10 flex h-full min-w-16 flex-1 flex-col justify-end"
        >
          <div
            class="flex justify-center rounded-t-[32px] bg-sky-500/10 pb-2"
            :style="{ height: barHeight(route) }"
          >
            <div
              class="w-8 rounded-t-xs bg-sky-500 shadow-[0px_-4px_12px_0px_rgba(14,165,233,0.30)]"
            ></div>
          </div>
          <p class="pt-3 text-center text-[10px] leading-4 font-bold text-gray-700">
            {{ route.label }}
          </p>
          <span
            class="absolute left-1/2 size-3 -translate-x-1/2 rounded-full bg-purple-500 shadow-[0px_0px_0px_4px_rgba(255,255,255,1)]"
            :style="{ top: dotTop(route) }"
            :aria-label="`${route.label} load factor ${route.loadFactor}%`"
          ></span>
        </div>
      </div>
    </div>
  </section>
</template>
