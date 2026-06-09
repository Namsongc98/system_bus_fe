<script setup>
defineProps({
  cells: { type: Array, default: () => [] },
})

const toneClasses = [
  'bg-sky-100',
  'bg-sky-200',
  'bg-sky-300',
  'bg-sky-400',
  'bg-sky-500',
  'bg-sky-700',
  'bg-purple-500',
  'bg-purple-700',
  'bg-purple-900',
]

function getToneClass(value) {
  return toneClasses[Math.min(toneClasses.length - 1, Math.max(0, Number(value) || 0))]
}
</script>

<template>
  <section class="rounded-2xl bg-white p-6 shadow-[0px_12px_64px_0px_rgba(27,27,28,0.04)]">
    <h2 class="text-base leading-6 font-normal text-zinc-900">Revenue Density</h2>
    <p class="text-xs leading-4 text-gray-700">Time-based analysis (Last 30 days)</p>

    <div class="grid grid-cols-7 gap-1 pt-5">
      <span
        v-for="(cell, index) in cells"
        :key="`${cell.value}-${index}`"
        class="h-4 rounded-xs"
        :class="getToneClass(cell.value)"
        :aria-label="`Revenue density ${cell.value}`"
      ></span>
    </div>

    <div class="flex items-center justify-between pt-3">
      <span class="text-[10px] leading-4 font-medium text-gray-700">Low Revenue</span>
      <div class="flex gap-0.5">
        <span class="size-3 rounded-[1px] bg-sky-100"></span>
        <span class="size-3 rounded-[1px] bg-sky-500"></span>
        <span class="size-3 rounded-[1px] bg-purple-500"></span>
        <span class="size-3 rounded-[1px] bg-purple-900"></span>
      </div>
      <span class="text-[10px] leading-4 font-medium text-gray-700">Peak Revenue</span>
    </div>
  </section>
</template>
