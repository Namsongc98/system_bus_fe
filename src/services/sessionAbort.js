// One AbortController per login session. Every API request carries its signal, so
// ending the session cancels requests still in flight: a response that arrives after
// the wipe is rejected by axios instead of writing the previous account's data back
// into a freshly reset store.
let sessionController = new AbortController()

export function getSessionSignal() {
  return sessionController.signal
}

export function abortSessionRequests() {
  sessionController.abort()
  sessionController = new AbortController()
}
