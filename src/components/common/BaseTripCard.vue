<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/elements/BaseButton.vue'

defineOptions({ inheritAttrs: false })

/**
 * @typedef {Object} Trip
 * @property {string|number} id              - Unique trip identifier
 */
const props = defineProps({
  trip: {
    type: Object,
    required: true,
  },
  selected: { type: Boolean, default: false },
})

const emit = defineEmits(['select'])

const formattedPrice = computed(() => `₫${props.trip.price.toLocaleString('vi-VN')}`)

const seatLabel = computed(() => `${props.trip.availableSeats}/${props.trip.totalSeats} available`)

const handleSelect = () => {
  emit('select', props.trip)
}
const handleSelected = () => {
  emit('select-card', props.trip.id)
}
</script>

<template>
  <div
    v-bind="$attrs"
    class="relative inline-flex cursor-pointer items-center justify-start gap-8 self-stretch overflow-hidden bg-white p-6"
    @click="handleSelected"
    :class="
      selected
        ? 'shadow-[0px_8px_10px_-6px_rgba(27,27,28,0.05),0px_20px_25px_-5px_rgba(27,27,28,0.05)] outline outline-2 outline-offset-[-2px] outline-sky-700/20'
        : 'outline outline-1 outline-offset-[-1px] outline-slate-300/10 hover:outline-2 hover:outline-sky-700/10'
    "
  >
    <!-- Card shadow overlay (standard) -->
    <!-- <div
      v-if="!premium"
      class="absolute top-0 left-0 h-24 w-[976px] bg-white/0 shadow-[0px_8px_10px_-6px_rgba(27,27,28,0.05),0px_20px_25px_-5px_rgba(27,27,28,0.05)]"
    ></div> -->

    <!-- Premium badge -->
    <div
      v-if="selected"
      class="absolute top-[2px] left-[2px] z-10 inline-flex flex-col items-start justify-start rounded-br-[32px] bg-sky-700 px-4 py-1"
    >
      <span
        class="font-['Inter'] text-[10px] leading-4 font-bold tracking-wide text-white uppercase"
        >{{ selected ? 'SELECTED' : 'PREMIUM CLASS' }}</span
      >
    </div>

    <!-- Time range -->
    <div class="flex flex-1 items-center justify-start gap-6">
      <!-- Departure -->
      <div class="inline-flex flex-col items-center justify-start">
        <div class="flex flex-col items-start justify-start">
          <span class="justify-center font-['Inter'] text-2xl leading-8 font-black text-zinc-900">{{
            trip.departureTime
          }}</span>
        </div>
        <div class="flex flex-col items-start justify-start">
          <span
            class="justify-center font-['Inter'] text-[10px] leading-4 font-bold tracking-wide text-gray-500 uppercase"
            >{{ trip.departurePeriod }}</span
          >
        </div>
      </div>

      <!-- Progress bar -->
      <div class="relative flex h-12 flex-1 items-center justify-center px-4">
        <div class="relative h-0.5 flex-1 overflow-hidden rounded-full bg-purple-200">
          <div class="absolute top-0 left-0 h-0.5 w-16 bg-violet-700"></div>
        </div>
        <div
          class="absolute top-[18px] left-0 size-3 rounded-full border-2 border-white bg-violet-700"
        ></div>
        <div
          class="absolute top-[18px] left-[234.14px] size-3 rounded-full border-2 border-white bg-violet-700"
        ></div>
      </div>

      <!-- Arrival -->
      <div class="inline-flex flex-col items-center justify-start">
        <div class="flex flex-col items-start justify-start">
          <span class="justify-center font-['Inter'] text-2xl leading-8 font-black text-zinc-900">{{
            trip.arrivalTime
          }}</span>
        </div>
        <div class="flex flex-col items-start justify-start">
          <span
            class="justify-center font-['Inter'] text-[10px] leading-4 font-bold tracking-wide text-gray-500 uppercase"
            >{{ trip.arrivalPeriod }}</span
          >
        </div>
      </div>
    </div>

    <!-- Vertical divider -->
    <UDivider orientation="vertical" class="h-12 opacity-30" />

    <!-- Bus info -->
    <div class="inline-flex min-w-36 flex-col items-start justify-start gap-1">
      <div class="inline-flex items-center justify-start gap-2 self-stretch">
        <UIcon name="i-heroicons-truck" class="h-3.5 w-3 shrink-0 text-sky-700" />
        <span class="justify-center font-['Inter'] text-base leading-6 font-bold text-zinc-900">{{
          trip.busPlate
        }}</span>
      </div>
      <div class="inline-flex items-center justify-start gap-2 self-stretch">
        <UIcon name="i-heroicons-user" class="h-3 w-1.5 shrink-0 text-gray-700" />
        <span class="justify-center font-['Inter'] text-sm leading-5 font-normal text-gray-700">{{
          seatLabel
        }}</span>
      </div>
    </div>

    <!-- Price + Select -->
    <div class="flex items-center justify-end gap-8">
      <div class="inline-flex flex-col items-end justify-start">
        <span
          class="justify-center font-['Inter'] text-[10px] leading-4 font-bold tracking-wide text-gray-500 uppercase"
          >PRICE</span
        >
        <span class="justify-center font-['Inter'] text-xl leading-7 font-black text-sky-700">{{
          formattedPrice
        }}</span>
      </div>

      <!-- Standard select button -->
      <BaseButton
        v-if="!selected"
        label="Select"
        type="secondary"
        size="md"
        class="rounded-full bg-stone-200 px-8 py-3"
        @click="handleSelect"
      />

      <!-- Premium / Selected gradient select button -->
      <BaseButton
        v-else
        class="relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-700 to-violet-500 px-8 py-3 shadow-[0px_2px_4px_-2px_rgba(0,101,145,0.20),0px_4px_6px_-1px_rgba(0,101,145,0.20)]"
        type="button"
        @click="handleSelect"
      >
        <span class="font-['Inter'] text-base leading-6 font-bold text-white">Select</span>
      </BaseButton>
    </div>
  </div>
</template>
