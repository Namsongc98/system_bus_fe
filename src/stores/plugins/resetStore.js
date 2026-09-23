// Setup stores have no built-in $reset. This plugin snapshots each store's initial
// state so a session wipe can return every store to it (no data from the previous
// account survives a logout or a JWT error in the same tab).
// Stores are tracked per Pinia instance, so a reset never touches another app's stores.
const storesByPinia = new WeakMap()

function cloneState(state) {
  return JSON.parse(JSON.stringify(state))
}

export function resetStorePlugin({ pinia, store }) {
  const initialState = cloneState(store.$state)
  store.$reset = () => {
    store.$patch((state) => Object.assign(state, cloneState(initialState)))
  }
  if (!storesByPinia.has(pinia)) storesByPinia.set(pinia, new Set())
  storesByPinia.get(pinia).add(store)
}

/**
 * Reset every store created so far in the given Pinia, except the given store ids.
 * @param {import('pinia').Pinia} pinia
 * @param {string[]} exceptIds
 */
export function resetAllStores(pinia, exceptIds = []) {
  for (const store of storesByPinia.get(pinia) ?? []) {
    if (!exceptIds.includes(store.$id)) store.$reset()
  }
}
