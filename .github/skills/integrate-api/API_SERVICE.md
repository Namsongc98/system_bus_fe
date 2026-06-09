# API_SERVICE.md

---

## 1. Purpose

This document defines the standard for converting backend API documentation into reusable frontend service code for this Vue 3 / Nuxt 3 project. It is authoritative for both developers and AI code assistants (GitHub Copilot).

---

## 2. Architecture Overview

The full API call flow from component to backend:

```
Component
  ↓
Composable (useApiCall)
  ↓
Pinia Store (optional)
  ↓
Service Layer
  ↓
Axios Client (axios.js)
  ↓
Axios Interceptor
  ↓
Backend API
```

Error propagation flow:

```
Backend Error
  ↓
Axios Interceptor  →  throws ApiError
  ↓
Service            →  propagates ApiError (no try/catch)
  ↓
Store / Composable →  propagates ApiError
  ↓
Component          →  catches via useApiCall
  ↓
UI Feedback        →  toast notification or redirect
```

---

## 3. Service Location

All service files must be placed in:

```
src/services/
```

**Naming convention:** `<Entity>Service.js`

```
authService.js
ticketService.js
tripService.js
busRouteService.js
```

---

## 4. Axios Client

All services must use the shared axios instance:

```
src/services/axios.js
```

```js
import apiClient from "@/services/axios"
```

> Never import `axios` directly inside a service file.

---

## 5. Axios Interceptor & Error Unwrapping

The axios interceptor (in `axios.js`) unwraps backend errors before they reach the service caller.

**Backend error format:**

```json
{
  "code": 400,
  "message": "Error message",
  "data": null
}
```

**Actual interceptor behavior (`src/services/axios.js`):**

```js
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/')
    if (error.response?.status === 401 && !isAuthEndpoint) {
      removeStorage(LOCAL_STORAGE_KEYS.ACCESS_TOKEN)
      removeStorage(LOCAL_STORAGE_KEYS.USER)
      router.push({ name: ROUTE_NAMES.LOGIN })
    }
    return Promise.reject(error.response?.data ?? error)
  }
)
```

The interceptor rejects with `error.response?.data ?? error`.

Errors arriving at stores and composables are already the **unwrapped backend object** `{ code, message, data }` — not a raw axios error.

Therefore catch blocks must access:

```js
catch (error) {
  const message = error?.message || "Unexpected error"
  const code    = error?.code    || 500
}
```

Because the interceptor handles unwrapping, **service functions must NOT implement try/catch**.

---

## 6. ApiError Class

All API errors are instances of `ApiError`, located at:

```
src/errors/ApiError.js
```

```js
export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}
```

In components and composables, check the error type:

```js
import { ApiError } from "@/errors/ApiError"

catch (error) {
  const message = error instanceof ApiError
    ? error.message
    : "Unexpected error"
}
```

---

## 7. Service Layer Rules

**Services MUST:**
- Call backend APIs via `apiClient`
- Format request parameters
- Return `res.data` directly
- Trigger file downloads (for Blob endpoints)

**Services MUST NOT:**
- Implement `try/catch`
- Call `toast` or any UI component
- Manage `loading` state
- Manipulate the DOM
- Import from Pinia stores

---

## 8. REST Naming Conventions

```js
getTickets(params)          // GET list
getTicketById(id)           // GET single
createTicket(data)          // POST
updateTicket(id, data)      // PUT / PATCH
deleteTicket(id)            // DELETE
```

---

## 9. Request Parameter Rules

| Type | Pattern |
|------|---------|
| Query params | `apiClient.get("/tickets", { params })` |
| Path params | `apiClient.get(\`/tickets/${id}\`)` |
| Body | `apiClient.post("/tickets", data)` |
| Both path + body | `apiClient.put(\`/tickets/${id}\`, data)` |

---

## 10. Response Handling

Service functions return `res.data` directly. No wrapping.

```js
export const getTickets = async (params) => {
  const res = await apiClient.get("/tickets", { params })
  return res.data
}

export const getTicketById = async (id) => {
  const res = await apiClient.get(`/tickets/${id}`)
  return res.data
}

export const createTicket = async (data) => {
  const res = await apiClient.post("/tickets", data)
  return res.data
}

export const updateTicket = async (id, data) => {
  const res = await apiClient.put(`/tickets/${id}`, data)
  return res.data
}

export const deleteTicket = async (id) => {
  const res = await apiClient.delete(`/tickets/${id}`)
  return res.data
}
```

---

## 11. File Download Pattern

Blob endpoints must trigger the browser download inside the service. Return nothing.

```js
export const exportRevenueReport = async (params) => {
  const res = await apiClient.get("/reports/revenue", {
    params,
    responseType: "blob"
  })

  const blob = new Blob([res.data])
  const url = window.URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = "report.xlsx"
  link.click()

  window.URL.revokeObjectURL(url)
}
```

---

## 12. useApiCall Composable

Components must use `useApiCall` to standardize loading state, error handling, and success feedback.

```
src/composables/useApiCall.js
```

**Composable interface:**

```js
const { execute, loading, error } = useApiCall()
```

**Pattern A — GET (fetch data):**

```js
await execute(
  () => getTickets(params.value),
  {
    onSuccess: (data) => {
      tickets.value = data
    }
  }
)
```

**Pattern B — File download:**

```js
await execute(
  () => exportRevenueReport(params.value),
  {
    successMessage: "Export started"
  }
)
```

**Pattern C — Mutation (POST / PUT / DELETE):**

```js
await execute(
  () => deleteTicket(id),
  {
    successMessage: "Deleted successfully",
    onSuccess: handleFetchTickets
  }
)
```

> Components must NOT call service functions directly. Always go through `useApiCall` or a store action.

---

## 13. Pinia Store Rules

Stores may wrap service calls to share state across components.

**Flow:**

```
Component → Store → Service → API
```

Stores must NOT call `apiClient` directly.

```js
// src/stores/ticketStore.js
import { defineStore } from "pinia"
import { ref } from "vue"
import { getTickets } from "@/services/ticketService"

export const useTicketStore = defineStore("ticket", () => {
  const tickets = ref([])

  const fetchTickets = async (params) => {
    const data = await getTickets(params)
    tickets.value = data
  }

  return {
    tickets,
    fetchTickets
  }
})
```

In a component that already imports a store, call the store action — do not import the service separately:

```js
// CORRECT
await ticketStore.fetchTickets(params.value)

// WRONG — bypasses store
await getTickets(params.value)
```

---

## 14. Folder Structure

```
src/
 ├── services/
 │     axios.js
 │     authService.js
 │     ticketService.js
 │     tripService.js
 │
 ├── errors/
 │     ApiError.js
 │
 ├── composables/
 │     useApiCall.js
 │
 ├── stores/
 │     auth.js
 │     ticket.js
 │
 └── utils/
       errorHandler.js
```

---

## 15. Full Conversion Example

**API documentation input:**

```
GET /tickets
Query: page, limit, status
Response: { data: Ticket[], total: number }
```

**Generated service (`ticketService.js`):**

```js
import apiClient from "@/services/axios"

export const getTickets = async (params) => {
  const res = await apiClient.get("/tickets", { params })
  return res.data
}
```

**Component usage via `useApiCall`:**

```js
const { execute, loading } = useApiCall()
const tickets = ref([])

const handleFetchTickets = async () => {
  await execute(
    () => getTickets(params.value),
    {
      onSuccess: (data) => {
        tickets.value = data
      }
    }
  )
}
```

---

## 16. Rules Summary for Copilot

| Rule | Requirement |
|------|-------------|
| Service has try/catch | ❌ Never |
| Service calls toast | ❌ Never |
| Service calls apiClient | ✅ Always |
| Service returns res.data | ✅ Always |
| Errors normalized by interceptor | ✅ Always |
| Component uses useApiCall | ✅ Always |
| Store calls service (not axios) | ✅ Always |
| ApiError used for all API errors | ✅ Always |

---

## 17. Reference

Always consult [API_DOCUMENTATION.md](../../API_DOCUMENTATION.md) when generating new service functions.
