<script setup>
import { computed } from 'vue'
import BaseToggleSwitch from '@/components/elements/BaseToggleSwitch.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: 'Status' },
  activeLabel: { type: String, default: 'Active' },
  inactiveLabel: { type: String, default: 'Inactive' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'change'])

const statusLabel = computed(() => (props.modelValue ? props.activeLabel : props.inactiveLabel))
function handleChange(nextValue) {
  emit('update:modelValue', nextValue)
  emit('change', nextValue)
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <span class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase">
      {{ label }}
    </span>
    <div
      class="flex min-h-12 items-center justify-between gap-4 bg-stone-100 px-4 py-2 text-sm leading-5 font-medium text-gray-700"
      :class="disabled ? 'opacity-60' : ''"
    >
      <span>{{ statusLabel }}</span>
      <BaseToggleSwitch
        :model-value="modelValue"
        :aria-label="`${label}: ${statusLabel}`"
        :disabled="disabled"
        :on-label="activeLabel"
        :off-label="inactiveLabel"
        @change="handleChange"
      />
    </div>
  </div>
</template>
