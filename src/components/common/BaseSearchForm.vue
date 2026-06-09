<script setup>
import { ref, onMounted, watch } from 'vue'
import BaseInput from '@/components/elements/BaseInput.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import IconCalendar from '@/assets/icons/IconCalendar.vue'

defineOptions({ inheritAttrs: false })

/**
 * @typedef {Object} SearchPayload
 * @property {string} from
 * @property {string} to
 * @property {string} date
 * @property {number} passengers
 */

const props = defineProps({
  loading: { type: Boolean, default: false },
  initialValues: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['search', 'reset'])

const from = ref('')
const to = ref('')
const date = ref('')
const passengers = ref(1)

function applyInitialValues(values) {
  if (values.from !== undefined) from.value = values.from
  if (values.to !== undefined) to.value = values.to
  if (values.date !== undefined) date.value = values.date
  if (values.passengers !== undefined) passengers.value = values.passengers
}

onMounted(() => applyInitialValues(props.initialValues))
watch(() => props.initialValues, applyInitialValues, { deep: true })

function handleSearch() {
  emit('search', {
    from: from.value,
    to: to.value,
    date: date.value,
    passengers: passengers.value,
  })
}

function handleReset() {
  from.value = ''
  to.value = ''
  date.value = ''
  passengers.value = 1
  emit('reset')
}
</script>

<template>
  <div v-bind="$attrs" class="inline-flex w-full max-w-4xl flex-col items-start justify-start px-6">
    <div
      class="relative flex flex-col items-start justify-start gap-8 self-stretch rounded-4xl bg-white/70 p-8 shadow-[0px_25px_50px_-12px_rgba(27,27,28,0.10)] outline-1 -outline-offset-1 outline-white/20 backdrop-blur-md"
    >
      <!-- Heading -->
      <h2 class="self-stretch text-3xl leading-9 font-normal text-sky-950">Where to next?</h2>

      <!-- Form fields -->
      <form
        class="flex flex-row flex-wrap items-end gap-5 self-stretch"
        @submit.prevent="handleSearch"
      >
        <!-- FROM field -->
        <div class="relative min-w-32 flex-1">
          <BaseInput
            v-model="from"
            placeholder="Hà Nội"
            variant="none"
            :disabled="loading"
            :ui="{ base: 'bg-stone-100 py-3.5 placeholder:text-slate-300' }"
          >
            <template #leading>
              <UIcon name="i-heroicons-map-pin" class="size-4 text-gray-500" />
            </template>
          </BaseInput>
          <div class="absolute -top-2.5 left-4 inline-flex bg-white px-2">
            <span class="text-[10px] leading-4 font-bold tracking-wide text-sky-700 uppercase"
              >FROM</span
            >
          </div>
        </div>

        <!-- TO field -->
        <div class="relative min-w-32 flex-1">
          <BaseInput
            v-model="to"
            placeholder="Hải Phòng"
            variant="none"
            :disabled="loading"
            :ui="{ base: 'bg-stone-100 py-3.5 placeholder:text-slate-300' }"
          >
            <template #leading>
              <UIcon name="i-heroicons-map-pin" class="size-4 text-gray-500" />
            </template>
          </BaseInput>
          <div class="absolute -top-2.5 left-4 inline-flex bg-white px-2">
            <span class="text-[10px] leading-4 font-bold tracking-wide text-sky-700 uppercase"
              >TO</span
            >
          </div>
        </div>

        <!-- DATE field -->
        <div class="relative min-w-32 flex-1">
          <BaseInput
            v-model="date"
            type="date"
            variant="none"
            :disabled="loading"
            :ui="{ base: 'bg-stone-100 py-3 placeholder:text-slate-300' }"
          >
            <template #leading>
              <IconCalendar class="size-4 text-gray-500" />
            </template>
          </BaseInput>
          <div class="absolute -top-2.5 left-4 inline-flex bg-white px-2">
            <span class="text-[10px] leading-4 font-bold tracking-wide text-sky-700 uppercase"
              >DATE</span
            >
          </div>
        </div>

        <!-- PASSENGERS field -->
        <div class="relative min-w-32 flex-1">
          <BaseInput
            v-model="passengers"
            type="number"
            placeholder="1"
            variant="none"
            :disabled="loading"
            :ui="{ base: 'bg-stone-100 py-3.5 placeholder:text-slate-300' }"
          >
            <template #leading>
              <UIcon name="i-heroicons-users" class="size-4 text-gray-500" />
            </template>
          </BaseInput>
          <div class="absolute -top-2.5 left-4 inline-flex bg-white px-2">
            <span class="text-[10px] leading-4 font-bold tracking-wide text-sky-700 uppercase"
              >PASSENGERS</span
            >
          </div>
        </div>

        <!-- Submit button -->
        <BaseButton html-type="submit" label="Search Trips" :loading="loading" size="lg">
          <template #icon-left>
            <UIcon name="i-heroicons-magnifying-glass" class="size-4" />
          </template>
        </BaseButton>
      </form>
    </div>
  </div>
</template>
