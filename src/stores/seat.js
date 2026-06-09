import { defineStore } from 'pinia'
import { ref } from 'vue'
import { seatService } from '@/services/seatService'

export const useSeatStore = defineStore('seat', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const seats = ref([])
  const selectedSeat = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ─── Actions ──────────────────────────────────────────────────────────────
  async function fetchByTrip(tripId) {
    /* placeholder */
  }

  function selectSeat(seat) {
    selectedSeat.value = seat
  }
  function clearSelection() {
    selectedSeat.value = null
  }

  return { seats, selectedSeat, loading, error, fetchByTrip, selectSeat, clearSelection }
})
