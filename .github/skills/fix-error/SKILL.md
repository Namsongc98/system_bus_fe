---
name: fix-error
description: "Debug and fix errors in the Vue/Nuxt project by analyzing error messages, stack traces, or broken code. Use when: getting a runtime error, fixing a bug, resolving a crash, debugging axios issues, Pinia state errors, or Vue template errors."
argument-hint: "Paste the error message, stack trace, or the broken code snippet"
---

# Fix Error — Vue 3 / Nuxt 3 Debugger

Analyze the provided error or broken code, identify the root cause, and generate a minimal corrected code snippet following project architecture rules.

## Tech Stack Context

- **Vue 3** — Composition API (`<script setup>`, `ref`, `computed`, `watch`)
- **Pinia** — state management via `defineStore`
- **Axios** — via shared `apiClient` from `src/services/axios.js`
- **Nuxt UI** — `useToast()` from `@/composables/useToast`
- **Vue Router** — `useRouter`, `useRoute`

---

## Procedure

### Step 1 — Detect error source

Identify which layer the error originates from:

| Layer | Examples |
|-------|---------|
| **Vue component** | template compile error, `undefined` ref access, missing prop |
| **Composable** | incorrect reactive usage, stale closure |
| **Pinia store** | accessing state outside setup, mutation outside action |
| **API service** | wrong import, `res.data` vs `res`, missing `await` |
| **Axios** | wrong `baseURL` env var, missing `responseType`, 401 redirect loop |
| **Runtime** | `Cannot read properties of undefined`, `is not a function` |
| **Build** | unresolved import, missing env variable |

### Step 2 — Analyze the problem

Check for:

- **Syntax errors** — missing brackets, incorrect destructuring
- **Incorrect imports** — wrong path, missing named export, default vs named mismatch
- **Reactive ref misuse** — accessing `.value` on a non-ref, forgetting `.value` altogether
- **Async/await errors** — missing `await`, unhandled promise, `async` missing on function
- **Axios response misuse** — `response.data.data` vs `response.data` depending on interceptor setup
- **Pinia misuse** — destructuring store without `storeToRefs`, calling store outside component
- **Template errors** — using `undefined` object in `v-for`, missing `v-if` guard

### Step 3 — Explain the root cause

Provide a short, clear explanation of **why** the error happens.

Example:
> `user.value` is `undefined` because `ref()` was initialized without a default value. Accessing `.name` on `undefined` throws a TypeError.

### Step 4 — Generate the fix

Provide corrected code following project rules:

- Use `<script setup>` Composition API
- Use `ref(null)` or `ref([])` as safe defaults instead of bare `ref()`
- Guard optional chaining: `user.value?.name`
- Await async service calls inside `try/catch/finally`
- Follow error normalization format: `{ code, message }`

### Step 5 — Improve (optional)

If the fix allows it, suggest:

- Simplifying logic
- Adding missing loading/error state
- Improving readability
- Adding optional chaining or nullish coalescing

---

## Error Handling Reference

**Backend error format:**
```json
{
  "code": 400,
  "message": "Error message",
  "data": null
}
```

**Correct pattern in service:**
```javascript
catch (error) {
  const message = error?.message || 'Unexpected error'
  throw {
    code: error?.code || 500,
    message
  }
}
```

**Correct pattern in store:**
```javascript
catch (err) {
  error.value = err.message
  throw err
}
```

**Correct pattern in component:**
```javascript
catch (err) {
  toast.error(err?.message || 'Something went wrong')
}
```

---

## Common Fixes

### `Cannot read properties of undefined (reading 'value')`
```javascript
// ❌ Wrong
const user = ref()
console.log(user.value.name)

// ✅ Fix
const user = ref(null)
console.log(user.value?.name)
```

### `Failed to resolve import "..."`
```javascript
// ❌ Wrong
import { useToastStore } from '@/store/ui'

// ✅ Fix — correct folder is stores (plural)
import { useToast } from '@/composables/useToast'
```

### `res.data` returns full response object instead of data
```javascript
// ❌ Wrong — axios interceptor already unwraps once
const res = await apiClient.get('/tickets')
return res.data.data

// ✅ Fix — check axios.js interceptor; if it returns response (not response.data):
const res = await apiClient.get('/tickets')
return res.data  // res.data = { code, message, data: [...] }
```

### Pinia store destructured without `storeToRefs`
```javascript
// ❌ Wrong — loses reactivity
const { user, loading } = useAuthStore()

// ✅ Fix
import { storeToRefs } from 'pinia'
const authStore = useAuthStore()
const { user, loading } = storeToRefs(authStore)
```

### Missing `await` in async handler
```javascript
// ❌ Wrong
const handleLogin = async () => {
  authStore.login(form.value)  // returns Promise, not awaited
  router.push(...)             // runs immediately before login completes
}

// ✅ Fix
const handleLogin = async () => {
  await authStore.login(form.value)
  router.push(...)
}
```

### `VITE_*` env variable is undefined
```javascript
// ❌ Wrong — variable name doesn't exist in .env
baseURL: import.meta.env.VITE_API_BASE_URL

// ✅ Fix — the only API variable is the Kong gateway URL (read in src/constants/api_endpoint.js)
baseURL: import.meta.env.VITE_KONG_API_URL // e.g. http://localhost:8000/api
```

---

## Output Format

Always respond in this structure:

1. **Root cause** — one sentence explanation
2. **Fix explanation** — what needs to change and why
3. **Corrected code** — minimal change only, do not rewrite unrelated code
4. **Improvement** *(optional)* — suggest a cleaner pattern if applicable

---

## Rules

- **Never** modify unrelated code
- **Only** provide the minimal change required
- **Always** prefer Composition API patterns
- **Always** ensure Nuxt 3 / Vue 3 compatibility
- **Never** add features beyond the fix scope
