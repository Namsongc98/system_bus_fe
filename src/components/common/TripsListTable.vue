<script setup>
import BaseButton from '@/components/elements/BaseButton.vue'

defineProps({
  trips: { type: Array, default: () => [] },
})

function statusClass(status) {
  const classes = {
    scheduled: 'bg-sky-500/10 text-sky-500',
    ongoing: 'bg-emerald-500/10 text-emerald-800',
    completed: 'bg-zinc-300/20 text-gray-700',
  }

  return classes[status] || classes.scheduled
}
</script>

<template>
  <section
    class="overflow-hidden rounded-2xl bg-white/70 shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-300/10 backdrop-blur-md"
  >
    <div class="overflow-x-auto">
      <table class="w-full min-w-[920px] text-left">
        <thead class="border-b border-slate-300/10 bg-stone-100">
          <tr>
            <th class="px-6 py-4 text-xs leading-4 font-bold text-gray-700 uppercase">Trip ID</th>
            <th class="px-6 py-4 text-xs leading-4 font-bold text-gray-700 uppercase">
              Route / Times
            </th>
            <th class="px-6 py-4 text-xs leading-4 font-bold text-gray-700 uppercase">
              Operator / Bus
            </th>
            <th class="px-6 py-4 text-xs leading-4 font-bold text-gray-700 uppercase">Capacity</th>
            <th class="px-6 py-4 text-xs leading-4 font-bold text-gray-700 uppercase">Status</th>
            <th class="px-6 py-4 text-xs leading-4 font-bold text-gray-700 uppercase">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="trip in trips"
            :key="trip.id"
            class="border-t border-slate-300/10 first:border-t-0"
          >
            <td class="px-6 py-7 font-mono text-xs leading-4 font-bold text-zinc-900">
              {{ trip.code }}
            </td>
            <td class="px-6 py-5">
              <p class="text-sm leading-5 text-zinc-900">{{ trip.routeShort }}</p>
              <p class="text-xs leading-4 text-gray-700">{{ trip.timeRange }}</p>
            </td>
            <td class="px-6 py-5">
              <div class="flex items-center gap-2">
                <div class="flex size-6 items-center justify-center rounded-full bg-sky-700/10">
                  <span class="size-2 rounded-sm bg-zinc-900"></span>
                </div>
                <div>
                  <p class="text-xs leading-4 font-bold text-zinc-900">{{ trip.operatorShort }}</p>
                  <p class="text-[10px] text-gray-700">{{ trip.busShort }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-7">
              <div class="w-24">
                <p class="text-[10px] text-zinc-900">{{ trip.loadFactor }}%</p>
                <div class="h-1 overflow-hidden rounded-full bg-stone-200">
                  <div
                    class="h-1 rounded-full"
                    :class="trip.status === 'ongoing' ? 'bg-emerald-500' : 'bg-sky-700'"
                    :style="{ width: `${Math.min(100, Math.max(0, trip.loadFactor))}%` }"
                  ></div>
                </div>
              </div>
            </td>
            <td class="px-6 py-7">
              <span
                class="inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase"
                :class="statusClass(trip.status)"
              >
                {{ trip.statusLabel }}
              </span>
            </td>
            <td class="px-6 py-4">
              <BaseButton
                unstyled
                html-type="button"
                :aria-label="`Open actions for ${trip.code}`"
                class="flex size-8 items-center justify-center rounded-full text-gray-700 hover:bg-stone-100"
              >
                <span class="h-4 w-1 rounded-full bg-current"></span>
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer
      class="flex flex-col gap-3 bg-stone-100/50 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-xs leading-4 font-medium text-gray-700">
        Showing {{ trips.length }} of 24 active trips
      </p>
      <div class="flex gap-2">
        <BaseButton label="Previous" type="outline" size="sm" html-type="button" />
        <BaseButton label="Next" type="outline" size="sm" html-type="button" />
      </div>
    </footer>
  </section>
</template>
