<script setup>
// UserLayout — Header + page slot + Footer
import AppHeader from '@/components/layout/user/AppHeader.vue'
import AppFooter from '@/components/layout/user/AppFooter.vue'
</script>

<template>
  <div class="flex min-h-dvh w-full flex-col overflow-x-hidden">
    <AppHeader />
    <main class="flex flex-1 flex-col">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
