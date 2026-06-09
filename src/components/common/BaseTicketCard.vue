<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/elements/BaseButton.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  ticket: {
    type: Object,
    default: () => ({}),
  },
  actionLabel: { type: String, default: 'VIEW PASS' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['view-pass', 'expand'])

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const formatDateTime = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const isCancelledTicket = computed(
  () => String(props.ticket.status || '').toUpperCase() === 'CANCELLED'
)

const departureRaw = computed(
  () =>
    props.ticket.departureTime ||
    props.ticket.trip?.departureTime ||
    props.ticket.createdAt ||
    props.ticket.bookingDate
)

const isPastTicket = computed(() => {
  if (!departureRaw.value) return false
  const date = new Date(departureRaw.value)
  return !Number.isNaN(date.getTime()) && date < new Date()
})

const normalizedStatus = computed(() => {
  if (isCancelledTicket.value) return 'CANCELLED'
  const status = String(props.ticket.status || '').toUpperCase()
  if (status && !['BOOKED', 'PAID'].includes(status)) return status
  if (isPastTicket.value) return 'BOARDED'
  return status || 'UPCOMING'
})

const ticketCode = computed(
  () => props.ticket.id ?? props.ticket.ticketId ?? props.ticket.code ?? 'N/A'
)

const fromLabel = computed(
  () =>
    props.ticket.from ||
    props.ticket.departure ||
    props.ticket.startLocation ||
    props.ticket.route?.from ||
    'Departure'
)

const toLabel = computed(
  () =>
    props.ticket.to ||
    props.ticket.destination ||
    props.ticket.endLocation ||
    props.ticket.route?.to ||
    'Arrival'
)

const departureTime = computed(() => formatDateTime(departureRaw.value))

const arrivalTime = computed(() =>
  formatDateTime(props.ticket.arrivalTime || props.ticket.trip?.arrivalTime)
)

const seat = computed(() => {
  const seatNumber = props.ticket.seatNumber || props.ticket.seat?.number
  const seatType = props.ticket.seatType || props.ticket.seat?.type
  if (seatNumber && seatType) return `${seatNumber}\n(${seatType})`
  return seatNumber || 'N/A'
})

const price = computed(() => formatCurrency(props.ticket.price || props.ticket.totalPrice))

const ticketDate = computed(() => formatDateTime(departureRaw.value))

const qrSrc = computed(
  () =>
    props.ticket.qrCodeUrl ||
    props.ticket.qrUrl ||
    props.ticket.payment?.qrCodeUrl ||
    'https://placehold.co/80x80'
)

const statusClasses = computed(() => {
  if (normalizedStatus.value === 'CANCELLED') return 'bg-red-100 text-red-800'
  if (['BOARDED', 'PAST', 'COMPLETE'].includes(normalizedStatus.value)) {
    return 'bg-emerald-300 text-emerald-900'
  }
  if (normalizedStatus.value === 'PAID') return 'bg-blue-200 text-sky-900'
  return 'bg-blue-200 text-sky-900'
})

const borderClasses = computed(() => {
  if (normalizedStatus.value === 'CANCELLED') return 'border-red-700'
  if (['BOARDED', 'PAST', 'COMPLETE'].includes(normalizedStatus.value)) {
    return 'border-emerald-800'
  }
  if (normalizedStatus.value === 'PAID') return 'border-sky-500'
  return 'border-sky-500'
})

const originDotClasses = computed(() => {
  if (normalizedStatus.value === 'CANCELLED')
    return 'bg-red-700 shadow-[0px_0px_0px_4px_rgba(255,218,214,1.00)]'
  if (['BOARDED', 'PAST', 'COMPLETE'].includes(normalizedStatus.value)) {
    return 'bg-emerald-800 shadow-[0px_0px_0px_4px_rgba(111,251,190,1.00)]'
  }
  return 'bg-sky-700 shadow-[0px_0px_0px_4px_rgba(201,230,255,1.00)]'
})

const destinationDotClasses = computed(() => {
  if (normalizedStatus.value === 'CANCELLED')
    return 'bg-red-700 shadow-[0px_0px_0px_4px_rgba(255,218,214,1.00)]'
  if (['BOARDED', 'PAST', 'COMPLETE'].includes(normalizedStatus.value)) {
    return 'bg-zinc-300 shadow-[0px_0px_0px_4px_rgba(234,231,231,1.00)]'
  }
  return 'bg-violet-700 shadow-[0px_0px_0px_4px_rgba(233,221,255,1.00)]'
})

const isCancelled = computed(() => normalizedStatus.value === 'CANCELLED')
const isComplete = computed(() => ['BOARDED', 'PAST', 'COMPLETE'].includes(normalizedStatus.value))

const handleExpand = () => {
  emit('expand', props.ticket)
}

const handleViewPass = () => {
  emit('view-pass', props.ticket)
}
</script>

<template>
  <article
    v-bind="$attrs"
    class="flex min-h-80 items-stretch overflow-hidden bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
    :class="['border-l-[6px]', borderClasses, isComplete ? 'opacity-90' : '']"
  >
    <div class="flex flex-1 flex-col items-start justify-start gap-6 p-8">
      <div class="flex w-full items-start justify-between gap-4">
        <div
          class="inline-flex rounded-full px-4 py-1.5 font-['Inter'] text-xs leading-4 font-bold tracking-wider uppercase"
          :class="statusClasses"
        >
          {{ normalizedStatus }}
        </div>
        <div class="font-['Inter'] text-base leading-6 font-medium text-gray-700">
          #{{ ticketCode || 'N/A' }}
        </div>
      </div>

      <div class="flex w-full items-center gap-4">
        <div class="inline-flex flex-col items-center">
          <div class="size-3 rounded-full" :class="originDotClasses"></div>
          <div class="flex h-12 w-0.5 items-start py-1">
            <div class="h-10 w-0.5 border-l-2 border-slate-300"></div>
          </div>
          <div class="size-3 rounded-full" :class="destinationDotClasses"></div>
        </div>

        <div class="flex flex-1 flex-col items-start gap-4">
          <div class="flex w-full items-center justify-between gap-4">
            <h3 class="font-['Inter'] text-xl leading-7 font-bold text-zinc-900">
              {{ fromLabel }}
            </h3>
            <div class="font-['Inter'] text-sm leading-5 font-medium text-gray-700">
              {{ departureTime || 'N/A' }}
            </div>
          </div>
          <div class="flex w-full items-center justify-between gap-4">
            <h3 class="font-['Inter'] text-xl leading-7 font-bold text-zinc-900">
              {{ toLabel }}
            </h3>
            <div class="font-['Inter'] text-sm leading-5 font-medium text-gray-700">
              {{ arrivalTime || 'N/A' }}
            </div>
          </div>
        </div>
      </div>

      <div class="grid w-full grid-cols-1 gap-6 border-t border-zinc-100 pt-8 sm:grid-cols-3">
        <div class="flex flex-col gap-1">
          <div
            class="font-['Inter'] text-xs leading-4 font-normal tracking-wider text-gray-700 uppercase"
          >
            Date
          </div>
          <div class="font-['Inter'] text-base leading-6 font-normal text-zinc-900">
            {{ ticketDate }}
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <div
            class="font-['Inter'] text-xs leading-4 font-normal tracking-wider text-gray-700 uppercase"
          >
            Seat
          </div>
          <div
            class="font-['Inter'] text-base leading-6 font-normal whitespace-pre-line text-zinc-900"
          >
            {{ seat || 'N/A' }}
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <div
            class="font-['Inter'] text-xs leading-4 font-normal tracking-wider text-gray-700 uppercase"
          >
            {{ isCancelled ? 'Refund' : 'Price' }}
          </div>
          <div
            class="font-['Inter'] text-base leading-6 font-normal"
            :class="isCancelled ? 'text-red-700' : 'text-sky-700'"
          >
            {{ isCancelled ? 'PROCESSED' : price }}
          </div>
        </div>
      </div>
    </div>

    <aside
      class="hidden w-48 flex-col items-center justify-center border-l p-8 md:inline-flex"
      :class="
        isCancelled
          ? 'border-red-700/10 bg-red-700/5'
          : isComplete
            ? 'border-slate-300/10 bg-white bg-blend-saturation'
            : 'border-slate-300/10 bg-stone-100'
      "
    >
      <template v-if="isCancelled">
        <UIcon name="i-heroicons-x-circle" class="mb-4 size-7 text-red-700" />
        <div class="mb-2 text-center font-['Inter'] text-xs leading-4 font-bold text-red-700">
          VOID TICKET
        </div>
        <BaseButton
          html-type="button"
          type="outline"
          size="sm"
          class="text-center font-['Inter'] text-xs leading-4 font-bold text-zinc-900 underline"
          :disabled="disabled"
          @click="handleExpand"
        >
          VIEW REASON
        </BaseButton>
      </template>

      <template v-else-if="isComplete">
        <div class="mb-4 flex size-24 items-center justify-center rounded-[32px] bg-white/50">
          <UIcon name="i-heroicons-check-circle" class="size-7 text-slate-300" />
        </div>
        <div class="text-center font-['Inter'] text-xs leading-4 font-bold text-gray-700">
          JOURNEY<br />COMPLETE
        </div>
      </template>

      <template v-else>
        <BaseButton
          html-type="button"
          type="outline"
          size="sm"
          class="mb-4 flex size-24 items-center justify-center rounded-[32px] bg-white p-2 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
          :disabled="disabled"
          aria-label="Expand ticket QR code"
          @click="handleExpand"
        >
          <img :src="qrSrc" alt="Digital ticket QR code" class="size-20 object-cover" />
        </BaseButton>

        <div class="mb-4 text-center font-['Inter'] text-xs leading-4 font-bold text-gray-700">
          TAP TO EXPAND
        </div>

        <BaseButton size="sm" :disabled="disabled" @click="handleViewPass">
          {{ actionLabel }}
        </BaseButton>
      </template>
    </aside>
  </article>
</template>
