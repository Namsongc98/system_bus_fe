<script>
// Module-scope constant — safe to reference in defineProps default
export const FAKE_SEATS = Array.from({ length: 41 }, (_, i) => {
  const n = i + 1
  const booked = [1, 4, 7, 10, 21, 31].includes(n)
  return {
    id: n,
    number: n,
    status: booked ? 'booked' : 'available',
  }
})
</script>

<script setup>
/**
 * @typedef {'available' | 'booked' | 'selected'} SeatStatus
 */

/**
 * @typedef {Object} Seat
 * @property {string|number} id     - Unique seat identifier
 * @property {string|number} number - Seat number to display
 * @property {SeatStatus}    status - Current seat status
 */

import { computed, ref } from 'vue'
import IconUser from '@/assets/icons/IconUser.vue'
import BaseButton from '@/components/elements/BaseButton.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  seats: {
    type: Array,
    default: () => FAKE_SEATS,
  },
})

const emit = defineEmits(['select'])

// Internally tracked selected seat IDs
const selectedIds = ref(new Set())

function handleSeatClick(seat) {
  if (seat.status === 'booked') return
  const next = new Set(selectedIds.value)
  if (next.has(seat.id)) {
    next.delete(seat.id)
  } else {
    next.add(seat.id)
  }
  selectedIds.value = next
  emit('select', seat)
}

function seatClass(seat) {
  if (selectedIds.value.has(seat.id)) {
    return 'bg-sky-700 text-white shadow-[0_0_0_2px_rgba(246,243,242,1),0_0_0_6px_rgba(0,101,145,0.20)] cursor-pointer'
  }
  if (seat.status === 'booked') {
    return 'bg-zinc-300 text-zinc-900/40 cursor-not-allowed'
  }
  return 'bg-blue-200 text-sky-700 cursor-pointer hover:bg-sky-200 transition-colors'
}
const regularRows = computed(() => {
  const mainSeats = props.seats.length > 5 ? props.seats.slice(0, props.seats.length - 5) : []
  const result = []
  for (let i = 0; i < mainSeats.length; i += 4) {
    result.push(mainSeats.slice(i, i + 4))
  }
  return result
})

// Back row: last 5 seats span full width (no aisle gap)
const backRow = computed(() =>
  props.seats.length >= 5 ? props.seats.slice(props.seats.length - 5) : []
)

function padNum(n) {
  return String(n).padStart(2, '0')
}
</script>

<template>
  <div
    v-bind="$attrs"
    class="relative inline-flex w-96 max-w-96 flex-col items-start justify-start gap-10 rounded-[48px] bg-stone-100 p-8 shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]"
  >
    <!-- Bus front decoration -->
    <div
      class="absolute -top-6 left-1/2 h-6 w-32 -translate-x-1/2 rounded-tl-full rounded-tr-full bg-zinc-300 opacity-50"
    ></div>

    <!-- Driver / Entrance header -->
    <div
      class="inline-flex items-center justify-between self-stretch border-b border-slate-300/20 pb-6"
    >
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-4xl bg-stone-200">
          <UIcon name="i-heroicons-arrow-right-end-on-rectangle" class="size-5 text-gray-700" />
        </div>
        <span class="text-xs leading-4 font-normal tracking-wide text-gray-700 uppercase"
          >ENTRANCE</span
        >
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs leading-4 font-normal tracking-wide text-gray-700 uppercase"
          >DRIVER</span
        >
        <div class="flex size-10 items-center justify-center rounded-4xl bg-stone-200">
          <IconUser class="size-4 text-gray-700" />
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="inline-flex items-center justify-center gap-6 self-stretch">
      <div class="flex items-center gap-2">
        <span class="size-4 rounded-xs bg-blue-200"></span>
        <span class="text-xs leading-4 font-normal text-gray-700">Available</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="size-4 rounded-xs bg-sky-700"></span>
        <span class="text-xs leading-4 font-normal text-gray-700">Selected</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="size-4 rounded-xs bg-zinc-300"></span>
        <span class="text-xs leading-4 font-normal text-gray-700">Booked</span>
      </div>
    </div>

    <!-- Seat Grid: regular rows (2 | aisle | 2) + back row (5 full-width) -->
    <div class="flex flex-col gap-2 self-stretch">
      <!-- Regular rows -->
      <div
        v-for="(row, rowIndex) in regularRows"
        :key="rowIndex"
        class="grid grid-cols-[1fr_1fr_1.5rem_1fr_1fr] gap-2"
      >
        <!-- Left window -->
        <BaseButton
          v-if="row[0]"
          unstyled
          html-type="button"
          class="inline-flex h-12 items-center justify-center rounded-md text-[10px] leading-4 font-bold transition-colors"
          :class="seatClass(row[0])"
          :disabled="row[0].status === 'booked'"
          :aria-label="`Seat ${padNum(row[0].number)}`"
          @click="handleSeatClick(row[0])"
        >
          {{ padNum(row[0].number) }}
        </BaseButton>
        <div v-else></div>

        <!-- Left aisle -->
        <BaseButton
          v-if="row[1]"
          unstyled
          html-type="button"
          class="inline-flex h-12 items-center justify-center rounded-md text-[10px] leading-4 font-bold transition-colors"
          :class="seatClass(row[1])"
          :disabled="row[1].status === 'booked'"
          :aria-label="`Seat ${padNum(row[1].number)}`"
          @click="handleSeatClick(row[1])"
        >
          {{ padNum(row[1].number) }}
        </BaseButton>
        <div v-else></div>

        <!-- Aisle spacer -->
        <div class="h-12"></div>

        <!-- Right aisle -->
        <BaseButton
          v-if="row[2]"
          unstyled
          html-type="button"
          class="inline-flex h-12 items-center justify-center rounded-md text-[10px] leading-4 font-bold transition-colors"
          :class="seatClass(row[2])"
          :disabled="row[2].status === 'booked'"
          :aria-label="`Seat ${padNum(row[2].number)}`"
          @click="handleSeatClick(row[2])"
        >
          {{ padNum(row[2].number) }}
        </BaseButton>
        <div v-else></div>

        <!-- Right window -->
        <BaseButton
          v-if="row[3]"
          unstyled
          html-type="button"
          class="inline-flex h-12 items-center justify-center rounded-md text-[10px] leading-4 font-bold transition-colors"
          :class="seatClass(row[3])"
          :disabled="row[3].status === 'booked'"
          :aria-label="`Seat ${padNum(row[3].number)}`"
          @click="handleSeatClick(row[3])"
        >
          {{ padNum(row[3].number) }}
        </BaseButton>
        <div v-else></div>
      </div>

      <!-- Back row: 5 seats, no aisle gap -->
      <div v-if="backRow.length" class="grid grid-cols-5 gap-2">
        <BaseButton
          v-for="seat in backRow"
          :key="seat.id"
          unstyled
          html-type="button"
          class="inline-flex h-12 items-center justify-center rounded-md text-[10px] leading-4 font-bold transition-colors"
          :class="seatClass(seat)"
          :disabled="seat.status === 'booked'"
          :aria-label="`Seat ${padNum(seat.number)}`"
          @click="handleSeatClick(seat)"
        >
          {{ padNum(seat.number) }}
        </BaseButton>
      </div>
    </div>

    <!-- Bus rear decoration -->
    <div
      class="absolute -bottom-4 left-1/2 h-4 w-48 -translate-x-1/2 rounded-br-[48px] rounded-bl-[48px] bg-zinc-300 opacity-30"
    ></div>
  </div>
</template>
