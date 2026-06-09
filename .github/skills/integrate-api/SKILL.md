---
name: integrate-api
description: "Integrate a backend API endpoint into the Vue project by generating or appending API service functions. Use when: adding a new API call, creating a service file, integrating backend endpoints, generating service functions from API docs."
argument-hint: "Provide service name and the API request details (method, path, body/params). Example: ticketService — GET /tickets?page=1&limit=10"
---

# Integrate API — Vue 3 Service Layer

Generate or update an API service file in `src/services/` based on a given API endpoint.
Always follow the architecture and rules defined in [API_SERVICE.md](API_SERVICE.md).

## When to Use

- Adding a new backend API call to the project
- Creating a new service file for a new entity
- Appending a new function to an existing service file
- When user says: "integrate API", "add API call", "generate service", "create service function"

## Reference Rules

Always follow: [API_SERVICE.md](API_SERVICE.md)

---

## Architecture Context

The Vue project API flow:

```
Vue Component
  ↓
UI Handler (Pattern A / B / C)
  ↓
Service Layer  ←  generated here
  ↓
apiClient (axios instance)
  ↓
Backend API
```

Generated services must be **compatible with the UI handler patterns** used inside Vue components.

---

## UI Integration Patterns

These are the patterns used in Vue components. Generated service functions must satisfy the contract each pattern requires.

### Pattern A — Query (GET JSON)

Component calls the service and stores result in a `ref`.

```javascript
const handleFetchTickets = async () => {
  loading.value = true
  try {
    const data = await getTickets(params.value)
    tickets.value = data
  } catch (error) {
    toast.add({ title: "Error", description: error.message, color: "red" })
  } finally {
    loading.value = false
  }
}
```

**Service contract:**
- Must return `res.data`
- Must throw a normalized error object `{ code, message }`

---

### Pattern B — File Download (Blob)

Component calls the service and awaits completion. No return value expected.

```javascript
await exportRevenueReport(params.value)
```

**Service contract:**
- Must call API with `responseType: "blob"`
- Must detect file type from `Content-Type` response header
- Must trigger browser download internally
- Must return nothing (`void`)
- Must throw a normalized error `{ code, message }` — parsing JSON from the Blob error if needed

---

### Pattern C — Mutation (POST / PUT / DELETE)

Component calls the service, then refreshes data on success.

```javascript
await deleteTicket(id)
await handleFetchTickets()
```

**Service contract:**
- Must return `res.data`
- Must throw a normalized error object `{ code, message }`

---

## Procedure

### Step 1 — Detect the target service file

Convert the service name from the user's argument into a file path:

| User input | Target file |
|------------|-------------|
| `ticketService` | `src/services/ticketService.js` |
| `authService` | `src/services/authService.js` |
| `revenueService` | `src/services/revenueService.js` |
| `tripService` | `src/services/tripService.js` |

---

### Step 2 — Check whether the file exists

Use `file_search` to check if the target service file already exists.

- **File exists** → read its contents, then **append** the new function at the end. Never overwrite existing functions.
- **File does not exist** → create a new file with the base import template:

```javascript
import apiClient from "@/services/axios"
```

> Never import `axios` directly. Always use `apiClient`.

---

### Step 3 — Apply REST naming conventions

Derive the function name from the HTTP method and endpoint:

| HTTP method | Endpoint pattern | Generated function |
|-------------|------------------|--------------------|
| `GET` | `/resource` | `get<Resources>(params)` |
| `GET` | `/resource/:id` | `get<Resource>ById(id)` |
| `POST` | `/resource` | `create<Resource>(data)` |
| `PUT` | `/resource/:id` | `update<Resource>(id, data)` |
| `DELETE` | `/resource/:id` | `delete<Resource>(id)` |

**Examples:**

```
GET  /tickets          →  getTickets(params)
GET  /tickets/:id      →  getTicketById(id)
POST /tickets          →  createTicket(data)
PUT  /tickets/:id      →  updateTicket(id, data)
DELETE /tickets/:id    →  deleteTicket(id)
```

---

### Step 4 — Detect response type

Before writing the function, determine if the endpoint returns **JSON** or a **Blob file**.

**Treat as Blob if any of these apply:**
- Endpoint path contains: `export`, `download`, `report`, `excel`, `pdf`, `invoice`, `csv`
- API documentation says: "returns file", "download", "binary response"
- HTTP method is `GET` with no JSON response schema documented

**Default:** treat all other endpoints as JSON.

---

### Step 5 — Choose the correct axios request pattern

| Request type | Axios pattern |
|--------------|---------------|
| Query params | `apiClient.get("/tickets", { params })` |
| Path param | `apiClient.get(\`/tickets/${id}\`)` |
| POST body | `apiClient.post("/tickets", data)` |
| PUT with path + body | `apiClient.put(\`/tickets/${id}\`, data)` |
| DELETE with path | `apiClient.delete(\`/tickets/${id}\`)` |
| Blob download | `apiClient.get("/revenue/export", { params, responseType: "blob" })` |

---

### Step 6 — Generate the service function

Use the matching implementation template below.

---

## Implementation Templates

### Template A — JSON Response (GET / POST / PUT / DELETE)

```javascript
export const getTickets = async (params) => {
  try {
    const res = await apiClient.get("/tickets", { params })
    return res.data
  } catch (error) {
    const message = error?.message || "Unexpected error"
    throw { code: error?.code || 500, message }
  }
}
```

**Rules:**
- Always return `res.data`
- Always normalize the caught error to `{ code, message }`
- Error is already unwrapped by the interceptor — use `error?.message` and `error?.code` directly
- Never add UI logic (toast, modal, alert)

---

### Template B — Blob File Download

```javascript
export const exportRevenueReport = async (params) => {
  try {
    const res = await apiClient.get("/revenue/export", {
      params,
      responseType: "blob"
    })

    const contentType = res.headers["content-type"] || ""
    let ext = "bin"
    if (contentType.includes("spreadsheetml")) ext = "xlsx"
    else if (contentType.includes("pdf"))      ext = "pdf"
    else if (contentType.includes("csv"))      ext = "csv"

    const filename = `export_${Date.now()}.${ext}`
    const url = URL.createObjectURL(res.data)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    let message = "Unexpected error"
    let code = error.response?.status || 500

    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text()
        const json = JSON.parse(text)
        message = json.message || message
        code = json.code || code
      } catch (_) {}
    }

    throw { code, message }
  }
}
```

**Rules:**
- Always use `responseType: "blob"`
- Always detect file extension from `Content-Type` — never hardcode the extension
- Always call `URL.revokeObjectURL` after triggering the download
- Always parse JSON from Blob error responses before throwing
- Return nothing (`void`)

---

### Template C — Mutation with path param (PUT / DELETE)

```javascript
export const deleteTicket = async (id) => {
  try {
    const res = await apiClient.delete(`/tickets/${id}`)
    return res.data
  } catch (error) {
    const message = error?.message || "Unexpected error"
    throw { code: error?.code || 500, message }
  }
}

export const updateTicket = async (id, data) => {
  try {
    const res = await apiClient.put(`/tickets/${id}`, data)
    return res.data
  } catch (error) {
    const message = error?.message || "Unexpected error"
    throw { code: error?.code || 500, message }
  }
}
```

---

## Critical Rules — Enforce Always

| Rule | Requirement |
|------|-------------|
| Import axios directly | ❌ Never |
| Call toast / modal inside service | ❌ Never |
| Manage loading state in service | ❌ Never |
| Use apiClient for all requests | ✅ Always |
| Return `res.data` for JSON APIs | ✅ Always |
| Throw `{ code, message }` on error | ✅ Always |
| Use `error?.message` / `error?.code` (not `error.response?.data`) | ✅ Always |
| Parse JSON from Blob error responses | ✅ Always (Blob only) |
| Detect file extension from Content-Type | ✅ Always (Blob only) |
| Append to existing file, never overwrite | ✅ Always |

---

## Usage Examples

### Example 1 — Append JSON GET function

**Input:**
```
Service: ticketService
Request: GET /tickets?page=1&limit=10
```

**Action:** file `src/services/ticketService.js` exists → append:

```javascript
export const getTickets = async (params) => {
  try {
    const res = await apiClient.get("/tickets", { params })
    return res.data
  } catch (error) {
    const message = error?.message || "Unexpected error"
    throw { code: error?.code || 500, message }
  }
}
```

---

### Example 2 — Create new service file with POST function

**Input:**
```
Service: authService
Request: POST /auth/login
Body: { email, password }
```

**Action:** file does not exist → create `src/services/authService.js`:

```javascript
import apiClient from "@/services/axios"

export const login = async (data) => {
  try {
    const res = await apiClient.post("/auth/login", data)
    return res.data
  } catch (error) {
    const message = error?.message || "Unexpected error"
    throw { code: error?.code || 500, message }
  }
}
```

---

### Example 3 — Blob export function

**Input:**
```
Service: revenueService
Request: GET /reports/revenue/export
Params: { startDate, endDate }
Note: returns Excel file
```

**Action:** append to `src/services/revenueService.js`:

```javascript
export const exportRevenueReport = async (params) => {
  try {
    const res = await apiClient.get("/reports/revenue/export", {
      params,
      responseType: "blob"
    })

    const contentType = res.headers["content-type"] || ""
    let ext = "bin"
    if (contentType.includes("spreadsheetml")) ext = "xlsx"
    else if (contentType.includes("pdf"))      ext = "pdf"
    else if (contentType.includes("csv"))      ext = "csv"

    const filename = `revenue_${Date.now()}.${ext}`
    const url = URL.createObjectURL(res.data)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    let message = "Unexpected error"
    let code = error.response?.status || 500

    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text()
        const json = JSON.parse(text)
        message = json.message || message
        code = json.code || code
      } catch (_) {}
    }

    throw { code, message }
  }
}
```

---

### Example 4 — DELETE mutation

**Input:**
```
Service: ticketService
Request: DELETE /tickets/:id
```

**Action:** append to `src/services/ticketService.js`:

```javascript
export const deleteTicket = async (id) => {
  try {
    const res = await apiClient.delete(`/tickets/${id}`)
    return res.data
  } catch (error) {
    const message = error?.message || "Unexpected error"
    throw { code: error?.code || 500, message }
  }
}
```
