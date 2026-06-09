import { ref } from 'vue'

/**
 * Track loading and error state for any async operation.
 * @returns {{ loading: import('vue').Ref<boolean>, error: import('vue').Ref<string|null>, execute: (fn: () => Promise<any>) => Promise<any> }}
 */
export function useAsync() {
  const loading = ref(false)
  const error = ref(null)

  async function execute(fn) {
    loading.value = true
    error.value = null
    try {
      return await fn()
    } catch (err) {
      error.value = err?.message ?? 'An unexpected error occurred.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { loading, error, execute }
}
