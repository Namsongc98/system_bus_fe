/**
 * @param {string} key
 * @param {*} value
 */
export function setStorage(key, value) {
  storage.set(key, value)
}

/**
 * @param {string} key
 * @returns {*}
 */
export function getStorage(key) {
  return storage.get(key)
}

/**
 * @param {string} key
 */
export function removeStorage(key) {
  storage.remove(key)
}

export function clearStorage() {
  storage.clear()
}
// ─── Local Storage Helpers ────────────────────────────────────────────────────

/**
 * Thin wrappers around localStorage for typed get/set/remove operations.
 * All values are JSON-serialised to support objects and arrays.
 */

export const storage = {
  /**
   * Persist a value under the given key.
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    try {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.error(`[storage] Failed to set key "${key}"`)
    }
  },

  /**
   * Retrieve a value by key. Returns null when missing or on parse error.
   * @param {string} key
   * @returns {*|null}
   */
  get(key) {
    try {
      if (typeof localStorage === 'undefined') return null
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch {
      console.error(`[storage] Failed to get key "${key}"`)
      return null
    }
  },

  /**
   * Remove a single key from localStorage.
   * @param {string} key
   */
  remove(key) {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(key)
  },

  /**
   * Clear the entire localStorage (use with caution).
   */
  clear() {
    if (typeof localStorage === 'undefined') return
    localStorage.clear()
  },
}
