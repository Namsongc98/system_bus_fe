<script setup>
/**
 * @typedef {Object} Props
 * @property {string|number} modelValue       - Bound value (v-model)
 * @property {string}        [type='text']    - HTML input type
 * @property {string}        [label='']       - Label text rendered above the input
 * @property {string}        [placeholder=''] - Placeholder text
 * @property {string}        [error='']       - Validation error message
 * @property {boolean}       [disabled=false] - Disabled state
 * @property {boolean}       [required=false] - Required state
 * @property {string}        [size='md']      - Input size: 'sm' | 'md' | 'lg' | 'xl'
 * @property {string}        [color='gray']   - UInput color variant
 * @property {string}        [variant='outline'] - UInput variant: 'outline' | 'none'
 */

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
  color: { type: String, default: 'gray' },
  variant: { type: String, default: 'outline' },
  ui: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'blur'])
</script>

<template>
  <div class="w-full" v-bind="$attrs">
    <label v-if="label" class="mb-1 block text-sm font-medium text-zinc-700">{{ label }}</label>
    <UInput
      class="w-full"
      :type="type"
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :size="size"
      :color="error ? 'red' : color"
      :variant="variant"
      :ui="{ root: 'w-full', ...ui }"
      @update:model-value="emit('update:modelValue', $event)"
      @blur="emit('blur', $event)"
    >
      <template v-if="$slots.leading" #leading="slotProps">
        <slot name="leading" v-bind="slotProps" />
      </template>
      <template v-if="$slots.trailing" #trailing="slotProps">
        <slot name="trailing" v-bind="slotProps" />
      </template>
    </UInput>
    <span v-if="error" class="mt-1 block text-xs text-red-500">{{ error }}</span>
  </div>
</template>
