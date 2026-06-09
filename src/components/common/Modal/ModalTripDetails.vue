<script setup>
import { computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/elements/BaseButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  trip: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'close'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    if (!value) emit('close')
  },
})

const statusClass = computed(() => {
  const classes = {
    scheduled: 'bg-sky-100 text-sky-800',
    ongoing: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-zinc-200 text-zinc-700',
    cancelled: 'bg-rose-100 text-rose-800',
  }

  return classes[props.trip?.status] || classes.scheduled
})

function formatDateTime(value) {
  if (!value) return 'Not available'

  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return 'Not available'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
</script>

<template>
  <BaseModal v-model="isOpen" title="Trip Details" size="lg">
    <div v-if="trip" class="space-y-6 p-6">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase">Trip</p>
          <h2 class="mt-1 text-xl font-bold text-zinc-900">{{ trip.code }}</h2>
          <p class="mt-1 text-sm text-gray-600">{{ trip.route }}</p>
        </div>
        <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statusClass">
          {{ trip.statusLabel }}
        </span>
      </header>

      <dl class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <div>
          <dt class="text-xs font-semibold text-gray-500 uppercase">Departure</dt>
          <dd class="mt-1 text-sm font-medium text-zinc-900">
            {{ formatDateTime(trip.departureTime) }}
          </dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-gray-500 uppercase">Arrival</dt>
          <dd class="mt-1 text-sm font-medium text-zinc-900">
            {{ formatDateTime(trip.arrivalTime) }}
          </dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-gray-500 uppercase">Bus</dt>
          <dd class="mt-1 text-sm font-medium text-zinc-900">{{ trip.bus }}</dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-gray-500 uppercase">Driver</dt>
          <dd class="mt-1 text-sm font-medium text-zinc-900">{{ trip.operator }}</dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-gray-500 uppercase">Capacity</dt>
          <dd class="mt-1 text-sm font-medium text-zinc-900">
            {{ trip.booked }} / {{ trip.capacity }} seats
          </dd>
        </div>
        <div>
          <dt class="text-xs font-semibold text-gray-500 uppercase">Load factor</dt>
          <dd class="mt-1 text-sm font-medium text-zinc-900">{{ trip.loadFactor }}%</dd>
        </div>
      </dl>

      <footer class="flex justify-end border-t border-gray-100 pt-5">
        <BaseButton html-type="button" type="secondary" @click="isOpen = false"> Close </BaseButton>
      </footer>
    </div>
  </BaseModal>
</template>
