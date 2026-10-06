<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseEmptyState from '@/components/elements/BaseEmptyState.vue'
import { useToast } from '@/composables/useToast'
import { useTripStore } from '@/stores/trip'
import { TRIPS_MANAGEMENT_STATUS_ACTIONS } from '@/constants/admin/tripsManagement'
import { toTripView } from '@/utils/tripView'

/**
 * ModalTripDetails — one trip, reloaded from GET /api/trip/{id} on open (fresh seats, revenue,
 * status), with the actions its status allows (spec review 1.3 S18). Edit and delete are handed
 * back to the page (`edit`, `delete`) so modals are never stacked.
 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // Trip view from the list (toTripView); shown until the fresh copy arrives.
  trip: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'close', 'edit', 'delete'])

const toast = useToast()
const store = useTripStore()

const detail = ref(null)
const loading = ref(false)
const loadError = ref('')
// Status waiting for an explicit confirmation (cancelling cascades to tickets — D3 = A).
const confirmingStatus = ref(null)
// A response for a trip that was closed / replaced meanwhile is dropped (frontend review 1.3 #2).
let loadRequestId = 0

const busy = computed(() => !!detail.value && store.busyTripId === detail.value.id)
const view = computed(() => detail.value ?? props.trip)
const actions = computed(() => TRIPS_MANAGEMENT_STATUS_ACTIONS[view.value?.statusKey] ?? [])
const canEdit = computed(() => view.value?.statusKey === 'SCHEDULED')
// The BE refuses to delete a trip that has any ticket (plan §1.3); only offer it when none are sold.
// Cancelled tickets count too: BE only deletes a trip that never had a ticket (B35 e).
const canDelete = computed(() => !!detail.value && detail.value.ticketCount === 0)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    // Escape / overlay must not close the modal while a status change is in flight.
    if (!value && busy.value) return
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

  return classes[view.value?.status] || classes.scheduled
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

async function load() {
  const requestId = ++loadRequestId
  if (!props.trip?.id) return
  loading.value = true
  loadError.value = ''
  try {
    const fresh = toTripView(await store.fetchById(props.trip.id))
    if (requestId === loadRequestId) detail.value = fresh
  } catch (err) {
    if (requestId === loadRequestId) loadError.value = err?.message || 'Unable to load trip'
  } finally {
    if (requestId === loadRequestId) loading.value = false
  }
}

watch(
  () => [props.modelValue, props.trip?.id],
  ([open]) => {
    detail.value = null
    confirmingStatus.value = null
    if (open) load()
    else loadRequestId += 1
  },
  { immediate: true }
)

async function runAction(action) {
  if (!detail.value || busy.value) return
  if (action.confirm && confirmingStatus.value !== action.status) {
    confirmingStatus.value = action.status
    return
  }
  confirmingStatus.value = null
  try {
    const updated = await store.changeStatus(detail.value.id, action.status)
    if (updated) detail.value = toTripView(updated)
    toast.success(`Trip ${detail.value.code} is now ${detail.value.statusLabel.toLowerCase()}`)
  } catch (err) {
    // 409: forbidden move or the trip changed meanwhile.
    toast.error(err?.message || 'Unable to change trip status')
  }
}

function requestEdit() {
  emit('edit', detail.value?.raw ?? props.trip?.raw)
  isOpen.value = false
}

function requestDelete() {
  emit('delete', detail.value)
  isOpen.value = false
}
</script>

<template>
  <BaseModal v-model="isOpen" title="Trip Details" size="lg">
    <div v-if="view" class="space-y-6 p-6">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Trip</p>
          <h2 class="mt-1 text-xl font-bold text-zinc-900">{{ view.code }}</h2>
          <p class="mt-1 text-sm text-gray-600">{{ view.route }}</p>
        </div>
        <span class="rounded-full px-3 py-1 text-xs font-bold uppercase" :class="statusClass">
          {{ view.statusLabel }}
        </span>
      </header>

      <BaseEmptyState v-if="loadError" :title="loadError" tone="danger" class="text-left" />
      <p v-else-if="loading" role="status" class="text-sm font-semibold text-sky-700">
        Loading latest trip data...
      </p>

      <dl class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg bg-zinc-50 p-4">
          <dt class="text-xs font-semibold text-gray-500 uppercase">Departure</dt>
          <dd class="mt-1 text-sm font-medium text-zinc-900">
            {{ formatDateTime(view.departureTime) }}
          </dd>
        </div>
        <div class="rounded-lg bg-zinc-50 p-4">
          <dt class="text-xs font-semibold text-gray-500 uppercase">Arrival</dt>
          <dd class="mt-1 text-sm font-medium text-zinc-900">
            {{ formatDateTime(view.arrivalTime) }}
          </dd>
        </div>
        <div class="rounded-lg bg-zinc-50 p-4">
          <dt class="text-xs font-semibold text-gray-500 uppercase">Bus</dt>
          <dd class="mt-1 text-sm font-medium text-zinc-900">{{ view.bus }}</dd>
        </div>
        <div class="rounded-lg bg-zinc-50 p-4">
          <dt class="text-xs font-semibold text-gray-500 uppercase">Driver</dt>
          <dd class="mt-1 text-sm font-medium text-zinc-900">{{ view.operator }}</dd>
        </div>
        <div class="rounded-lg bg-zinc-50 p-4">
          <dt class="text-xs font-semibold text-gray-500 uppercase">Booked seats</dt>
          <dd class="mt-1 text-sm font-medium text-zinc-900">
            {{ view.booked }} / {{ view.capacity }} seats ({{ view.loadFactor }}%)
          </dd>
        </div>
        <div class="rounded-lg bg-zinc-50 p-4">
          <dt class="text-xs font-semibold text-gray-500 uppercase">Revenue (paid tickets)</dt>
          <dd class="mt-1 text-sm font-medium text-zinc-900">{{ view.revenueLabel }}</dd>
        </div>
      </dl>

      <div
        v-if="confirmingStatus === 'CANCELLED'"
        role="alert"
        class="rounded-lg bg-rose-50 p-4 text-sm text-rose-800"
        data-testid="cancel-confirm"
      >
        Cancelling this trip also cancels its {{ view.booked }} booked ticket(s). This cannot be
        undone. Press <strong>Cancel trip</strong> again to confirm.
      </div>

      <footer class="flex flex-wrap justify-end gap-3">
        <BaseButton
          v-if="canDelete"
          unstyled
          html-type="button"
          :disabled="busy"
          class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          @click="requestDelete"
        >
          <UIcon name="i-heroicons-trash" class="size-4" />
          Delete
        </BaseButton>
        <BaseButton
          v-if="canEdit"
          type="outline"
          html-type="button"
          :disabled="busy || !detail"
          @click="requestEdit"
        >
          Edit
        </BaseButton>
        <BaseButton
          v-for="action in actions"
          :key="action.status"
          html-type="button"
          :type="action.confirm ? 'outline' : 'primary'"
          :loading="busy"
          :disabled="!detail"
          @click="runAction(action)"
        >
          <template #icon-left>
            <UIcon :name="action.icon" class="size-4" />
          </template>
          {{ action.label }}
        </BaseButton>
        <BaseButton html-type="button" type="secondary" :disabled="busy" @click="isOpen = false">
          Close
        </BaseButton>
      </footer>
    </div>
  </BaseModal>
</template>
