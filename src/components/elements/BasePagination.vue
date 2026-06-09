<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/elements/BaseButton.vue'

/**
 * BasePagination — simple previous/next pagination footer.
 */
const props = defineProps({
  page: { type: Number, default: 0 },
  totalPages: { type: Number, default: 1 },
  hasPrevPage: { type: Boolean, default: false },
  hasNextPage: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['prev', 'next'])

const currentPageLabel = computed(() => props.page + 1)
const totalPageLabel = computed(() => Math.max(props.totalPages, 1))
</script>

<template>
  <div class="flex items-center justify-between border-t border-slate-200 px-5 py-4">
    <p class="text-xs font-medium text-slate-500">
      Page {{ currentPageLabel }} of {{ totalPageLabel }}
    </p>
    <div class="flex gap-2">
      <BaseButton
        label="Previous"
        type="outline"
        size="sm"
        :disabled="!hasPrevPage || loading"
        @click="emit('prev')"
      />
      <BaseButton
        label="Next"
        type="outline"
        size="sm"
        :disabled="!hasNextPage || loading"
        @click="emit('next')"
      />
    </div>
  </div>
</template>
