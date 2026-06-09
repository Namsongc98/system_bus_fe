---
name: wire-api-to-event
description: "Wire an API service call into a Vue component button event handler. Use when: connecting an API to a button click, wiring up a service call to an action, integrating an API into an existing event handler, binding a service function to a template event."
argument-hint: "Point to the event handler function in the component, then specify which service and API function to call (e.g. ticketService.getTickets)"
---

# Wire API to Event — Vue 3 / Nuxt 3 Component

Read the target component file and the pointed event handler, then wire the API call following project architecture conventions.

## When to Use

- User points to a `@click`, `@submit`, or any event handler in a Vue SFC template
- Binding a service/store/composable call to an existing handler that is empty or incomplete
- When user says: "wire this API to the button", "connect service to this event", "call this API on click"

## Reference Rules

Always follow:
- [API_SERVICE.md](../integrate-api/API_SERVICE.md)
- [PINIA_STORE.md](../api-pinia-store/PINIA_STORE.md)

---

## Procedure

### Step 1 — Read the component file

Use `read_file` to read the **full** component pointed to by the user.

Identify:
1. The **event handler function** name (e.g. `handleExport`, `onSubmit`, `deleteUser`)
2. The **template element** that triggers it (button, form, etc.)
3. All existing `<script setup>` imports, refs, and composable calls

### Step 2 — Detect Architecture Pattern

Inspect the `<script setup>` block **before writing any code**.

**Priority order — use the highest-level abstraction already present:**

| Already imported in component | Use this |
|-------------------------------|----------|
| Pinia store (e.g. `useTicketStore`) | Call the **store action** |
| Composable (e.g. `useTickets`) | Call the **composable method** |
| Neither | Import and call the **service directly** |

> Never introduce a service import when a store or composable already wraps it.

### Step 3 — Identify the service and function to call

From the user's instruction, resolve the call target based on the detected architecture:

**Direct service (no store/composable present):**

| User input | Resolved import |
|------------|-----------------|
| `ticketService.getTickets` | `import { getTickets } from "@/services/ticketService"` |
| `revenueService.exportRevenueReport` | `import { exportRevenueReport } from "@/services/revenueService"` |
| `authService.login` | `import { login } from "@/services/authService"` |

**Store action (store already imported):**
```javascript
// Call the action instead of the service
await ticketStore.fetchTickets(params.value)
```

**Composable method (composable already imported):**
```javascript
// Call the composable method instead of the service
await fetchTickets(params.value)
```

If the service file does not export the function yet, remind the user to run `/integrate-api` first.

### Step 4 — Prevent Duplicate Imports

Before adding any import statement:

1. Scan all existing `import` lines in `<script setup>`.
2. Check if the symbol is already imported — from `"vue"`, `"@/services/..."`, or any other source.
3. If the import already exists, **do not add it again**.

```javascript
// WRONG — duplicate import
import { ref } from "vue"
import { ref } from "vue"

// CORRECT — add only what is missing
import { ref, computed } from "vue"  // merge into existing vue import if present
```

### Step 5 — Ensure Event Handler is Async

Check the handler signature.

If it is defined as a synchronous arrow function, convert it:

```javascript
// Before
const handleExport = () => {}

// After
const handleExport = async () => {}
```

Do not modify any other aspect of the function signature.

### Step 6 — Detect Existing State

Before declaring any new variable, check if it already exists in `<script setup>`.

Common variables to check:

| Variable | Check before adding |
|----------|---------------------|
| `loading` | `const loading = ref(...)` |
| `items` / `data` | `const items = ref(...)` |
| `error` | `const error = ref(...)` |
| `toast` | `const toast = useToast()` |

Do NOT declare duplicates.

### Step 7 — Infer Parameters from Component Context

When calling the API function, inspect the component for existing refs to use as arguments.

Check for (in order of preference):

1. `form.value` — for POST/PUT mutations with form data
2. `params.value` / `filters.value` — for GET requests with query params
3. `selectedId` / `route.params.id` — for single-resource operations
4. No argument — if the function takes none

> Do NOT invent parameters that do not exist in the component.

### Step 8 — Determine Response Type

Inspect the service function in `src/services/` to identify its return type:

| Return type | Handling strategy |
|-------------|-------------------|
| JSON object / array | Store result in a `ref`, expose to template |
| Blob (file download) | No return ref needed; download triggered inside service |
| Mutation (POST / PUT / DELETE) | Show success toast; optionally call a fetch handler to refresh |

### Step 9 — Add Required State

Add **only** the state variables that are missing after Step 6's check:

```javascript
// Add if loading feedback is needed and not already declared
const loading = ref(false)

// Add if storing a JSON result and not already declared
const items = ref([])

// Add if toast is needed and not already declared
const toast = useToast()
```

### Step 10 — Generate the Event Handler Body

Use the matched pattern below. Apply only what the response type requires.

---

**Pattern A — JSON GET (fetch list or detail):**
```javascript
const handleFetchTickets = async () => {
  loading.value = true
  try {
    const data = await getTickets(params.value)
    tickets.value = data
  } catch (error) {
    const message = error?.message || "Unexpected error"
    toast.add({ title: "Error", description: message, color: "red" })
  } finally {
    loading.value = false
  }
}
```

**Pattern A (store variant):**
```javascript
const handleFetchTickets = async () => {
  loading.value = true
  try {
    await ticketStore.fetchTickets(params.value)
  } catch (error) {
    const message = error?.message || "Unexpected error"
    toast.add({ title: "Error", description: message, color: "red" })
  } finally {
    loading.value = false
  }
}
```

---

**Pattern B — Blob download (Excel / PDF):**
```javascript
const handleExport = async () => {
  loading.value = true
  try {
    await exportRevenueReport(params.value)
    // download is triggered inside the service
  } catch (error) {
    const message = error?.message || "Unexpected error"
    toast.add({ title: "Export failed", description: message, color: "red" })
  } finally {
    loading.value = false
  }
}
```

---

**Pattern C — Mutation (POST / PUT / DELETE):**
```javascript
const handleDelete = async (id) => {
  loading.value = true
  try {
    await deleteTicket(id)
    toast.add({ title: "Success", description: "Deleted successfully", color: "green" })
    await handleFetchTickets() // refresh list if applicable
  } catch (error) {
    const message = error?.message || "Unexpected error"
    toast.add({ title: "Error", description: message, color: "red" })
  } finally {
    loading.value = false
  }
}
```

---

> **Error handling rule:** Always extract the message as:
> ```javascript
> const message = error?.message || "Unexpected error"
> ```
> Never pass `error.message` directly — it may be undefined.

### Step 11 — Bind Loading State to Button

Use Nuxt UI `UButton` (preferred in this project):

```html
<UButton @click="handleExport" :loading="loading" :disabled="loading">
  Export
</UButton>
```

For plain HTML buttons:
```html
<button @click="handleExport" :disabled="loading">
  {{ loading ? "Exporting..." : "Export" }}
</button>
```

### Step 12 — Apply Changes to the Component File

Make **only** the following targeted changes:

1. Merge missing symbols into existing `import` lines (or add new import lines if the source is new).
2. Add missing `ref` declarations and `useToast()` call.
3. Convert handler to `async` if needed.
4. Replace the handler body only — do not touch the function signature beyond `async`.
5. Update the template button to bind `:loading` / `:disabled`.

**Do NOT:**
- Overwrite unrelated existing code
- Add state or logic beyond what the API call requires
- Call `toast` from inside the service layer
- Add comments, JSDoc, or unused variables

---

## Usage Examples

### Example 1 — Direct service call (no store/composable present)

**User points to:**
```javascript
// In ProfileView.vue
const handleUpdatePassword = () => {
  // TODO
}
```
**User says:** wire `authService.updatePassword` to this handler

**Checks:**
- No `useAuthStore` or `useAuth` composable imported → use service directly
- `loading`, `toast` not declared → add both
- Handler is sync → convert to `async`
- `form.value` exists in component → use as argument

**Output — minimal changes to `ProfileView.vue`:**
```javascript
import { updatePassword } from "@/services/authService"

const loading = ref(false)
const toast = useToast()

const handleUpdatePassword = async () => {
  loading.value = true
  try {
    await updatePassword(form.value)
    toast.add({ title: "Success", description: "Password updated", color: "green" })
  } catch (error) {
    const message = error?.message || "Unexpected error"
    toast.add({ title: "Error", description: message, color: "red" })
  } finally {
    loading.value = false
  }
}
```

---

### Example 2 — Store action (store already imported)

**User points to:**
```javascript
// In TicketsAdmin.vue — useTicketStore already imported
const handleFetchTickets = async () => {
  // TODO
}
```
**User says:** wire `ticketService.getTickets` to this handler

**Checks:**
- `useTicketStore` already imported → call store action, not service
- `loading` already declared → skip
- `toast` not declared → add it

**Output:**
```javascript
// No new service import needed — store handles the service call

const toast = useToast()

const handleFetchTickets = async () => {
  loading.value = true
  try {
    await ticketStore.fetchTickets(params.value)
  } catch (error) {
    const message = error?.message || "Unexpected error"
    toast.add({ title: "Error", description: message, color: "red" })
  } finally {
    loading.value = false
  }
}
```

---

### Example 3 — Blob file download

**User points to:**
```javascript
// In RevenueReports.vue
const handleExportExcel = async () => {
  // TODO
}
```
**User says:** wire `revenueService.exportRevenueReport` to this handler

**Checks:**
- No store or composable for revenue → use service directly
- `loading`, `toast` not declared → add both
- Handler is already `async` → no conversion needed
- `filter.value` exists in component → use as argument

**Output:**
```javascript
import { exportRevenueReport } from "@/services/revenueService"

const loading = ref(false)
const toast = useToast()

const handleExportExcel = async () => {
  loading.value = true
  try {
    await exportRevenueReport(filter.value)
  } catch (error) {
    const message = error?.message || "Unexpected error"
    toast.add({ title: "Export failed", description: message, color: "red" })
  } finally {
    loading.value = false
  }
}
```
