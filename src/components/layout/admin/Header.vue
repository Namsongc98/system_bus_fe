<script setup>
// AppHeader — shared top bar for both layouts
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROUTE_NAMES } from '@/constants/routes'

const authStore = useAuthStore()
const router = useRouter()

const displayName = computed(
  () => authStore.user?.fullName || authStore.user?.email || authStore.user?.sub || 'Admin'
)

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: ROUTE_NAMES.LOGIN })
}
</script>

<template>
  <header
    class="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur max-md:px-4"
  >
    <div class="min-w-0">
      <p class="text-xs font-bold tracking-wider text-slate-500 uppercase">Admin</p>
      <h1 class="truncate text-lg font-bold text-slate-950">Dashboard</h1>
    </div>

    <div class="flex items-center gap-3">
      <div class="hidden min-w-0 text-right sm:block">
        <p class="max-w-48 truncate text-sm font-semibold text-slate-950">{{ displayName }}</p>
        <p class="text-xs font-medium text-slate-500">Administrator</p>
      </div>
      <button
        type="button"
        class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        @click="handleLogout"
      >
        Logout
      </button>
    </div>
  </header>
</template>
