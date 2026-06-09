<script setup>
import { ref } from 'vue'
import BaseMapCar from '@/components/common/BaseMapCar.vue'
import BaseSavePaymentForm from '@/components/common/BaseSavePaymentForm.vue'
import { SEAT_VIEW_FAKE_SEATS } from '@/constants/user/seatView'
import QRConfirmPopup from '@/pages/user/QRConfirmPopup.vue'

defineOptions({ inheritAttrs: false })

// Local UI state
const isQrModalOpen = ref(false)
</script>

<template>
  <div v-bind="$attrs" class="mx-auto w-full max-w-[1280px] px-8 pt-10 pb-20">
    <div class="grid grid-cols-12 items-start gap-6">
      <!-- ───────────────────────────────────────────
      LEFT SIDE — Bus Seat Map
      BaseMapCar wiring:
        Props : seats — Array<{ id, number, status }>
        Emits : @select(seat) → seatStore.selectSeat(seat)
        TODO  : :seats="seatStore.seats" @select="seatStore.selectSeat"
    ─────────────────────────────────────────── -->
      <!-- col-span-7: BaseMapCar centred within 7 columns -->
      <div class="col-span-7 flex justify-center">
        <!--
        BaseMapCar wiring:
        Props : :seats="SEAT_VIEW_FAKE_SEATS" → TODO: replace with seatStore.seats
        Emits : @select(seat) → TODO: seatStore.selectSeat(seat)
      -->
        <BaseMapCar
          :seats="SEAT_VIEW_FAKE_SEATS"
          @select="
            (seat) => {
              /* TODO: seatStore.selectSeat(seat) */
            }
          "
        />
      </div>

      <!-- ───────────────────────────────────────────
      RIGHT SIDE — Form Panel
    ─────────────────────────────────────────── -->
      <!-- col-span-5: form fills all 5 columns -->
      <div class="col-span-5 flex flex-col items-stretch gap-6">
        <!-- Selection Card + Checkout Form
        BaseSavePaymentForm wiring:
          Props : seatNumber, seatLabel, seatDetail, seatPrice, subtotal,
                  initialValues (fullName, phone, email), loading
          Emits : @submit({ fullName, phone, email }) → open QR modal
          TODO  : bind all seat/user props from store, :loading="isSubmitting"
                  @submit="handleFormSubmit" (sets isQrModalOpen = true)
      -->
        <BaseSavePaymentForm
          :seat-number="0"
          seat-label="Seat 15"
          seat-detail="Lower Deck • Aisle Side"
          seat-price="₫150,000"
          subtotal="₫150,000"
          :initial-values="{}"
          :loading="false"
          class="self-stretch"
          @submit="isQrModalOpen = true"
        />
        <!-- TODO: replace static props above with reactive store bindings:
           :seat-number="seatStore.selectedSeat?.number"
           :seat-label="`Seat ${seatStore.selectedSeat?.number}`"
           :seat-detail="seatStore.selectedSeat?.detail"
           :seat-price="formatters.formatPrice(seatStore.selectedSeat?.price)"
           :subtotal="formatters.formatPrice(bookingStore.subtotal)"
           :initial-values="{ fullName: authStore.user?.fullName, phone: authStore.user?.phone, email: authStore.user?.email }"
           :loading="isSubmitting"
           @submit="handleFormSubmit"
      -->

        <!-- Promo Banner -->
        <div
          class="PromoBanner inline-flex items-center justify-start gap-4 self-stretch rounded-[32px] bg-gradient-to-r from-emerald-800/10 to-sky-700/5 p-6 outline outline-1 outline-offset-[-1px] outline-emerald-800/10"
        >
          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
          >
            <UIcon name="i-heroicons-ticket" class="size-5 text-emerald-800" />
          </div>
          <div class="inline-flex flex-col items-start justify-start">
            <span class="font-['Inter'] text-sm leading-5 font-bold text-emerald-800"
              >New User Promo Applied</span
            >
            <span class="font-['Inter'] text-xs leading-4 font-normal text-gray-700"
              >Save extra 10% on your first journey</span
            >
          </div>
        </div>
      </div>

      <!-- ───────────────────────────────────────────
      QR Payment Confirmation Modal
        BaseModal wiring:
          v-model : isQrModalOpen
          Emits   : @close → isQrModalOpen = false
          TODO    : Add QR code component inside when available
                    On Popup confirm QR
    ─────────────────────────────────────────── -->
    </div>
  </div>

  <QRConfirmPopup v-model="isQrModalOpen" ticket-id="FV-2024-X92L" />
</template>
