<script setup>
// AppHeader — user layout shell header
// Classification: components/layout/ — no store, no service, no API calls

import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { USER_HEADER_NAV_LINKS } from '@/constants/user/layout'
import { ROUTE_NAMES } from '@/constants/routes'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/elements/BaseButton.vue'

const props = defineProps({
  userName: { type: String, default: '' },
  userAvatar: { type: String, default: '' },
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isMenuOpen = ref(false)

const displayName = computed(() => {
  console.log(props.userName, authStore.user, authStore.user.name)
  return props.userName || (authStore.user ? authStore.user.name : '')
})
const isAuthenticated = computed(() => authStore.isAuthenticated)

const isActive = (routeName) => route.name === routeName

const handleLogout = async () => {
  await authStore.logout()
  isMenuOpen.value = false
  router.push({ name: ROUTE_NAMES.LOGIN })
}
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full bg-white/70 shadow-[0_8px_10px_-6px_rgba(12,74,110,0.05),0_20px_25px_-5px_rgba(12,74,110,0.05)] backdrop-blur-md"
  >
    <div class="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-6 px-6 py-4">
      <!-- Logo -->
      <router-link
        :to="{ name: ROUTE_NAMES.TRIP_VIEW }"
        class="shrink-0 font-['Inter'] text-2xl leading-8 font-normal text-sky-700"
      >
        Fluid Voyager
      </router-link>

      <!-- Desktop nav -->
      <nav class="hidden items-center gap-6 md:flex">
        <router-link
          v-for="link in USER_HEADER_NAV_LINKS"
          :key="link.name"
          :to="{ name: link.name }"
          class="font-['Inter'] text-base leading-6 font-medium transition-colors"
          :class="isActive(link.name) ? 'text-sky-700' : 'text-slate-500 hover:text-sky-600'"
        >
          {{ link.label }}
        </router-link>
      </nav>

      <!-- Actions -->
      <div class="hidden items-center gap-2 md:flex">
        <!-- Bell -->
        <BaseButton
          html-type="button"
          type="outline"
          size="sm"
          class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-sky-50 hover:text-sky-700"
          aria-label="Notifications"
        >
          <UIcon name="i-heroicons-bell" class="h-5 w-5" />
        </BaseButton>

        <!-- Avatar / User -->
        <div class="flex items-center gap-2 rounded-lg px-2 py-1 text-slate-500">
          <img
            v-if="userAvatar"
            :src="userAvatar"
            :alt="displayName"
            class="h-8 w-8 rounded-full object-cover"
          />
          <UIcon v-else name="i-heroicons-user-circle" class="h-8 w-8" />
          <span v-if="displayName" class="text-sm font-medium text-slate-700 max-lg:hidden">
            {{ displayName }}
          </span>
        </div>

        <router-link
          v-if="!isAuthenticated"
          :to="{ name: ROUTE_NAMES.REGISTER }"
          class="rounded-lg px-3 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50"
        >
          Register
        </router-link>

        <BaseButton
          v-else
          html-type="button"
          type="outline"
          size="sm"
          class="rounded-lg px-3 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
          @click="handleLogout"
        >
          Logout
        </BaseButton>
      </div>

      <!-- Mobile hamburger -->
      <BaseButton
        html-type="button"
        type="outline"
        size="sm"
        class="rounded-lg p-2 text-slate-500 transition-colors hover:bg-sky-50 hover:text-sky-700 md:hidden"
        :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      >
        <UIcon :name="isMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'" class="h-5 w-5" />
      </BaseButton>
    </div>

    <!-- Mobile menu -->
    <nav
      v-if="isMenuOpen"
      class="flex flex-col gap-1 border-t border-gray-100 bg-white/90 px-6 py-4 backdrop-blur-md md:hidden"
    >
      <router-link
        v-for="link in USER_HEADER_NAV_LINKS"
        :key="link.name"
        :to="{ name: link.name }"
        class="rounded-lg px-3 py-2.5 font-['Inter'] text-base font-medium transition-colors"
        :class="
          isActive(link.name)
            ? 'bg-sky-50 text-sky-700'
            : 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'
        "
        @click="isMenuOpen = false"
      >
        {{ link.label }}
      </router-link>

      <div class="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
        <div class="flex items-center gap-2">
          <img
            v-if="userAvatar"
            :src="userAvatar"
            :alt="displayName"
            class="h-8 w-8 rounded-full object-cover"
          />
          <UIcon v-else name="i-heroicons-user-circle" class="h-8 w-8 text-slate-400" />
          <span v-if="displayName" class="text-sm font-medium text-slate-700">
            {{ displayName }}
          </span>
        </div>

        <router-link
          v-if="!isAuthenticated"
          :to="{ name: ROUTE_NAMES.REGISTER }"
          class="rounded-lg px-3 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50"
          @click="isMenuOpen = false"
        >
          Register
        </router-link>

        <BaseButton
          v-else
          html-type="button"
          type="outline"
          size="sm"
          class="text-sm font-medium text-red-500 transition-colors hover:text-red-600"
          @click="handleLogout"
        >
          Logout
        </BaseButton>
      </div>
    </nav>
  </header>
</template>
