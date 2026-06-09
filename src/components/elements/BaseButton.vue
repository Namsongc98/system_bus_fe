<script setup>
/**
 * @typedef {Object} Props
 * @property {string}  [label='']          - Button text (or use default slot)
 * @property {string}  [htmlType='button'] - 'button' | 'submit' | 'reset'
 * @property {string}  [type='primary']    - Visual variant: 'primary' | 'secondary' | 'outline'
 * @property {string}  [size='md']         - 'sm' | 'md' | 'lg'
 * @property {boolean} [loading=false]     - Loading spinner state
 * @property {boolean} [block=false]       - Full-width button
 * @property {boolean} [unstyled=false]    - Use only shared button behavior; caller owns visual classes
 */
defineOptions({ inheritAttrs: false })

const props = defineProps({
  label: { type: String, default: '' },
  type: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline'].includes(v),
  },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  htmlType: { type: String, default: 'button' },
  unstyled: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

const sizeClasses = {
  sm: 'px-4 py-1 text-sm rounded-lg',
  md: 'px-6 py-2 text-base rounded-full',
  lg: 'px-8 py-3 text-lg rounded-full',
}

const variantClasses = {
  primary:
    'bg-secondary text-white shadow-[0px_4px_6px_-4px_rgba(59,130,246,0.24),0px_10px_15px_-3px_rgba(59,130,246,0.24)] hover:bg-secondary/90 hover:shadow-[0px_6px_10px_-4px_rgba(59,130,246,0.28),0px_14px_20px_-3px_rgba(59,130,246,0.28)] hover:-translate-y-px active:bg-secondary/80 active:translate-y-0',
  secondary: 'bg-secondary/10 text-secondary hover:bg-secondary/15 active:bg-secondary/20',
  outline:
    'bg-transparent text-secondary border border-secondary hover:bg-secondary/10 active:bg-secondary/15',
}

const uiColorByType = {
  primary: 'secondary',
  secondary: 'secondary',
  outline: 'secondary',
}

const uiVariantByType = {
  primary: 'solid',
  secondary: 'soft',
  outline: 'outline',
}
</script>

<template>
  <UButton
    v-bind="$attrs"
    :color="$attrs.color || (unstyled ? 'neutral' : uiColorByType[type])"
    :variant="$attrs.variant || (unstyled ? 'ghost' : uiVariantByType[type])"
    :type="htmlType"
    :loading="loading"
    :disabled="loading || !!$attrs.disabled"
    :block="block"
    :ui="{
      base: [
        'inline-flex items-center justify-center gap-2',
        'cursor-pointer whitespace-nowrap',
        'relative overflow-hidden transition-all duration-150',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
        unstyled ? '' : 'border-none font-normal',
        unstyled ? '' : sizeClasses[size],
        unstyled ? '' : variantClasses[type],
        block ? 'w-full' : '',
      ].join(' '),
      leadingIcon: '',
      trailingIcon: '',
    }"
    @click="!loading && !$attrs.disabled && emit('click')"
  >
    <template v-if="$slots['icon-left']" #leading>
      <slot name="icon-left" />
    </template>
    <slot>{{ label }}</slot>
    <template v-if="$slots['icon-right']" #trailing>
      <slot name="icon-right" />
    </template>
  </UButton>
</template>
