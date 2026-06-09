<script setup>
import { computed, reactive, ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseInput from '@/components/elements/BaseInput.vue'
import { useToast } from '@/composables/useToast'
import { busService } from '@/services/busRouteService'

const BUS_STATUS_OPTIONS = [
  { label: 'Active', value: 'AVAILABLE' },
  { label: 'Inactive', value: 'IN_USE' },
  { label: 'Maintenance', value: 'MAINTENANCE' },
]

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'close', 'created'])

const toast = useToast()
const creating = ref(false)
const errors = reactive({})
const form = reactive({
  busNumber: '',
  licensePlate: '',
  capacity: 42,
  status: 'AVAILABLE',
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    if (!value) emit('close')
  },
})

const statusOption = computed(
  () => BUS_STATUS_OPTIONS.find((option) => option.value === form.status) || BUS_STATUS_OPTIONS[0]
)
const capacityNumber = computed(() => Number(form.capacity))
const previewCapacity = computed(() =>
  Number.isFinite(capacityNumber.value) && capacityNumber.value > 0 ? capacityNumber.value : 0
)
const previewRows = computed(() => {
  const seats = Math.min(Math.max(Math.ceil(previewCapacity.value / 4), 3), 12)

  return Array.from({ length: seats }, (_, index) => ({
    id: index,
    active: index < Math.ceil(previewCapacity.value / 4),
  }))
})

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    delete errors[key]
  })
}

function validateForm() {
  clearErrors()

  if (!form.busNumber.trim()) errors.busNumber = 'Enter a bus number'
  if (!form.licensePlate.trim()) errors.licensePlate = 'Enter a license plate'

  const capacity = Number(form.capacity)
  if (!form.capacity) {
    errors.capacity = 'Enter seat capacity'
  } else if (!Number.isFinite(capacity) || capacity <= 0) {
    errors.capacity = 'Capacity must be greater than 0'
  }

  if (!BUS_STATUS_OPTIONS.some((option) => option.value === form.status)) {
    errors.status = 'Select an operational status'
  }

  return !Object.keys(errors).length
}

function resetForm() {
  form.busNumber = ''
  form.licensePlate = ''
  form.capacity = 42
  form.status = 'AVAILABLE'
  clearErrors()
}

function closeModal() {
  isOpen.value = false
}

async function submitBus() {
  if (!validateForm()) return

  creating.value = true

  try {
    const response = await busService.create({
      busNumber: form.busNumber.trim(),
      licensePlate: form.licensePlate.trim(),
      capacity: Number(form.capacity),
      status: form.status,
    })

    const createdBus = response?.data?.data ?? response?.data ?? response
    toast.success('Bus created successfully')
    resetForm()
    isOpen.value = false
    emit('created', createdBus)
  } catch (err) {
    toast.error(err?.message || 'Unable to create bus')
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <BaseModal v-model="isOpen" size="lg">
    <form
      class="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-[32px] bg-white/90 shadow-[0px_12px_64px_0px_rgba(27,27,28,0.06)] outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-md"
      @submit.prevent="submitBus"
    >
      <header
        class="flex items-center justify-between gap-4 px-6 pt-6 pb-5 md:px-8 md:pt-8 md:pb-6"
      >
        <div class="flex min-w-0 items-center gap-4">
          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sky-700"
          >
            <UIcon name="i-heroicons-truck" class="size-6" />
          </div>
          <div class="min-w-0">
            <h2 class="text-xl leading-6 font-bold text-zinc-900">Add New Bus</h2>
            <p class="mt-1 text-sm leading-5 text-gray-700">
              Register a new vehicle to the Fluid Voyager fleet
            </p>
          </div>
        </div>
        <BaseButton
          unstyled
          html-type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-700 transition hover:bg-stone-100"
          aria-label="Close create bus modal"
          @click="closeModal"
        >
          <UIcon name="i-heroicons-x-mark" class="size-5" />
        </BaseButton>
      </header>

      <div class="flex flex-col gap-8 overflow-y-auto px-6 pb-6 md:px-8">
        <section
          class="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-white to-stone-100 p-5 outline outline-1 outline-offset-[-1px] outline-white/50 md:p-6"
        >
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div
              class="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white shadow-sm outline outline-1 outline-offset-[-1px] outline-slate-300/10"
            >
              <UIcon name="i-heroicons-truck" class="size-12 text-sky-700/60" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] leading-4 font-bold tracking-wide text-gray-700 uppercase">
                Plate Number
              </p>
              <p class="truncate text-2xl leading-8 font-black text-zinc-900">
                {{ form.licensePlate || 'FV-0000-XX' }}
              </p>
              <div class="mt-1 flex items-center gap-2 text-sm leading-5 font-medium text-gray-700">
                <UIcon name="i-heroicons-users" class="size-4 text-sky-700" />
                <span>{{ previewCapacity || 0 }} Seats Configured</span>
              </div>
            </div>
          </div>
          <span
            class="absolute top-5 right-5 rounded-full px-3 py-1 text-xs leading-4 font-bold tracking-wider uppercase"
            :class="
              form.status === 'AVAILABLE'
                ? 'bg-emerald-500/10 text-emerald-600'
                : form.status === 'IN_USE'
                  ? 'bg-slate-500/10 text-slate-600'
                  : 'bg-amber-500/10 text-amber-700'
            "
          >
            {{ statusOption.label }}
          </span>
        </section>

        <div class="flex flex-col gap-6">
          <BaseInput
            v-model="form.busNumber"
            label="Bus Number"
            placeholder="BUS-002"
            :disabled="creating"
            :error="errors.busNumber"
            :ui="{ base: 'bg-stone-100 px-4 py-3.5' }"
          >
            <template #trailing>
              <UIcon name="i-heroicons-hashtag" class="size-4 text-slate-300" />
            </template>
          </BaseInput>

          <BaseInput
            v-model="form.licensePlate"
            label="Plate Number"
            placeholder="FV-0000-XX"
            :disabled="creating"
            :error="errors.licensePlate"
            :ui="{ base: 'bg-stone-100 px-4 py-3.5 font-mono' }"
          >
            <template #trailing>
              <UIcon name="i-heroicons-identification" class="size-5 text-slate-300" />
            </template>
          </BaseInput>

          <div class="flex flex-col gap-2">
            <span class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase">
              Operational Status
            </span>
            <div class="grid grid-cols-3 gap-1 bg-stone-200 p-1">
              <BaseButton
                v-for="option in BUS_STATUS_OPTIONS"
                :key="option.value"
                unstyled
                html-type="button"
                :disabled="creating"
                class="rounded-xl px-3 py-2.5 text-center text-sm leading-5 transition disabled:opacity-60"
                :class="
                  form.status === option.value
                    ? 'bg-white font-bold text-sky-700 shadow-sm'
                    : 'font-medium text-gray-700 hover:text-zinc-900'
                "
                @click="form.status = option.value"
              >
                {{ option.label }}
              </BaseButton>
            </div>
            <span v-if="errors.status" class="text-xs text-red-500">{{ errors.status }}</span>
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex items-end justify-between gap-4 px-1">
              <span class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase">
                Seat Capacity
              </span>
              <p class="text-sky-700">
                <span class="text-2xl leading-8 font-black">{{ previewCapacity || 0 }}</span>
                <span class="ml-1 text-xs leading-4 font-medium text-gray-700 uppercase">PAX</span>
              </p>
            </div>
            <BaseInput
              v-model="form.capacity"
              type="number"
              placeholder="42"
              :disabled="creating"
              :error="errors.capacity"
              :ui="{ base: 'bg-stone-100 px-4 py-3.5' }"
            >
              <template #trailing>
                <span class="text-xs font-bold text-gray-500">Seats</span>
              </template>
            </BaseInput>

            <div class="flex flex-col gap-3 bg-stone-100 p-4">
              <p
                class="text-center text-[10px] leading-4 font-bold tracking-wide text-gray-700 uppercase"
              >
                Layout Preview
              </p>
              <div class="grid grid-cols-4 gap-2 px-6">
                <span
                  v-for="row in previewRows"
                  :key="row.id"
                  class="h-2 rounded-sm"
                  :class="row.active ? 'bg-sky-700 shadow-sm' : 'bg-sky-700/40'"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer
        class="flex flex-col-reverse gap-3 px-6 pt-4 pb-6 sm:flex-row sm:justify-end md:px-8 md:pb-8"
      >
        <BaseButton type="secondary" html-type="button" :disabled="creating" @click="closeModal">
          Cancel
        </BaseButton>
        <BaseButton html-type="submit" :loading="creating">
          <template #icon-left>
            <UIcon name="i-heroicons-plus" class="size-4" />
          </template>
          Add Bus
        </BaseButton>
      </footer>
    </form>
  </BaseModal>
</template>
