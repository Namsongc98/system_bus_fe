<script setup>
import { computed } from 'vue'

/**
 * @typedef {{ label: string, value: string }} SortOption
 *
 * @typedef {Object} Props
 * @property {string}       modelValue    - Currently selected sort value
 * @property {SortOption[]} [options=[]]  - Available sort options
 * @property {string}       [label='Sort by'] - Prefix label shown before selected value
 * @property {boolean}      [disabled=false]  - Disabled state
 */
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  label: { type: String, default: 'Sort by' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const selectedLabel = computed(() => {
  const match = props.options.find((o) => o.value === props.modelValue)
  return match ? match.label : props.modelValue
})
</script>

<template>
  <USelect
    v-bind="$attrs"
    :model-value="modelValue"
    :items="options"
    value-key="value"
    label-key="label"
    :disabled="disabled"
    :content="{
      side: 'bottom',
      sideOffset: 8,
      collisionPadding: 8,
      position: 'popper',
      bodyLock: false,
      disableOutsidePointerEvents: false,
    }"
    :ui="{
      base: [
        'inline-flex items-center justify-start gap-2 rounded-full bg-stone-200 px-4 py-2',
        'font-[Inter] text-sm leading-5 font-medium text-zinc-900',
        'border-none ring-0 shadow-none transition-colors',
        'hover:bg-stone-300 focus-visible:ring-2 focus-visible:ring-sky-400/40',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      ].join(' '),
      leading: 'flex items-center',
      trailing: 'ms-auto flex items-center text-gray-700',
      content: 'rounded-xl bg-white shadow-lg ring-1 ring-slate-200',
      item: 'cursor-pointer text-sm text-zinc-900 data-highlighted:bg-stone-100',
      value: 'truncate',
    }"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #leading>
      <div class="inline-flex flex-col items-start justify-start">
        <UIcon name="i-heroicons-bars-arrow-down" class="h-4 w-4 text-zinc-900" />
      </div>
    </template>

    <template #default>
      <div class="inline-flex flex-col items-start justify-start">
        <span class="font-['Inter'] text-sm leading-5 font-medium text-zinc-900">
          {{ label }}: {{ selectedLabel }}
        </span>
      </div>
    </template>
  </USelect>
</template>
