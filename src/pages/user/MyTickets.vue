<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseTabs from '@/components/elements/BaseTabs.vue'
import BaseTicketCard from '@/components/common/BaseTicketCard.vue'
import heroBg from '@/assets/image/Container.png'
import { ROUTE_NAMES } from '@/constants/routes'
import { MY_TICKETS_TAB_OPTIONS } from '@/constants/user/myTickets'
import { useBookingStore } from '@/stores/booking'

const router = useRouter()
const bookingStore = useBookingStore()
const { myTickets, loading, error } = storeToRefs(bookingStore)
const selectedTicketTab = ref('upcoming')

const hasTickets = computed(() => myTickets.value.length > 0)

const isCancelledTicket = (ticket) => String(ticket.status || '').toUpperCase() === 'CANCELLED'

const isPastTicket = (ticket) => {
  const departureTime = getDepartureTime(ticket)
  if (!departureTime) return false
  const date = new Date(departureTime)
  return !Number.isNaN(date.getTime()) && date < new Date()
}

const filteredTickets = computed(() => {
  if (selectedTicketTab.value === 'cancelled') {
    return myTickets.value.filter(isCancelledTicket)
  }

  if (selectedTicketTab.value === 'past') {
    return myTickets.value.filter((ticket) => !isCancelledTicket(ticket) && isPastTicket(ticket))
  }

  return myTickets.value.filter((ticket) => !isCancelledTicket(ticket) && !isPastTicket(ticket))
})

const hasFilteredTickets = computed(() => filteredTickets.value.length > 0)

const getTicketId = (ticket) => ticket.id ?? ticket.ticketId ?? ticket.code

const getDepartureTime = (ticket) =>
  ticket.departureTime || ticket.trip?.departureTime || ticket.createdAt || ticket.bookingDate

const handleViewPass = (ticket) => {
  bookingStore.currentTicket = ticket
}

const goToTrips = () => {
  router.push({ name: ROUTE_NAMES.TRIP_VIEW })
}

const refreshTickets = () => {
  bookingStore.fetchMyTickets().catch(() => {})
}

onMounted(refreshTickets)
</script>

<template>
  <main class="min-h-full bg-stone-50">
    <div class="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-12 px-6 pt-12 pb-24">
      <section class="flex w-full flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex flex-col items-start gap-2">
          <h1
            class="font-['Inter'] text-4xl leading-10 font-black text-zinc-900 md:text-5xl md:leading-[48px]"
          >
            My Tickets
          </h1>
          <p class="font-['Inter'] text-lg leading-7 font-normal text-gray-700">
            Manage your digital passes and upcoming adventures.
          </p>
        </div>

        <BaseTabs
          v-model="selectedTicketTab"
          :options="MY_TICKETS_TAB_OPTIONS"
          aria-label="Filter tickets"
        />
      </section>

      <div
        v-if="error"
        class="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ error }}
      </div>

      <div
        v-if="loading && !hasTickets"
        class="flex min-h-80 w-full items-center justify-center bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
      >
        <div class="flex items-center gap-3 text-slate-500">
          <UIcon name="i-heroicons-arrow-path" class="size-5 animate-spin" />
          <span>Loading tickets...</span>
        </div>
      </div>

      <div
        v-else-if="!hasTickets"
        class="flex min-h-80 w-full flex-col items-center justify-center gap-4 border border-dashed border-slate-300 bg-white p-8 text-center"
      >
        <UIcon name="i-heroicons-ticket" class="size-12 text-slate-300" />
        <div>
          <h2 class="text-lg font-semibold text-slate-900">No tickets yet</h2>
          <p class="mt-1 text-sm text-slate-500">Book a trip to see your tickets here.</p>
        </div>
        <BaseButton @click="goToTrips">Find trips</BaseButton>
      </div>

      <section v-else class="flex w-full flex-col items-start">
        <div
          v-if="!hasFilteredTickets"
          class="flex min-h-80 w-full flex-col items-center justify-center gap-3 border border-dashed border-slate-300 bg-white p-8 text-center"
        >
          <UIcon name="i-heroicons-ticket" class="size-10 text-slate-300" />
          <div>
            <h2 class="text-lg font-semibold text-slate-900">No tickets in this tab</h2>
            <p class="mt-1 text-sm text-slate-500">Choose another filter to view more tickets.</p>
          </div>
        </div>

        <div v-else class="flex w-full flex-col items-start">
          <BaseTicketCard
            v-for="ticket in filteredTickets"
            :key="getTicketId(ticket)"
            :ticket="ticket"
            @view-pass="handleViewPass"
            @expand="handleViewPass"
          />
        </div>

        <section class="flex w-full flex-col items-start gap-8 pt-12">
          <h2 class="font-['Inter'] text-3xl leading-9 font-normal text-zinc-900">
            Continue your journey
          </h2>

          <div
            class="grid w-full grid-cols-1 overflow-hidden bg-white shadow-lg lg:grid-cols-[2fr_1fr]"
          >
            <article class="relative flex h-64 items-end overflow-hidden">
              <img
                :src="heroBg"
                alt="Luxury bus cabin"
                class="absolute inset-0 size-full object-cover"
              />
              <div
                class="relative z-10 flex size-full flex-col justify-end bg-gradient-to-r from-black/80 via-black/20 to-black/0 p-8"
              >
                <h3 class="pb-2 font-['Inter'] text-2xl leading-8 font-normal text-white">
                  Upgrade to First Class
                </h3>
                <p class="max-w-80 font-['Inter'] text-sm leading-5 font-normal text-white/80">
                  Experience wider legroom and complimentary Wi-Fi for your next trip.
                </p>
              </div>
            </article>

            <article
              class="relative flex min-h-64 flex-col justify-between overflow-hidden bg-sky-500 p-8 shadow-[0px_4px_6px_-4px_rgba(0,101,145,0.20),0px_10px_15px_-3px_rgba(0,101,145,0.20)]"
            >
              <UIcon name="i-heroicons-user-group" class="size-7 text-white" />
              <div class="flex flex-col items-start gap-2">
                <h3 class="font-['Inter'] text-xl leading-7 font-normal text-white">
                  Save 15% on Groups
                </h3>
                <p class="pb-2 font-['Inter'] text-sm leading-5 font-normal text-white/90">
                  Traveling with 4 or more people? Use code VOYAGER15.
                </p>
                <BaseButton type="secondary" size="md">Claim Now</BaseButton>
              </div>
            </article>
          </div>
        </section>
      </section>
    </div>
  </main>
</template>
