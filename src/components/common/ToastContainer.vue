<script setup>
// ToastContainer — renders the global toast queue from the ui store
// Place once inside App.vue
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast-slide">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.type}`]"
          role="alert"
          @click="dismiss(toast.id)"
        >
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast {
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  color: #fff;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  cursor: pointer;
}

.toast--success {
  background-color: #22c55e;
}
.toast--error {
  background-color: #ef4444;
}
.toast--warning {
  background-color: #f59e0b;
}
.toast--info {
  background-color: #3b82f6;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(1rem);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
