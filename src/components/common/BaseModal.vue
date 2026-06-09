<script setup>
// BaseModal — wrapper around UModal (Nuxt UI) with project-standard API

import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg', 'xl'].includes(v),
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

const sizeClass = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
}

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
    if (!val) emit('close')
  },
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{ content: `${sizeClass[size]} max-h-[calc(100dvh-2rem)] overflow-y-auto` }"
  >
    <template #content>
      <!-- Optional header with title + close button -->
      <div
        v-if="title"
        class="flex items-center justify-between border-b border-gray-100 px-6 py-4"
      >
        <span class="text-base font-semibold text-zinc-900">{{ title }}</span>
          <BaseButton
            unstyled
            html-type="button"
            aria-label="Close modal"
            class="flex size-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
            @click="isOpen = false"
          >
            <UIcon name="i-heroicons-x-mark" class="size-10" />
          </BaseButton>
      </div>

      <!-- Default slot — full width, no padding -->
      <slot />
    </template>
  </UModal>
</template>
