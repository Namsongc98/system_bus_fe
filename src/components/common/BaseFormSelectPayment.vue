<script setup>
/**
 * @typedef {Object} SeatInfo
 * @property {string|number} number   - Seat number label (e.g. 15)
 * @property {string}        label    - Seat name (e.g. "Seat 15")
 * @property {string}        detail   - Seat detail (e.g. "Lower Deck • Aisle Side")
 * @property {string}        price    - Formatted price string (e.g. "₫150,000")
 */

/**
 * @typedef {Object} Props
 * @property {SeatInfo} seat          - Selected seat information
 * @property {string}   subtotal      - Formatted subtotal string
 * @property {boolean}  [loading]     - Loading state for submit button
 */

import { ref, watch, onMounted } from 'vue'
import BaseInput from '@/components/elements/BaseInput.vue'
import BaseButton from '@/components/elements/BaseButton.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  seat: {
    type: Object,
    default: () => ({ number: '', label: '', detail: '', price: '' }),
  },
  subtotal: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  initialValues: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit'])

const fullName = ref('')
const phone = ref('')
const email = ref('')

function applyInitialValues(values) {
  if (values.fullName !== undefined) fullName.value = values.fullName
  if (values.phone !== undefined) phone.value = values.phone
  if (values.email !== undefined) email.value = values.email
}

onMounted(() => applyInitialValues(props.initialValues))
watch(() => props.initialValues, applyInitialValues, { deep: true })

function handleSubmit() {
  emit('submit', {
    fullName: fullName.value,
    phone: phone.value,
    email: email.value,
  })
}
</script>

<template>
  <div
    v-bind="$attrs"
    class="relative inline-flex flex-col items-start justify-start gap-6 self-stretch rounded-4xl bg-white p-8 shadow-[0px_8px_10px_-6px_rgba(27,27,28,0.05),0px_20px_25px_-5px_rgba(27,27,28,0.05)] outline-1 -outline-offset-1 outline-slate-300/10"
  >
    <!-- Heading -->
    <div class="inline-flex items-center justify-start gap-2 self-stretch">
      <h2 class="text-xl leading-7 font-bold text-zinc-900">Your Selection</h2>
      <span class="size-2 rounded-full bg-emerald-500"></span>
    </div>

    <!-- Seat summary card -->
    <div class="inline-flex items-center justify-between self-stretch rounded-md bg-blue-200 p-4">
      <div class="flex items-center justify-start gap-3">
        <div class="flex size-12 items-center justify-center rounded-4xl bg-sky-700 py-2.5">
          <span class="text-center text-lg leading-7 font-bold text-white">{{ seat.number }}</span>
        </div>
        <div class="inline-flex flex-col items-start justify-start">
          <span class="text-sm leading-5 font-bold text-slate-900">{{ seat.label }}</span>
          <span class="text-xs leading-4 font-normal text-sky-900">{{ seat.detail }}</span>
        </div>
      </div>
      <span class="text-base leading-6 font-bold text-sky-700">{{ seat.price }}</span>
    </div>

    <!-- Checkout form -->
    <form
      class="flex w-full flex-col items-start justify-start gap-5 pt-2"
      @submit.prevent="handleSubmit"
    >
      <!-- Full Name -->
      <div class="flex w-full flex-col gap-2">
        <label
          class="text-xs leading-4 font-normal tracking-wider text-gray-700 uppercase"
          for="pay-fullname"
        >
          FULL NAME
        </label>
        <BaseInput
          id="pay-fullname"
          v-model="fullName"
          placeholder="John Doe"
          variant="none"
          required
          :ui="{ base: 'bg-stone-100 rounded-md py-3.5 placeholder:text-gray-500' }"
        />
      </div>

      <!-- Phone Number -->
      <div class="flex w-full flex-col gap-2">
        <label
          class="text-xs leading-4 font-normal tracking-wider text-gray-700 uppercase"
          for="pay-phone"
        >
          PHONE NUMBER
        </label>
        <BaseInput
          id="pay-phone"
          v-model="phone"
          type="tel"
          placeholder="+84 000 000 000"
          variant="none"
          required
          :ui="{ base: 'bg-stone-100 rounded-md py-3.5 placeholder:text-gray-500' }"
        />
      </div>

      <!-- Email Address -->
      <div class="flex w-full flex-col gap-2">
        <label
          class="text-xs leading-4 font-normal tracking-wider text-gray-700 uppercase"
          for="pay-email"
        >
          EMAIL ADDRESS
        </label>
        <BaseInput
          id="pay-email"
          v-model="email"
          type="email"
          placeholder="john@example.com"
          variant="none"
          required
          :ui="{ base: 'bg-stone-100 rounded-md py-3.5 placeholder:text-gray-500' }"
        />
      </div>

      <!-- Divider + Summary + Submit -->
      <div
        class="flex w-full flex-col items-start justify-start gap-4 border-t border-slate-300/10 pt-8"
      >
        <!-- Subtotal row -->
        <div class="inline-flex w-full items-center justify-between pb-2">
          <span class="text-base leading-6 font-normal text-gray-700">Subtotal</span>
          <span class="text-base leading-6 font-bold text-zinc-900">{{ subtotal }}</span>
        </div>

        <!-- Submit button -->
        <BaseButton
          html-type="submit"
          :loading="loading"
          block
          class="rounded-full! bg-linear-to-r! from-sky-700! to-violet-500! py-4! text-lg! font-bold! text-white! shadow-[0px_4px_6px_-4px_rgba(0,101,145,0.20),0px_10px_15px_-3px_rgba(0,101,145,0.20)]"
        >
          Continue to Payment
        </BaseButton>

        <!-- Legal note -->
        <p class="w-full px-6 text-center text-xs leading-4 font-normal text-gray-700">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </form>
  </div>
</template>
