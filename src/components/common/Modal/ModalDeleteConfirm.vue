<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseInput from '@/components/elements/BaseInput.vue'
import { useToast } from '@/composables/useToast'

/**
 * ModalDeleteConfirm — type-to-confirm delete dialog shared by every entity
 * (admin-delete-confirmation.md §6). The caller passes the action as `onConfirm`,
 * so this component holds no API knowledge. Matching is case-sensitive.
 */
const ENTITY_LABELS = {
  route: { title: 'Route', noun: 'route' },
  bus: { title: 'Bus', noun: 'bus' },
  trip: { title: 'Trip', noun: 'trip' },
}

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  entityType: {
    type: String,
    required: true,
    validator: (value) => ['route', 'bus', 'trip'].includes(value),
  },
  // The exact text the admin must type (route name, plate number, trip code).
  entityName: { type: String, default: '' },
  // Async delete action; a rejection keeps the modal open and toasts its message.
  onConfirm: { type: Function, required: true },
})

const emit = defineEmits(['update:modelValue', 'close', 'deleted'])

const toast = useToast()
const deleting = ref(false)
const confirmation = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    // Escape / overlay must not close the modal while the delete is in flight.
    if (!value && deleting.value) return
    emit('update:modelValue', value)
    if (!value) emit('close')
  },
})

const labels = computed(() => ENTITY_LABELS[props.entityType])
const isConfirmed = computed(() => !!props.entityName && confirmation.value === props.entityName)
const canDelete = computed(() => isConfirmed.value && !deleting.value)

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

async function confirmDelete() {
  if (!canDelete.value) return

  deleting.value = true

  try {
    await props.onConfirm()
  } catch (err) {
    // 409 (trip still linked, trip history) keeps the modal open with the BE reason.
    toast.error(err?.message || `Unable to delete ${labels.value.noun}`)
    return
  } finally {
    deleting.value = false
  }

  toast.success(`${labels.value.title} deleted successfully`)
  confirmation.value = ''
  isOpen.value = false
  emit('deleted')
}
</script>

<template>
  <BaseModal v-model="isOpen" size="md">
    <form
      class="flex flex-col overflow-hidden rounded-[32px] bg-white shadow-[0px_24px_80px_rgba(15,23,42,0.16)]"
      @submit.prevent="confirmDelete"
    >
      <header class="flex items-start gap-4 px-6 pt-6 pb-5 md:px-8 md:pt-8">
        <div
          class="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"
        >
          <UIcon name="i-heroicons-trash" class="size-5" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-xl leading-7 font-bold text-zinc-900">Delete {{ labels.title }}?</h2>
          <p class="mt-1 text-sm leading-5 text-gray-700">
            This action cannot be undone. A {{ labels.noun }} that is linked to a trip cannot be
            deleted; change its status instead.
          </p>
        </div>
        <BaseButton
          unstyled
          html-type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-700 transition hover:bg-stone-100"
          :aria-label="`Close delete ${labels.noun} modal`"
          :disabled="deleting"
          @click="closeModal"
        >
          <UIcon name="i-heroicons-x-mark" class="size-5" />
        </BaseButton>
      </header>

      <div class="flex flex-col gap-5 px-6 pb-6 md:px-8">
        <section class="rounded-3xl border border-red-100 bg-red-50/70 p-5">
          <p class="text-xs leading-4 font-bold tracking-wider text-red-700 uppercase">
            Affected {{ labels.title }}
          </p>
          <p class="mt-2 truncate text-lg leading-7 font-extrabold text-zinc-900">
            {{ entityName }}
          </p>
        </section>

        <div class="flex flex-col gap-2">
          <div class="px-1">
            <p class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase">
              Confirmation Required
            </p>
          </div>
          <BaseInput
            id="delete-confirmation"
            v-model="confirmation"
            :placeholder="`Type ${labels.noun} name here`"
            :disabled="deleting"
            :ui="{ base: 'bg-stone-100 px-4 py-3' }"
            :aria-label="`Type ${labels.noun} name to confirm deletion`"
          />
          <p class="px-1 text-xs leading-4 text-gray-500">
            Type <span class="font-semibold text-zinc-900">{{ entityName }}</span> to proceed.
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
          Delete {{ labels.title }}
        </BaseButton>
      </footer>
    </form>
  </BaseModal>
</template>
