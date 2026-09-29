<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/elements/BaseButton.vue'

/**
 * FleetBusCard — presentational fleet vehicle card.
 * Only fields the BE returns are shown (spec review 1.1 D3 = A): no model, uptime,
 * age or driver placeholders.
 *
 * @typedef {Object} FleetBus
 * @property {string|number} id
 * @property {string} plate
 * @property {string|number} capacity
 * @property {'AVAILABLE'|'IN_USE'|'MAINTENANCE'} status
 */
const props = defineProps({
  bus: { type: Object, required: true },
  isAddCard: { type: Boolean, default: false },
})

const emit = defineEmits(['add', 'edit', 'delete'])

const STATUS_STYLES = {
  AVAILABLE: {
    label: 'Available',
    badge: 'bg-emerald-500/20 text-emerald-600',
    dot: 'bg-emerald-400',
  },
  IN_USE: { label: 'In use', badge: 'bg-sky-500/20 text-sky-700', dot: 'bg-sky-600' },
  MAINTENANCE: { label: 'Maintenance', badge: 'bg-red-700/10 text-red-700', dot: 'bg-red-700' },
}

const statusStyle = computed(() => STATUS_STYLES[props.bus.status] || STATUS_STYLES.AVAILABLE)
</script>

<template>
  <BaseButton
    v-if="isAddCard"
    unstyled
    html-type="button"
    aria-label="Register vehicle"
    class="flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300/50 px-5 py-16 text-slate-400 transition hover:border-sky-300 hover:text-sky-600"
    @click="emit('add')"
  >
    <span class="mb-2 flex size-9 items-center justify-center rounded-full border-2 border-current">
      <span class="text-2xl leading-none">+</span>
    </span>
    <span class="text-sm leading-5 font-bold">Register Vehicle</span>
  </BaseButton>

  <article
    v-else
    class="flex min-h-48 flex-col justify-between gap-4 rounded-2xl bg-white/70 p-5 shadow-sm outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-md"
  >
    <header class="flex items-start justify-between gap-4">
      <div class="flex min-w-0 items-center gap-3">
        <div
          class="flex h-12 w-10 shrink-0 items-center justify-center rounded-[48px] bg-sky-500/20"
        >
          <img src="@/assets/icons/IconBus.svg" alt="" class="size-full p-2" />
        </div>
        <h3 class="truncate text-base leading-6 font-bold text-zinc-900">{{ bus.plate }}</h3>
      </div>

      <span
        class="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[10px] leading-4 font-bold tracking-wide uppercase"
        :class="statusStyle.badge"
      >
        <span class="size-1.5 rounded-full" :class="statusStyle.dot"></span>
        {{ statusStyle.label }}
      </span>
    </header>

    <dl class="rounded-[48px] bg-stone-100 p-2 text-center">
      <dt class="text-[10px] leading-4 font-bold text-gray-500 uppercase">Capacity</dt>
      <dd class="text-sm leading-5 font-extrabold text-zinc-900">{{ bus.capacity }} seats</dd>
    </dl>

    <footer class="flex items-center justify-end gap-2 border-t border-slate-300/10 pt-4">
      <BaseButton
        unstyled
        html-type="button"
        :aria-label="`Edit bus ${bus.plate}`"
        class="flex size-8 shrink-0 items-center justify-center rounded-full text-sky-700 hover:bg-sky-50"
        @click="emit('edit', bus)"
      >
        <UIcon name="i-heroicons-pencil-square" class="size-4" />
      </BaseButton>
      <BaseButton
        unstyled
        html-type="button"
        :aria-label="`Delete bus ${bus.plate}`"
        class="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
        @click="emit('delete', bus)"
      >
        <UIcon name="i-heroicons-trash" class="size-4" />
      </BaseButton>
    </footer>
  </article>
</template>
