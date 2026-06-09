<script setup>
// BaseCard — reusable card container element

defineProps({
  shadow: { type: String, default: 'md', validator: (v) => ['none', 'sm', 'md', 'lg'].includes(v) },
  padding: {
    type: String,
    default: 'md',
    validator: (v) => ['none', 'sm', 'md', 'lg'].includes(v),
  },
  rounded: { type: Boolean, default: true },
  hoverable: { type: Boolean, default: false },
})
</script>

<template>
  <div
    :class="[
      'base-card',
      `base-card--shadow-${shadow}`,
      `base-card--pad-${padding}`,
      { 'base-card--rounded': rounded, 'base-card--hover': hoverable },
    ]"
  >
    <!-- Card UI provided by Figma design -->
    <slot />
  </div>
</template>
