<script setup>
// AdminLayout — Sidebar + Header + page slot
import AppSidebar from '@/components/layout/admin/Sidebar.vue'
import AppHeader from '@/components/layout/admin/Header.vue'
</script>

<template>
  <div class="flex min-h-dvh bg-slate-100 text-slate-950">
    <AppSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader />
      <main class="flex-1 overflow-y-auto px-6 py-6 max-md:px-4">
        <RouterView />
      </main>
    </div>
  </div>
</template>
