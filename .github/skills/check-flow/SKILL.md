---
name: check-flow
description: Debug a complete application flow in a Vue/Nuxt project by tracing logic from UI → Store → Service → API. Use when: a feature is broken but the source is unclear, tracing an auth flow, debugging a form submission, diagnosing why data is not rendering, or identifying where async logic fails.
argument-hint: "Describe the feature flow and paste component, store, and service code."
---

# Skill: check-flow

Trace and debug a full feature flow in a Vue 3 / Nuxt 3 project across all layers: Component → Store → Service → Axios → Backend.

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Nuxt 3**
- **Pinia** (Composition API store syntax)
- **Axios** via the single `apiClient` (through Kong)
- **Nuxt UI**
- **Vue Router**

---

## Typical Flow

```
User Action
  → Vue Component (event handler)
  → Pinia Store (action)
  → API Service (axios call)
  → Axios request (with interceptors)
  → Backend response { code, message, data }
  → Store state update
  → UI re-render
```

---

## Procedure

### Step 1 — Identify Entry Point

Detect where the flow starts. Common entry points:

| Type | Example |
|---|---|
| Button click | `@click="handleSubmit"` |
| Form submit | `@submit.prevent="handleLogin"` |
| Lifecycle | `onMounted(() => fetchData())` |
| Watcher | `watch(route, () => loadPage())` |
| Router guard | `beforeEach` in `router/guards.js` |

**Check:** Does the entry point actually call the intended function?

---

### Step 2 — Trace Component Logic

Inspect the Vue component `<script setup>` block.

**Verify:**
- [ ] Event handler exists (not undefined)
- [ ] Function is correctly bound in template
- [ ] Async handler uses `await`
- [ ] Correct store action is called
- [ ] `storeToRefs` used when destructuring reactive state from store
- [ ] Error is caught with `try/catch`

**Common mistakes:**

```js
// ❌ Wrong — missing await, store action runs but result is lost
const handleLogin = () => {
  authStore.login(form.value)
}

// ✅ Correct
const handleLogin = async () => {
  await authStore.login(form.value)
}
```

```js
// ❌ Wrong — destructured state is not reactive
const { user } = authStore

// ✅ Correct — use storeToRefs
const { user } = storeToRefs(authStore)
```

---

### Step 3 — Trace Pinia Store

Inspect the store file (e.g., `src/stores/auth.js`).

**Verify:**
- [ ] Action exists and is `async`
- [ ] Correct service function is imported
- [ ] Service is awaited (`await authService.login(...)`)
- [ ] State is updated after successful response
- [ ] Error is rethrown so component can catch it
- [ ] No direct state mutation outside an action

**Common mistakes:**

```js
// ❌ Wrong — not async, result lost
login(credentials) {
  authService.login(credentials)
}

// ✅ Correct
async login(credentials) {
  const res = await authService.login(credentials)
  const tokenData = res.data?.data ?? res.data
  setTokens(tokenData)
}
```

```js
// ❌ Wrong — swallowed error, component never knows it failed
async login(credentials) {
  try {
    await authService.login(credentials)
  } catch (err) {
    console.error(err) // component receives undefined, flow ends silently
  }
}

// ✅ Correct — rethrow so component can show toast
async login(credentials) {
  try {
    const res = await authService.login(credentials)
    setTokens(res.data?.data ?? res.data)
  } catch (err) {
    throw err
  }
}
```

---

### Step 4 — Trace API Service

Inspect the service file (e.g., `src/services/authService.js`).

**Verify:**
- [ ] Shared `apiClient` (default export of `./axios`) is imported
- [ ] Correct HTTP method (`get`, `post`, `put`, `delete`)
- [ ] Endpoint constant used (not hardcoded string)
- [ ] Params passed as `{ params }` for GET, body directly for POST/PUT
- [ ] Response returned to caller

**Common mistakes:**

```js
// ❌ Wrong — params sent as body in GET
apiClient.get(ENDPOINT, body)

// ✅ Correct
apiClient.get(ENDPOINT, { params })

// ❌ Wrong — calling a service port directly bypasses Kong
axios.post('http://localhost:8081/api/booking', payload)

// ✅ Correct — one client for every API; Kong routes /api/booking to the booking service
import apiClient from './axios'
export const createBooking = (payload) => apiClient.post(API_ENDPOINTS.BOOKING.BASE, payload)
```

---

### Step 5 — Check Backend Response Handling

**Backend response format:**

```json
{
  "code": 200,
  "message": "Success",
  "data": { ... }
}
```

**Verify:**
- [ ] Service returns `res.data` (not `res`)
- [ ] Store extracts `res.data?.data ?? res.data` when payload is nested
- [ ] Component reads the correct property from store state
- [ ] Error response `{ code, message, data: null }` is surfaced via `err.response.data.message`

**Common mistake:**

```js
// ❌ Wrong — response not destructured, token is undefined
const res = await authService.login(credentials)
setTokens(res.accessToken) // undefined

// ✅ Correct — API wraps token in nested data
const res = await authService.login(credentials)
const tokenData = res.data?.data ?? res.data
setTokens(tokenData)
```

---

### Step 6 — Check UI Rendering

Inspect the component template.

**Verify:**
- [ ] Template binds to reactive `ref` or `storeToRefs` result
- [ ] `v-if` guards exist for data that may be `null` or `undefined`
- [ ] `computed` values reference correct reactive source
- [ ] Conditional classes/styles react to correct state

**Common mistake:**

```html
<!-- ❌ Wrong — crashes if user is null -->
<p>{{ user.name }}</p>

<!-- ✅ Correct -->
<p v-if="user">{{ user.name }}</p>
```

---

## Output Format

When analyzing a flow, return:

### 1. Flow Summary
Describe each layer and whether it appears correct.

### 2. Where the Flow Breaks
Identify the exact layer (Component / Store / Service / Axios / Response parsing / Template).

### 3. Root Cause
One concise sentence explaining the core problem.

### 4. Minimal Fix
Only the changed lines — no full rewrites.

```js
// Before
authStore.login(form.value)

// After
await authStore.login(form.value)
```

### 5. Optional Improvement *(only if clearly beneficial)*
One short suggestion (e.g., add loading state, add `v-if` guard).

---

## Usage

**Command:** `/check-flow`

**Input format:**

```
Feature flow:
[Describe: User action → component → store → API]

Component:
[paste <script setup> block]

Store:
[paste store action]

Service:
[paste service function]
```

**Expected output:**

Step-by-step analysis of each layer, identifying exactly which step is broken and providing the minimal fix.

---

## Rules

- **Never rewrite entire files.** Only show the broken section and the fix.
- Focus on **one broken layer at a time** — most flows break in a single place.
- If multiple issues exist, list them in order of severity.
- Do not add unrelated improvements unless explicitly asked.
