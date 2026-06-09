import { ref } from 'vue'

/**
 * Manage a single modal's open/close state.
 * @returns {{ isOpen: import('vue').Ref<boolean>, open: Function, close: Function, toggle: Function }}
 */
export function useModal() {
  const isOpen = ref(false)

  function open() {
    isOpen.value = true
  }
  function close() {
    isOpen.value = false
  }
  function toggle() {
    isOpen.value = !isOpen.value
  }

  return { isOpen, open, close, toggle }
}
import { ref } from 'vue'

/**
 * Composable for managing a single modal's open/close state.
 * @returns {{ isOpen: import('vue').Ref<boolean>, open: Function, close: Function, toggle: Function }}
 */
export function useModal() {
  const isOpen = ref(false)

  function open() {
    isOpen.value = true
  }
  function close() {
    isOpen.value = false
  }
  function toggle() {
    isOpen.value = !isOpen.value
  }

  return { isOpen, open, close, toggle }
}
/**
 * useModal — imperative helper for controlling a single modal instance.
 *
 * Usage:
 *   const { isOpen, open, close, toggle } = useModal()
 *
 *   <Modal v-model="isOpen" title="...">
 *     ...
 *   </Modal>
 *
 *   <button @click="open">Open</button>
 */
import { ref } from 'vue'

export function useModal(initialState = false) {
  const isOpen = ref(initialState)

  function open() {
    isOpen.value = true
  }
  function close() {
    isOpen.value = false
  }
  function toggle() {
    isOpen.value = !isOpen.value
  }

  return { isOpen, open, close, toggle }
}
