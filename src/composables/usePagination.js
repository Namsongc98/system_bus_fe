import { ref, computed } from 'vue'
import { PAGINATION_DEFAULTS } from '@/constants'

/**
 * Server-side pagination state and helpers.
 * @param {{ initialPage?: number, initialSize?: number }} [options]
 */
export function usePagination(options = {}) {
  const page = ref(options.initialPage ?? PAGINATION_DEFAULTS.PAGE)
  const size = ref(options.initialSize ?? PAGINATION_DEFAULTS.PAGE_SIZE)
  const total = ref(0)

  const totalPages = computed(() => Math.ceil(total.value / size.value))
  const hasNextPage = computed(() => page.value + 1 < totalPages.value)
  const hasPrevPage = computed(() => page.value > 0)

  function nextPage() {
    if (hasNextPage.value) page.value++
  }
  function prevPage() {
    if (hasPrevPage.value) page.value--
  }
  function goToPage(n) {
    page.value = n
  }
  function reset() {
    page.value = PAGINATION_DEFAULTS.PAGE
  }

  return {
    page,
    size,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    reset,
  }
}
