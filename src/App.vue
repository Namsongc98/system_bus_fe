<script setup>
// App root — layout rendering is delegated to each route via RouterView
import ToastContainer from '@/components/common/ToastContainer.vue'
</script>

<template>
  <UApp>
    <RouterView />
    <ToastContainer />
  </UApp>
</template>
