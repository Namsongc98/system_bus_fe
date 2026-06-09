<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseInput from '@/components/elements/BaseInput.vue'
import { useToast } from '@/composables/useToast'
import { routeService } from '@/services/busRouteService'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  route: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'close', 'deleted'])

const toast = useToast()
const deleting = ref(false)
const confirmation = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    if (!value) emit('close')
  },
})

const routeId = computed(() => props.route?.id ?? props.route?._id ?? props.route?.routeId ?? null)

const routeName = computed(() => {
  const fallback =
    props.route?.origin && props.route?.destination
      ? `${props.route.origin} -> ${props.route.destination}`
      : 'this route'

  return props.route?.name || props.route?.routeName || props.route?.subtitle || fallback
})

const activeTripCount = computed(
  () => props.route?.activeTrips ?? props.route?.activeTripCount ?? props.route?.tripsCount ?? null
)

const impactText = computed(() => {
  if (activeTripCount.value === null || activeTripCount.value === undefined) {
    return 'Linked schedules and bookings may be affected.'
  }

  return `${activeTripCount.value} active trips will be cancelled`
})

const isConfirmed = computed(() => confirmation.value === routeName.value)
const canDelete = computed(() => isConfirmed.value && !!routeId.value && !deleting.value)

watch(
  () => props.modelValue,
  (open) => {
    if (!open) confirmation.value = ''
  }
)

function closeModal() {
  if (deleting.value) return
  isOpen.value = false
}

async function deleteRoute() {
  if (!canDelete.value) return

  deleting.value = true

  try {
    await routeService.remove(routeId.value)
    toast.success('Route deleted successfully')
    confirmation.value = ''
    isOpen.value = false
    emit('deleted', props.route)
  } catch (err) {
    toast.error(err?.message || 'Unable to delete route')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <BaseModal v-model="isOpen" size="md">
    <form
      class="flex flex-col overflow-hidden rounded-[32px] bg-white shadow-[0px_24px_80px_rgba(15,23,42,0.16)]"
      @submit.prevent="deleteRoute"
    >
      <header class="flex items-start gap-4 px-6 pt-6 pb-5 md:px-8 md:pt-8">
        <div
          class="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"
        >
          <UIcon name="i-heroicons-trash" class="size-5" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-xl leading-7 font-bold text-zinc-900">Delete Route?</h2>
          <p class="mt-1 text-sm leading-5 text-gray-700">
            This action cannot be undone. All schedules and future bookings linked to this path will
            be permanently terminated.
          </p>
        </div>
        <BaseButton
          unstyled
          html-type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-700 transition hover:bg-stone-100"
          aria-label="Close delete route modal"
          :disabled="deleting"
          @click="closeModal"
        >
          <UIcon name="i-heroicons-x-mark" class="size-5" />
        </BaseButton>
      </header>

      <div class="flex flex-col gap-5 px-6 pb-6 md:px-8">
        <section class="rounded-3xl border border-red-100 bg-red-50/70 p-5">
          <p class="text-xs leading-4 font-bold tracking-wider text-red-700 uppercase">
            Affected Route
          </p>
          <p class="mt-2 truncate text-lg leading-7 font-extrabold text-zinc-900">
            {{ routeName }}
          </p>
          <p class="mt-1 text-sm leading-5 text-red-700">{{ impactText }}</p>
        </section>

        <div class="flex flex-col gap-2">
          <div class="px-1">
            <p class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase">
              Confirmation Required
            </p>
          </div>
          <BaseInput
            id="delete-route-confirmation"
            v-model="confirmation"
            placeholder="Type route name here"
            :disabled="deleting"
            :ui="{ base: 'bg-stone-100 px-4 py-3' }"
            aria-label="Type route name to confirm deletion"
          />
          <p class="px-1 text-xs leading-4 text-gray-500">
            Type <span class="font-semibold text-zinc-900">{{ routeName }}</span> to proceed.
          </p>
        </div>

        <div
          class="rounded-2xl bg-slate-50 px-4 py-3 text-[10px] font-bold tracking-wider text-gray-500 uppercase"
        >
          Fluid Voyager • Security Protocol 4.2
        </div>
      </div>

      <footer
        class="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end md:px-8"
      >
        <BaseButton type="secondary" html-type="button" :disabled="deleting" @click="closeModal">
          Cancel
        </BaseButton>
        <BaseButton
          unstyled
          html-type="submit"
          :disabled="!canDelete"
          :loading="deleting"
          class="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-2 text-base font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UIcon name="i-heroicons-trash" class="size-4" />
          Delete Route
        </BaseButton>
      </footer>
    </form>
  </BaseModal>
</template>
