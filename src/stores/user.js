import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/userService'

function getPayload(response) {
  return response?.data?.data ?? response?.data ?? response
}

function getCollection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.content)) return payload.content
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function getTotal(payload, collection) {
  const totalValue = payload?.totalElements ?? payload?.total ?? payload?.pagination?.total
  return Number.isFinite(Number(totalValue)) ? Number(totalValue) : collection.length
}

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const total = ref(0)

  async function fetchAll(params) {
    loading.value = true
    error.value = null

    try {
      const response = await userService.getAll(params)
      const payload = getPayload(response)
      const collection = getCollection(payload)

      users.value = collection
      total.value = getTotal(payload, collection)

      return collection
    } catch (err) {
      users.value = []
      total.value = 0
      error.value = err?.message || 'Unable to load users'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    loading.value = true
    error.value = null

    try {
      const response = await userService.getProfile()
      const payload = getPayload(response)

      profile.value = payload
      return payload
    } catch (err) {
      error.value = err?.message || 'Unable to load profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(payload) {
    loading.value = true
    error.value = null

    try {
      const response = await userService.updateProfile(payload)
      const updatedProfile = getPayload(response)

      profile.value = updatedProfile
      return updatedProfile
    } catch (err) {
      error.value = err?.message || 'Unable to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id) {
    loading.value = true
    error.value = null

    try {
      const response = await userService.deleteById(id)
      users.value = users.value.filter((user) => {
        const userId = user?.id ?? user?._id ?? user?.userId
        return String(userId) !== String(id)
      })
      total.value = Math.max(total.value - 1, 0)
      return getPayload(response)
    } catch (err) {
      error.value = err?.message || 'Unable to delete user'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    profile,
    loading,
    error,
    total,
    fetchAll,
    fetchProfile,
    updateProfile,
    deleteUser,
  }
})
