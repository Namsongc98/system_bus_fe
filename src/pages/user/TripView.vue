<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseSearchForm from '@/components/common/BaseSearchForm.vue'
import BaseSortFilter from '@/components/elements/BaseSortFilter.vue'
import BaseTripCard from '@/components/common/BaseTripCard.vue'
import heroBg from '@/assets/image/Container.png'
import { ROUTE_NAMES } from '@/constants/routes'
import { TRIP_VIEW_FALLBACK_TRIPS, TRIP_VIEW_SORT_OPTIONS } from '@/constants/user/tripView'

const router = useRouter()

// TODO: wire from/to from search result payload (tripStore)
const from = ref('Hà Nội')
const to = ref('Hải Phòng')

const trips = ref(TRIP_VIEW_FALLBACK_TRIPS)

const selectedTripId = ref(null)

function handleSelectTripCard(tripId) {
  return (selectedTripId.value = tripId)
}

function handleSelectTrip(trip) {
  router.push({ name: ROUTE_NAMES.SEAT_VIEW, params: { tripId: trip.id } })
}

/*
  BaseSortFilter wiring:
  Props : modelValue (String), options (Array)
  Emits : update:modelValue → sortBy.value
  TODO  : wire sortBy change to re-sort or re-fetch trips from store
*/
const sortBy = ref('earliest')
</script>

<template>
  <div v-bind="$attrs">
    <!-- ─── Hero / Banner Section ──────────────────────────────────────── -->
    <section
      class="relative inline-flex h-[480px] w-full items-center justify-center overflow-hidden"
    >
      <!-- Background image -->
      <div class="absolute inset-0 flex h-full w-full flex-col">
        <img
          :src="heroBg"
          alt="Hero background"
          class="h-full w-full flex-1 self-stretch object-cover"
        />
      </div>

      <!-- Gradient overlay (mix-blend-multiply) -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-sky-700/80 via-sky-500/60 to-violet-500/80 mix-blend-multiply"
      ></div>

      <!--
        BaseSearchForm wiring:
        Props : loading (Boolean)        — wire from useAsync composable
        Emits : @search  → { from, to, date, passengers }  — TODO: call tripStore.fetchTrips(payload)
                @reset                                      — TODO: clear results list
      -->
      <BaseSearchForm class="relative z-10" :loading="false" @search="() => {}" @reset="() => {}" />
    </section>
    <!-- ─── End Hero Section ───────────────────────────────────────────── -->

    <!-- TODO: wire results list section (TripCard list) below -->

    <!-- ─── Trip Results Section ──────────────────────────────────────── -->
    <div class="relative z-10 -mt-16 flex w-full justify-center">
      <div
        class="inline-flex w-[1024px] max-w-[1024px] flex-col items-start justify-start gap-8 px-6 pb-24"
      >
        <!-- Results header: journey label + sort filter -->
        <div class="inline-flex items-end justify-between self-stretch">
          <div class="inline-flex flex-col items-start justify-start gap-1">
            <span
              class="font-['Inter'] text-sm leading-5 font-bold tracking-wider text-white/60 uppercase"
            >
              AVAILABLE JOURNEYS
            </span>
            <!-- TODO: wire from/to from search payload (tripStore.searchParams) -->
            <div class="inline-flex items-center justify-start gap-2">
              <span class="font-['Inter'] text-2xl leading-8 font-bold text-white">{{ from }}</span>
              <UIcon name="i-heroicons-arrow-right" class="h-3.5 w-3.5 text-white/70" />
              <span class="font-['Inter'] text-2xl leading-8 font-bold text-white">{{ to }}</span>
            </div>
          </div>

          <!--
            BaseSortFilter wiring:
            Props : modelValue (String), options (Array), label (String)
            Emits : update:modelValue → sortBy
            TODO  : wire @update:modelValue to re-sort trips list in store or local computed
          -->
          <BaseSortFilter v-model="sortBy" :options="TRIP_VIEW_SORT_OPTIONS" label="Sort by" />
        </div>

        <!-- Trip cards list -->
        <!--
          BaseTripCard wiring:
          Props : departureTime, departurePeriod, arrivalTime, arrivalPeriod,
                  busPlate, availableSeats, totalSeats, price, premium
          Emits : @select → handleSelectTrip(trip)
          TODO  : replace static cards with v-for="trip in trips" :key="trip.id"
                  wire trips from tripStore.trips after search
        -->
        <div class="flex flex-col items-start justify-start gap-6 self-stretch">
          <BaseTripCard
            v-for="trip in trips"
            :key="trip.id"
            :trip="trip"
            :selected="selectedTripId === trip.id"
            class="self-stretch"
            @select-card="handleSelectTripCard"
            @select="handleSelectTrip"
          />
        </div>
      </div>
    </div>
    <!-- ─── End Trip Results Section ──────────────────────────────────── -->
  </div>
</template>
