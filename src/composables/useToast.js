/**
 * useToast — global toast notification system.
 *
 * Usage:
 *   const toast = useToast()
 *   toast.success('Saved!')
 *   toast.error('Something went wrong')
 *   toast.warning('Check your input')
 *   toast.info('New update available')
 *
 * The ToastContainer component must be mounted once in App.vue.
 */
import { ref } from 'vue'

// Shared reactive state (module-level singleton)
const toasts = ref([])

let idCounter = 0

function push(message, type = 'info', duration = 3500) {
  const id = `toast-${++idCounter}`
  toasts.value.push({ id, message, type, duration })
  if (duration > 0) setTimeout(() => dismiss(id), duration)
}

function dismiss(id) {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index !== -1) toasts.value.splice(index, 1)
}

export function useToast() {
  return {
    toasts,
    dismiss,
    success: (message, duration) => push(message, 'success', duration),
    error: (message, duration) => push(message, 'error', duration),
    warning: (message, duration) => push(message, 'warning', duration),
    info: (message, duration) => push(message, 'info', duration),
  }
}
