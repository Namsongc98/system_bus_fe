<script setup>
import { computed, reactive, ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseInput from '@/components/elements/BaseInput.vue'
import StatusToggle from '@/components/common/StatusToggle.vue'
import { useToast } from '@/composables/useToast'
import { routeService } from '@/services/busRouteService'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'close', 'created'])

const toast = useToast()
const creating = ref(false)
const errors = reactive({})
const form = reactive({
  routeName: '',
  startPoint: '',
  endPoint: '',
  distanceKm: '',
  active: true,
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    if (!value) emit('close')
  },
})

const routeNameCount = computed(() => form.routeName.length)
const previewDistance = computed(() => {
  const distance = Number(form.distanceKm)
  return Number.isFinite(distance) && distance > 0 ? `${distance.toFixed(1)} km` : '-- km'
})

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    delete errors[key]
  })
}

function validateForm() {
  clearErrors()

  if (!form.routeName.trim()) errors.routeName = 'Enter a route name'
  if (form.routeName.length > 50) errors.routeName = 'Route name must be 50 characters or less'
  if (!form.startPoint.trim()) errors.startPoint = 'Enter a start point'
  if (!form.endPoint.trim()) errors.endPoint = 'Enter an end point'

  const distance = Number(form.distanceKm)
  if (!form.distanceKm) {
    errors.distanceKm = 'Enter route distance'
  } else if (!Number.isFinite(distance) || distance <= 0) {
    errors.distanceKm = 'Distance must be greater than 0'
  }

  return !Object.keys(errors).length
}

function resetForm() {
  form.routeName = ''
  form.startPoint = ''
  form.endPoint = ''
  form.distanceKm = ''
  form.active = true
  clearErrors()
}

function closeModal() {
  isOpen.value = false
}

async function submitRoute() {
  if (!validateForm()) return

  creating.value = true

  try {
    const response = await routeService.create({
      routeName: form.routeName.trim(),
      startPoint: form.startPoint.trim(),
      endPoint: form.endPoint.trim(),
      distanceKm: Number(form.distanceKm),
      status: form.active ? 'ACTIVE' : 'INACTIVE',
    })

    const createdRoute = response?.data?.data ?? response?.data ?? response
    toast.success('Route created successfully')
    resetForm()
    isOpen.value = false
    emit('created', createdRoute)
  } catch (err) {
    toast.error(err?.message || 'Unable to create route')
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <BaseModal v-model="isOpen" size="lg">
    <form
      class="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-[32px] bg-white/90 shadow-[0px_12px_64px_0px_rgba(27,27,28,0.06)] backdrop-blur-md"
      @submit.prevent="submitRoute"
    >
      <header class="flex items-center gap-4 px-6 pt-6 pb-5 md:px-8 md:pt-8 md:pb-6">
        <div
          class="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-violet-500 text-white shadow-lg"
        >
          <UIcon name="i-heroicons-map" class="size-5" />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-xl leading-7 font-bold text-zinc-900">Create New Route</h2>
          <p class="text-sm leading-5 text-gray-700">
            Define a new transport corridor for the fleet
          </p>
        </div>
        <BaseButton
          unstyled
          html-type="button"
          class="flex size-10 shrink-0 items-center justify-center rounded-full text-gray-700 transition hover:bg-stone-100"
          aria-label="Close create route modal"
          @click="closeModal"
        >
          <UIcon name="i-heroicons-x-mark" class="size-5" />
        </BaseButton>
      </header>

      <div class="flex flex-col gap-6 overflow-y-auto px-6 pt-2 pb-6 md:px-8">
        <div class="flex flex-col gap-2">
          <div class="flex items-end justify-between gap-4 px-1">
            <label
              for="route-name"
              class="text-xs leading-4 font-bold tracking-wider text-gray-700 uppercase"
            >
              Route Name
            </label>
            <span class="text-[10px] leading-4 font-medium text-gray-500">
              {{ routeNameCount }} / 50
            </span>
          </div>
          <BaseInput
            id="route-name"
            v-model="form.routeName"
            placeholder="e.g. Coastal Express Alpha"
            :disabled="creating"
            :error="errors.routeName"
            :ui="{ base: 'rounded-none bg-stone-100 px-4 py-3.5' }"
          />
        </div>

        <section class="flex flex-col gap-4 rounded-[32px] bg-stone-100 p-5 md:p-6">
          <p class="text-xs leading-4 tracking-wider text-gray-700 uppercase">Route Points</p>
          <div class="grid grid-cols-1 items-start gap-4 md:grid-cols-[1fr_auto_1fr]">
            <BaseInput
              v-model="form.startPoint"
              label="Start Point"
              placeholder="Origin Terminal"
              :disabled="creating"
              :error="errors.startPoint"
              :ui="{ base: 'bg-white px-4 py-3' }"
            >
              <template #leading>
                <UIcon name="i-heroicons-map-pin" class="size-4 text-sky-700" />
              </template>
            </BaseInput>

            <div class="hidden pt-9 md:flex">
              <UIcon name="i-heroicons-arrow-right" class="size-4 text-slate-300" />
            </div>

            <BaseInput
              v-model="form.endPoint"
              label="End Point"
              placeholder="Destination Terminal"
              :disabled="creating"
              :error="errors.endPoint"
              :ui="{ base: 'bg-white px-4 py-3' }"
            >
              <template #leading>
                <UIcon name="i-heroicons-flag" class="size-4 text-violet-700" />
              </template>
            </BaseInput>
          </div>
        </section>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BaseInput
            v-model="form.distanceKm"
            type="number"
            label="Distance"
            placeholder="0.0"
            :disabled="creating"
            :error="errors.distanceKm"
            :ui="{ base: 'bg-stone-100 px-4 py-3' }"
          >
            <template #trailing>
              <span class="text-xs font-bold text-gray-500">KM</span>
            </template>
          </BaseInput>

          <StatusToggle v-model="form.active" label="Route Status" :disabled="creating" />
        </div>

        <section
          class="relative overflow-hidden rounded-[32px] outline outline-1 outline-offset-[-1px] outline-slate-300/20"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-violet-500/10"></div>
          <div
            class="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex min-w-0 items-center gap-4">
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-sky-700 shadow-sm"
              >
                <UIcon name="i-heroicons-map" class="size-5" />
              </div>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-xs leading-4 font-bold text-zinc-900">Route Preview</p>
                  <span class="size-1 rounded-full bg-slate-300"></span>
                  <p class="text-[10px] leading-4 font-medium text-gray-700">
                    Automatic Calculation
                  </p>
                </div>
                <div class="mt-1 flex min-w-0 items-center gap-2">
                  <span class="truncate text-sm leading-5 font-medium text-sky-700">
                    {{ form.startPoint || 'Origin' }}
                  </span>
                  <UIcon name="i-heroicons-arrow-right" class="size-3 text-slate-300" />
                  <span class="truncate text-sm leading-5 font-medium text-violet-700">
                    {{ form.endPoint || 'Destination' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="text-left sm:text-right">
              <p class="text-lg leading-7 font-black text-sky-700">{{ previewDistance }}</p>
              <p class="text-[10px] leading-4 font-bold text-gray-500 uppercase">Estimated Path</p>
            </div>
          </div>
        </section>
      </div>

      <footer
        class="flex flex-col-reverse gap-3 border-t border-slate-300/10 px-6 py-5 sm:flex-row sm:justify-end md:px-8"
      >
        <BaseButton type="secondary" html-type="button" :disabled="creating" @click="closeModal">
          Cancel
        </BaseButton>
        <BaseButton html-type="submit" :loading="creating">
          Create Route
          <template #icon-right>
            <UIcon name="i-heroicons-arrow-right" class="size-4" />
          </template>
        </BaseButton>
      </footer>
    </form>
  </BaseModal>
</template>
