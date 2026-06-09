import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tripService } from '@/services/tripService'

function getPayload(response) {
  return response?.data?.data ?? response?.data ?? response
}

export const useTripStore = defineStore('trip', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const trips = ref([])
  const selectedTrip = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const total = ref(0)

  // ─── Actions ──────────────────────────────────────────────────────────────
  async function search(params) {
    /* placeholder */
  }
  async function fetchAll(params) {
    /* placeholder */
  }
  async function fetchById(id) {
    /* placeholder */
  }
  async function create(payload) {
    loading.value = true
    error.value = null

    try {
      const response = await tripService.create(payload)
      const createdTrip = getPayload(response)

      if (createdTrip) {
        trips.value = [createdTrip, ...trips.value]
        total.value += 1
      }

      return createdTrip
    } catch (err) {
      error.value = err?.message || 'Unable to create trip'
      throw err
    } finally {
      loading.value = false
    }
  }
  async function update(id, payload) {
    /* placeholder */
  }
  async function remove(id) {
    /* placeholder */
  }

  function selectTrip(trip) {
    selectedTrip.value = trip
  }

  return {
    trips,
    selectedTrip,
    loading,
    error,
    total,
    search,
    fetchAll,
    fetchById,
    selectTrip,
    create,
    update,
    remove,
  }
})
