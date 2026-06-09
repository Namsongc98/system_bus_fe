<script setup>
import BaseButton from '@/components/elements/BaseButton.vue'
import { computed } from 'vue'

/**
 *BaseTabs — segmented tab control.
 * Pattern A primitive: props in, emits out, no store/service/router access.
 *
 * @typedef {{ label: string, value: string }} TabOption
 */
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: String, default: 'upcoming' },
  options: {
    type: Array,
    default: () => [
      { label: 'Upcoming', value: 'upcoming' },
      { label: 'Past', value: 'past' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
  },
  disabled: { type: Boolean, default: false },
  ariaLabel: { type: String, default: 'Filter tabs' },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'chart'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleSelect = (value) => {
  if (props.disabled || value === props.modelValue) return
  emit('update:modelValue', value)
  emit('change', value)
}

const wrapperClass = computed(() => {
  if (props.variant === 'chart') {
    return 'inline-flex items-center justify-start rounded-full border border-sky-100 bg-sky-50/80 p-1 shadow-[inset_0px_1px_2px_0px_rgba(14,165,233,0.08)]'
  }

  return 'inline-flex items-center justify-start rounded-full bg-stone-200 p-1.5 shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]'
})

function getButtonClass(value) {
  const selected = value === props.modelValue

  if (props.variant === 'chart') {
    return [
      "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-center font-['Inter'] text-xs leading-4 transition-colors",
      selected
        ? 'bg-sky-700 font-medium text-white shadow-[0px_1px_2px_0px_rgba(3,105,161,0.18)]'
        : 'bg-white/70 font-medium text-zinc-900 hover:bg-white hover:text-sky-700',
    ].join(' ')
  }

  return [
    "inline-flex items-center justify-center rounded-full px-8 py-2.5 text-center font-['Inter'] text-sm leading-5 transition-colors",
    selected
      ? 'bg-white font-bold text-zinc-900 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
      : 'font-medium text-gray-700 hover:text-zinc-900',
  ].join(' ')
}
</script>

<template>
  <div
    v-bind="$attrs"
    :class="[wrapperClass, { 'pointer-events-none opacity-60': disabled }]"
    role="tablist"
    :aria-label="ariaLabel"
  >
    <BaseButton
      v-for="option in options"
      :key="option.value"
      unstyled
      html-type="button"
      role="tab"
      :class="getButtonClass(option.value)"
      :aria-selected="option.value === modelValue"
      :tabindex="option.value === modelValue ? 0 : -1"
      :disabled="disabled"
      @click="handleSelect(option.value)"
    >
      {{ option.label }}
    </BaseButton>
  </div>
</template>
