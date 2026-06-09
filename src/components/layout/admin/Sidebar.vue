<script setup>
// AppSidebar — admin navigation menu
// Nav items are driven by ROUTE_NAMES constants
import { ADMIN_SIDEBAR_NAV_ITEMS } from '@/constants/admin/sidebar'
import { ROUTE_NAMES } from '@/constants/routes'
</script>

<template>
  <aside
    class="sticky top-0 flex h-dvh w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 max-md:hidden"
  >
    <RouterLink
      :to="{ name: ROUTE_NAMES.ADMIN_DASHBOARD }"
      class="flex items-center gap-3 rounded-lg px-3 py-2"
    >
      <span
        class="flex size-9 items-center justify-center rounded-lg bg-sky-700 text-sm font-black text-white"
      >
        FV
      </span>
      <span class="min-w-0">
        <span class="block truncate text-sm font-bold text-slate-950">Fluid Voyager</span>
        <span class="block truncate text-xs font-medium text-slate-500">Admin Console</span>
      </span>
    </RouterLink>

    <nav class="mt-8 flex flex-1 flex-col gap-1">
      <RouterLink
        v-for="item in ADMIN_SIDEBAR_NAV_ITEMS"
        :key="item.name"
        :to="{ name: item.name }"
        class="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        active-class="bg-sky-50 text-sky-700"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="rounded-lg bg-slate-100 px-3 py-3 text-xs leading-5 text-slate-600">
      Manage tickets, trips, buses, users, and revenue from one place.
    </div>
  </aside>
</template>
