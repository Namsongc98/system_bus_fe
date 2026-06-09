<script setup>
import { computed } from 'vue'

/**
 * BaseEmptyState — compact reusable empty or lightweight feedback block.
 */
const props = defineProps({
  title: { type: String, default: 'No data available' },
  description: { type: String, default: '' },
  tone: {
    type: String,
    default: 'neutral',
    validator: (value) => ['neutral', 'warning', 'danger'].includes(value),
  },
})

const toneClasses = computed(() => {
  const classes = {
    neutral: 'bg-slate-50 text-slate-500',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
  }

  return classes[props.tone]
})
</script>

<template>
  <div class="rounded-lg p-4 text-center" :class="toneClasses">
    <p class="text-sm font-bold">{{ title }}</p>
    <p v-if="description" class="mt-1 text-sm">{{ description }}</p>
  </div>
</template>
