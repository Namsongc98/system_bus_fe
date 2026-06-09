<script setup>
import BaseEmptyState from '@/components/elements/BaseEmptyState.vue'
import BaseTabs from '@/components/elements/BaseTabs.vue'

const props = defineProps({
  title: { type: String, default: 'Trend' },
  description: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  tabs: {
    type: Array,
    default: () => [
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
    ],
  },
  modelValue: { type: String, default: 'monthly' },
  loading: { type: Boolean, default: false },
  emptyTitle: { type: String, default: 'No chart data' },
  emptyDescription: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

function handleTabChange(value) {
  emit('update:modelValue', value)
}
</script>

<template>
  <article
    class="flex flex-col gap-4 rounded-[32px] bg-white/70 p-6 shadow-sm backdrop-blur-md md:p-8"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg leading-7 font-bold text-zinc-900">{{ title }}</h2>
        <p v-if="description" class="text-xs leading-4 text-gray-700">{{ description }}</p>
      </div>

      <BaseTabs
        :model-value="modelValue"
        :options="tabs"
        :disabled="loading"
        variant="chart"
        aria-label="Trend chart period"
        class="self-start sm:self-auto"
        @update:model-value="handleTabChange"
      />
    </div>

    <div class="relative min-h-72 overflow-hidden">
      <div
        v-if="loading"
        class="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/60 text-sm font-semibold text-sky-700 backdrop-blur-sm"
      >
        Loading chart...
      </div>

      <BaseEmptyState
        v-if="!items.length"
        :title="emptyTitle"
        :description="emptyDescription"
        class="mt-8"
      />

      <div v-else class="relative flex h-72 items-end justify-between overflow-hidden pt-6">
        <div class="absolute inset-x-0 top-8 bottom-8 flex flex-col justify-between opacity-15">
          <span class="border-t border-zinc-900"></span>
          <span class="border-t border-zinc-900"></span>
          <span class="border-t border-zinc-900"></span>
          <span class="border-t border-zinc-900"></span>
        </div>

        <div
          v-for="item in items"
          :key="item.label"
          class="relative z-10 flex flex-1 flex-col items-center justify-end gap-3"
        >
          <div
            class="w-8 rounded-t-full bg-gradient-to-t from-sky-700 to-violet-500/40 shadow-[0px_16px_32px_-18px_rgba(3,105,161,0.8)]"
            :class="item.heightClass || 'h-24'"
            :aria-label="`${item.label}: ${item.value}`"
          ></div>
          <span class="text-[10px] leading-4 font-bold tracking-wide text-gray-700 uppercase">
            {{ item.label }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
