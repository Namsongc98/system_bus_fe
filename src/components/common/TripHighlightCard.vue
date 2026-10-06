<script setup>
const props = defineProps({
  trip: { type: Object, required: true },
})

const STATUS_CLASSES = {
  scheduled: 'bg-sky-500 text-white',
  ongoing: 'bg-emerald-500 text-white',
  completed: 'bg-zinc-400 text-white',
  cancelled: 'bg-rose-500 text-white',
}

function statusClass(status) {
  return STATUS_CLASSES[status] || STATUS_CLASSES.scheduled
}
</script>

<template>
  <article class="flex flex-col gap-3 rounded-[32px] bg-stone-50 p-4">
    <header class="flex items-start justify-between gap-4">
      <div>
        <p class="text-[10px] leading-4 font-bold tracking-wide text-gray-700 uppercase">
          {{ trip.code }}
        </p>
        <h3 class="text-sm leading-5 font-bold text-zinc-900">{{ trip.route }}</h3>
      </div>
      <span
        class="rounded-full px-2 py-0.5 text-[10px] leading-4 font-bold uppercase"
        :class="statusClass(trip.status)"
      >
        {{ trip.statusLabel }}
      </span>
    </header>

    <div class="flex items-center gap-3">
      <div class="flex size-8 items-center justify-center rounded-full bg-purple-200">
        <span class="size-2.5 rounded-sm bg-violet-700"></span>
      </div>
      <div>
        <p class="text-xs leading-4 font-bold text-zinc-900">{{ trip.operator }}</p>
        <p class="text-[10px] leading-4 text-gray-700">{{ trip.bus }}</p>
      </div>
    </div>

    <div class="flex flex-col gap-1 pt-1">
      <div class="flex justify-between text-[10px] leading-4 font-bold text-zinc-900">
        <span>Capacity</span>
        <span>{{ trip.booked }}/{{ trip.capacity }} Seats</span>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-stone-200">
        <div
          class="h-1.5 rounded-full bg-sky-500"
          :style="{ width: `${Math.min(100, Math.max(0, trip.loadFactor))}%` }"
        ></div>
      </div>
    </div>
  </article>
</template>
