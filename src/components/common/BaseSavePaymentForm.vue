<script setup>
import { ref, watch, onMounted } from 'vue'
import BaseButton from '@/components/elements/BaseButton.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  seatNumber: { type: Number, default: 0 },
  seatLabel: { type: String, default: '' },
  seatDetail: { type: String, default: '' },
  seatPrice: { type: String, default: '' },
  subtotal: { type: String, default: '' },
  initialValues: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const fullName = ref('')
const phone = ref('')
const email = ref('')

const populate = (vals) => {
  fullName.value = vals.fullName ?? ''
  phone.value = vals.phone ?? ''
  email.value = vals.email ?? ''
}

onMounted(() => populate(props.initialValues))
watch(() => props.initialValues, populate, { deep: true })

const handleSubmit = () => {
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
    class="relative inline-flex flex-col items-start justify-start gap-6 self-stretch rounded-[32px] bg-white p-8 shadow-[0px_20px_25px_-5px_rgba(27,27,28,0.05),0px_8px_10px_-6px_rgba(27,27,28,0.05)] outline outline-1 outline-offset-[-1px] outline-slate-300/10"
  >
    <!-- Heading -->
    <div class="inline-flex items-center justify-start gap-2 self-stretch">
      <span class="font-['Inter'] text-xl leading-7 font-bold text-zinc-900">Your Selection</span>
      <span class="size-2 rounded-full bg-emerald-500"></span>
    </div>

    <!-- Seat summary -->
    <div class="inline-flex items-center justify-between self-stretch rounded-md bg-blue-200 p-4">
      <div class="flex items-center justify-start gap-3">
        <div class="flex size-12 items-center justify-center rounded-[32px] bg-sky-700 py-2.5">
          <span class="text-center font-['Inter'] text-lg leading-7 font-bold text-white">{{
            seatNumber
          }}</span>
        </div>
        <div class="inline-flex flex-col items-start justify-start">
          <span class="font-['Inter'] text-sm leading-5 font-bold text-slate-900">{{
            seatLabel
          }}</span>
          <span class="font-['Inter'] text-xs leading-4 font-normal text-sky-900">{{
            seatDetail
          }}</span>
        </div>
      </div>
      <span class="font-['Inter'] text-base leading-6 font-bold text-sky-700">{{ seatPrice }}</span>
    </div>

    <!-- Checkout form -->
    <form
      class="flex flex-col items-start justify-start gap-5 self-stretch pt-2"
      @submit.prevent="handleSubmit"
    >
      <!-- Full name -->
      <div class="flex flex-col items-start justify-start gap-2 self-stretch">
        <label
          for="save-payment-full-name"
          class="self-stretch font-['Inter'] text-xs leading-4 font-normal tracking-wider text-gray-700 uppercase"
        >
          Full Name
        </label>
        <input
          id="save-payment-full-name"
          v-model="fullName"
          type="text"
          placeholder="John Doe"
          class="w-full self-stretch rounded-md bg-stone-100 px-4 py-3.5 font-['Inter'] text-base font-normal text-gray-500 outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <!-- Phone number -->
      <div class="flex flex-col items-start justify-start gap-2 self-stretch">
        <label
          for="save-payment-phone"
          class="self-stretch font-['Inter'] text-xs leading-4 font-normal tracking-wider text-gray-700 uppercase"
        >
          Phone Number
        </label>
        <input
          id="save-payment-phone"
          v-model="phone"
          type="tel"
          placeholder="+84 000 000 000"
          class="w-full self-stretch rounded-md bg-stone-100 px-4 py-3.5 font-['Inter'] text-base font-normal text-gray-500 outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <!-- Email address -->
      <div class="flex flex-col items-start justify-start gap-2 self-stretch">
        <label
          for="save-payment-email"
          class="self-stretch font-['Inter'] text-xs leading-4 font-normal tracking-wider text-gray-700 uppercase"
        >
          Email Address
        </label>
        <input
          id="save-payment-email"
          v-model="email"
          type="email"
          placeholder="john@example.com"
          class="w-full self-stretch rounded-md bg-stone-100 px-4 py-3.5 font-['Inter'] text-base font-normal text-gray-500 outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <!-- Divider + summary + CTA -->
      <div
        class="flex w-full flex-col items-start justify-start gap-4 self-stretch border-t border-slate-300/10 pt-8"
      >
        <!-- Subtotal -->
        <div class="inline-flex items-center justify-between self-stretch pb-2">
          <span class="font-['Inter'] text-base leading-6 font-normal text-gray-700">Subtotal</span>
          <span class="font-['Inter'] text-base leading-6 font-bold text-zinc-900">{{
            subtotal
          }}</span>
        </div>

        <!-- Submit — BaseButton receives gradient class via $attrs passthrough -->
        <BaseButton
          html-type="submit"
          :loading="loading"
          :disabled="loading"
          class="self-stretch rounded-full bg-gradient-to-r from-sky-700 to-violet-500 py-4 shadow-[0px_10px_15px_-3px_rgba(0,101,145,0.20),0px_4px_6px_-4px_rgba(0,101,145,0.20)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? 'Processing…' : 'Continue to Payment' }}
        </BaseButton>

        <!-- Disclaimer -->
        <div class="flex justify-center self-stretch px-6">
          <p class="text-center font-['Inter'] text-xs leading-4 font-normal text-gray-700">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </form>
  </div>
</template>
