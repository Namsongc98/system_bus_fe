<script setup>
import { useRouter } from 'vue-router'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import { ROUTE_NAMES } from '@/constants/routes'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  ticketId: { type: String, default: '' },
  qrCodeUrl: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'download-receipt'])

const router = useRouter()

function close() {
  emit('update:modelValue', false)
}

function viewTickets() {
  close()
  router.push({ name: ROUTE_NAMES.PROFILE })
}

function downloadReceipt() {
  emit('download-receipt')
}
</script>

<template>
  <BaseModal :model-value="modelValue" size="sm" @update:model-value="close">
    <!-- Card -->
    <div
      class="flex w-full flex-col overflow-hidden rounded-[32px] bg-white shadow-[0px_25px_50px_-12px_rgba(27,27,28,0.10)]"
    >
      <!-- Accent bar -->
      <div class="h-2 w-full bg-gradient-to-r from-sky-700 to-violet-500"></div>

      <!-- Body -->
      <div class="flex flex-col items-center px-8 py-6">
        <!-- Checkmark icon -->
        <div class="mb-4">
          <div class="flex size-20 items-center justify-center rounded-full bg-emerald-300">
            <UIcon name="i-heroicons-check" class="size-7 text-emerald-800" />
          </div>
        </div>

        <!-- Heading -->
        <h2 class="mb-1 text-center font-['Inter'] text-2xl leading-8 font-black text-zinc-900">
          Booking Confirmed!
        </h2>

        <!-- Sub-text -->
        <p
          class="mb-6 max-w-72 text-center font-['Inter'] text-sm leading-5 font-normal text-gray-700"
        >
          Your digital ticket is ready. Please present the QR code to the driver upon boarding.
        </p>

        <!-- QR Code block -->
        <div class="mb-6 flex flex-col items-center gap-3 rounded-[24px] bg-stone-100 p-4">
          <div
            class="flex size-36 items-center justify-center overflow-hidden rounded-sm bg-white shadow-sm"
          >
            <img
              v-if="qrCodeUrl"
              :src="qrCodeUrl"
              alt="Booking QR code"
              class="size-full object-contain"
            />
            <div v-else class="size-full bg-zinc-900 opacity-20"></div>
          </div>

          <div class="flex flex-col items-center gap-0.5">
            <span
              class="text-center font-['Inter'] text-[10px] leading-4 font-normal tracking-widest text-gray-700 uppercase"
            >
              TICKET ID
            </span>
            <span
              class="text-center font-['Inter'] text-sm leading-5 font-bold tracking-wider text-zinc-900"
            >
              {{ ticketId || 'N/A' }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex w-full flex-col gap-4">
          <BaseButton
            label="View My Tickets"
            type="primary"
            size="lg"
            :block="true"
            @click="viewTickets"
          />
          <BaseButton
            label="Download Receipt"
            type="outline"
            size="md"
            :block="true"
            @click="downloadReceipt"
          />
        </div>
      </div>
    </div>
  </BaseModal>
</template>
