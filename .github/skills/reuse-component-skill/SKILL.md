---
name: reuse-component-skill
description: "Detect, reuse, and integrate existing reusable Vue 3 components before generating new ones. Use when: refactoring duplicate UI elements, wiring Base* components into pages, enforcing component hierarchy, preventing duplicate component creation."
argument-hint: "Provide the target file(s) and the existing reusable component(s) to integrate. Example: pages/auth/LoginPage.vue — replace inputs and buttons with BaseInput and BaseButton"
---

# Reuse Component Skill

## 1. Skill Overview

This skill guides AI assistants (GitHub Copilot, Copilot Chat) to **detect, reuse, and correctly integrate existing reusable Vue 3 components** before generating new ones.

The primary goal is to:
- Prevent duplicate component creation
- Enforce the project's strict component hierarchy
- Maximize reuse of existing `Base*` and `App*` components
- Maintain props-down / events-up architecture throughout the component tree

> Before generating any new component, AI **must** scan `src/components/` for an existing component that fulfills the same role.

---

## 2. Reusable Component Detection Rules

Before writing any new component, AI must:

1. **Scan `src/components/elements/`** for existing primitive components (`BaseButton`, `BaseInput`, `BaseCard`, etc.)
2. **Scan `src/components/common/`** for existing complex UI components (`BaseModal`, `ToastContainer`, etc.)
3. **Scan `src/components/layout/`** for existing shell components (`AppHeader`, `AppSidebar`, `AppFooter`)
4. **Check naming** — if a component with a matching `Base*` prefix exists, reuse or extend it
5. **Never create** `SeatButton`, `TripButton`, `LoginInput` etc. when `BaseButton` or `BaseInput` already exists

**Detection checklist:**
- Does a component with the same visual role already exist?
- Can the existing component be extended via props?
- Is the new component just a styled variant of an existing one?

If **any answer is YES** → reuse or extend the existing component.

---

## 3. Component Classification Strategy

AI must classify every component into the correct folder before generating it:

| Folder | Purpose | Examples |
|---|---|---|
| `components/elements/` | Stateless primitive UI units | `BaseButton`, `BaseInput`, `BaseCard`, `BaseSelect` |
| `components/common/` | Complex reusable UI blocks | `BaseModal`, `ToastContainer`, pagination widgets |
| `components/layout/` | App shell and structural regions | `AppHeader`, `AppSidebar`, `AppFooter` |
| `layouts/` | Full page layout wrappers | `AdminLayout`, `UserLayout` |
| `pages/` | Business logic entry points | `TripView`, `SeatView`, `LoginPage` |

**Classification rules:**
- A component that only receives `props` and emits events → `elements/`
- A component that composes multiple elements but has no store/service access → `common/`
- A component that renders navigation, sidebar, or header chrome → `layout/`
- A component that owns route-level state, store access, or API calls → `pages/`

---

## 4. Reuse Decision Tree

```
New UI needed?
│
├── Does an existing component in components/elements/ or components/common/ serve this role?
│   │
│   ├── YES → Is it configurable enough via props?
│   │         ├── YES → REUSE it as-is
│   │         └── NO  → EXTEND it (add new props/slots, keep backward compatible)
│   │
│   └── NO → Is it a primitive (button, input, card, badge)?
│             ├── YES → CREATE new Base* component in components/elements/
│             └── NO  → Is it a complex reusable UI block?
│                       ├── YES → CREATE in components/common/
│                       └── NO  → CREATE in pages/ or layouts/ (not reusable)
```

> When in doubt, prefer extending over creating.

---

## 5. Reusable Component Rules

### elements/ rules
- Must be **purely presentational** — no store access, no API calls
- Must communicate exclusively via `props` and `emits`
- Must use `defineProps` with typed definitions
- Must use `defineEmits` with explicit event names
- Must be prefixed with `Base`
- **Internal UI building blocks** → use **Nuxt UI** (`UInput`, `UButton`, `USelect`, `UCard`, `UIcon`...) as the implementation layer inside the component
- Wrap Nuxt UI with a `Base*` shell that exposes a clean, project-specific props/emits API

### common/ rules
- May compose multiple `elements/` components
- Must NOT call Pinia stores or service functions directly
- May use local `ref`/`computed` for internal UI state (e.g., open/close modal)
- Must be prefixed with `Base` or be clearly named by function (`ToastContainer`)
- **Internal UI building blocks** → use **Base\* components from `elements/`** first; fall back to Nuxt UI only when no `Base*` equivalent exists

### layout/ rules
- May use `<router-link>` and `<router-view>`
- Must NOT contain business logic
- Prefixed with `App`

### pages/ rules
- Own route-level state
- May call Pinia stores and service functions (via `useApiCall`)
- Coordinate data flow down to child components via props
- Handle events emitted from child components

---

## 6. Architecture Guardrails

These rules are **non-negotiable** and must never be violated:

```
components/elements  ──✗──▶  Pinia stores
components/elements  ──✗──▶  API services
components/elements  ──✗──▶  Vue Router (useRouter / useRoute)
components/common    ──✗──▶  API services
components/common    ──✗──▶  Pinia stores (except read-only global UI state)
layouts/             ──✗──▶  Business logic
```

**Allowed data flow:**

```
pages/
  └──props──▶ components/common/
                └──props──▶ components/elements/
                              └──emits──▶ components/common/
                                            └──emits──▶ pages/
```

Lower-level components must **never** import from higher-level layers.

---

## 7. Component Integration Pattern

### Rule
```
Parent → props → Child
Child  → emits → Parent
```

### Example: Page integrating BaseButton and BaseModal

**Parent page (`TripView.vue`):**
```vue
<script setup>
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { ref } from 'vue'

const isModalOpen = ref(false)

const handleBookTrip = () => {
  isModalOpen.value = true
}

const handleConfirm = () => {
  // business logic here
  isModalOpen.value = false
}
</script>

<template>
  <BaseButton label="Book Trip" variant="primary" @click="handleBookTrip" />

  <BaseModal :open="isModalOpen" title="Confirm Booking" @confirm="handleConfirm" @close="isModalOpen = false" />
</template>
```

**Key principles:**
- The page **owns** the state (`isModalOpen`)
- The page **passes data down** via props (`open`, `title`)
- The child **emits events up** (`@confirm`, `@close`)
- The child never mutates parent state directly

---

## 8. Base Component Sub-type Classification

Before writing a component, identify its **sub-type** from the Figma block:

| Sub-type | When to use | v-model? | Emits | Slots |
|---|---|---|---|---|
| **A — Interactive field** | Input, select, checkbox, toggle, date | ✅ `update:modelValue` | `update:modelValue`, `blur` | label/error optional |
| **B — Action trigger** | Button, icon-button | ❌ | `click` (guarded by disabled/loading) | icon optional |
| **C — Display / Container** | Card, avatar, badge, stat-block | ❌ | `click` only if whole block is clickable | `default`, named slots |

> **How to pick:** Block nhận text nhập? → A. Block trigger action? → B. Block chỉ hiển thị hoặc bọc nội dung? → C.

---

### Sub-type A — Interactive field template

> Derived from: labeled input block (FROM / TO / DATE fields in search form)
> Internal implementation: **use `UInput` from Nuxt UI**

```vue
<script setup>
/**
 * @typedef {Object} Props
 * @property {string}  modelValue       - Bound value (v-model)
 * @property {string}  [type='text']    - HTML input type
 * @property {string}  [placeholder=''] - Placeholder text
 * @property {string}  [label='']       - Label text above the input
 * @property {string}  [error='']       - Validation error message
 * @property {boolean} [disabled=false] - Disabled state
 * @property {string}  [size='md']      - 'sm' | 'md' | 'lg' | 'xl'
 * @property {string}  [color='gray']   - Nuxt UI color variant
 * @property {string}  [variant='outline'] - 'outline' | 'none'
 * @property {Object}  [ui={}]          - Pass-through to UInput :ui prop
 */
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue:  { type: [String, Number], default: '' },
  type:        { type: String,  default: 'text' },
  placeholder: { type: String,  default: '' },
  label:       { type: String,  default: '' },
  error:       { type: String,  default: '' },
  disabled:    { type: Boolean, default: false },
  size:        { type: String,  default: 'md' },
  color:       { type: String,  default: 'gray' },
  variant:     { type: String,  default: 'outline' },
  ui:          { type: Object,  default: () => ({}) },
})

const emit = defineEmits(['update:modelValue', 'blur'])
</script>

<template>
  <div v-bind="$attrs">
    <label v-if="label" class="block text-sm font-medium text-zinc-700 mb-1">{{ label }}</label>
    <UInput
      :type="type"
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :size="size"
      :color="error ? 'red' : color"
      :variant="variant"
      :ui="ui"
      @update:model-value="emit('update:modelValue', $event)"
      @blur="emit('blur', $event)"
    >
      <template v-if="$slots.leading" #leading="slotProps">
        <slot name="leading" v-bind="slotProps" />
      </template>
      <template v-if="$slots.trailing" #trailing="slotProps">
        <slot name="trailing" v-bind="slotProps" />
      </template>
    </UInput>
    <span v-if="error" class="text-red-500 text-xs mt-1 block">{{ error }}</span>
  </div>
</template>
```

---

### Sub-type B — Action trigger template

> Derived from: submit-button block (Search Trips / Book / Select)
> Internal implementation: **use `UButton` from Nuxt UI**

```vue
<script setup>
/**
 * @typedef {Object} Props
 * @property {string}  [label='']          - Button text (or use default slot)
 * @property {string}  [htmlType='button'] - 'button' | 'submit' | 'reset'
 * @property {string}  [type='primary']    - Visual variant: 'primary' | 'secondary' | 'outline'
 * @property {string}  [size='md']         - 'sm' | 'md' | 'lg'
 * @property {boolean} [loading=false]     - Loading spinner state
 * @property {boolean} [disabled=false]    - Disabled state
 * @property {boolean} [block=false]       - Full-width button
 */
defineOptions({ inheritAttrs: false })

const props = defineProps({
  label:    { type: String,  default: '' },
  htmlType: { type: String,  default: 'button' },
  type:     { type: String,  default: 'primary', validator: v => ['primary','secondary','outline'].includes(v) },
  size:     { type: String,  default: 'md' },
  loading:  { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block:    { type: Boolean, default: false },
})

const emit = defineEmits(['click'])
</script>

<template>
  <UButton
    v-bind="$attrs"
    :type="htmlType"
    :loading="loading"
    :disabled="disabled || loading"
    :block="block"
    @click="!disabled && !loading && emit('click')"
  >
    <template v-if="$slots['icon-left']" #leading>
      <slot name="icon-left" />
    </template>
    <slot>{{ label }}</slot>
    <template v-if="$slots['icon-right']" #trailing>
      <slot name="icon-right" />
    </template>
  </UButton>
</template>
```

---

### Sub-type C — Display / Container template

> Derived from: trip-card block (time + bus info + price + select button)
> Internal implementation: **use `UCard` from Nuxt UI** or Tailwind classes for custom layouts

```vue
<script setup>
/**
 * @typedef {Object} Props
 * @property {string}  title             - Primary display text
 * @property {string}  [subtitle='']     - Secondary display text
 * @property {boolean} [clickable=false] - Emit click on whole card
 */
defineOptions({ inheritAttrs: false })

const props = defineProps({
  title:     { type: String,  required: true },
  subtitle:  { type: String,  default: '' },
  clickable: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])
</script>

<template>
  <div
    v-bind="$attrs"
    class="rounded-xl bg-white border border-gray-200 shadow-sm p-4"
    :class="{ 'cursor-pointer hover:shadow-md transition-shadow': clickable }"
    @click="clickable && emit('click')"
  >
    <slot>
      <p class="text-sm font-semibold text-zinc-900">{{ title }}</p>
      <p v-if="subtitle" class="text-xs text-gray-500 mt-1">{{ subtitle }}</p>
    </slot>
  </div>
</template>
```

**Universal template checklist (all sub-types):**
- `defineOptions({ inheritAttrs: false })` + `v-bind="$attrs"` on root element
- `defineProps` with typed definitions and defaults
- `defineEmits` declaring all events
- JSDoc `@typedef` per prop
- No store / service / router imports
- **No `<style>` block** — all styling via Tailwind utility classes
- **No `lang="scss"`** — SCSS has been removed from the project
- Internal primitives use **Nuxt UI** components (`UInput`, `UButton`, `UCard`...)

---

## 9. Reuse Example

### ❌ Bad — Duplicate components

```
src/components/elements/
  SeatButton.vue       ← duplicate
  TripButton.vue       ← duplicate
  BookingButton.vue    ← duplicate
```

Each has the same structure but different labels. This leads to inconsistent UI, maintenance burden, and style drift.

### ✅ Good — Single BaseButton with props

```
src/components/elements/
  BaseButton.vue
```

```vue
<!-- SeatView.vue -->
<BaseButton label="Select Seat" variant="primary" @click="handleSelectSeat" />

<!-- TripView.vue -->
<BaseButton label="Book Trip" variant="primary" @click="handleBookTrip" />

<!-- PaymentView.vue -->
<BaseButton label="Cancel" variant="danger" @click="handleCancel" />
```

One component, infinite reuse via props.

---

## 10. Parent Integration Example

**Scenario:** Display a list of trips, each with a "Book" button that opens a confirmation modal.

```vue
<!-- pages/user/TripView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useTripStore } from '@/stores/trip'
import BaseCard from '@/components/elements/BaseCard.vue'
import BaseButton from '@/components/elements/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useApiCall } from '@/composables/useApiCall'

const tripStore = useTripStore()
const { execute, loading } = useApiCall()

const selectedTrip = ref(null)
const isModalOpen = ref(false)

onMounted(async () => {
  await execute(
    () => tripStore.fetchTrips(),
    { onSuccess: () => {} }
  )
})

const handleSelectTrip = (trip) => {
  selectedTrip.value = trip
  isModalOpen.value = true
}

const handleConfirmBooking = () => {
  // proceed to booking
  isModalOpen.value = false
}
</script>

<template>
  <div>
    <BaseCard
      v-for="trip in tripStore.trips"
      :key="trip.id"
      :title="trip.name"
    >
      <BaseButton
        label="Book"
        variant="primary"
        @click="handleSelectTrip(trip)"
      />
    </BaseCard>

    <BaseModal
      :open="isModalOpen"
      :title="`Confirm booking: ${selectedTrip?.name}`"
      @confirm="handleConfirmBooking"
      @close="isModalOpen = false"
    />
  </div>
</template>
```

---

## 11. AI Generation Strategy

When implementing a new feature, AI must follow this order:

```
1. types/         → Define TypeScript/JSDoc types for the feature domain
2. services/      → Add API service functions (no try/catch, return res.data)
3. stores/        → Add or extend Pinia store actions using service functions
4. composables/   → Add useApiCall wrappers or feature-specific composables
5. components/    → Reuse or extend existing Base* components; create new ones only if needed
6. pages/         → Wire stores, composables, and components into the route-level view
```

**At step 5, AI must:**
- Search `src/components/elements/` and `src/components/common/` before creating
- Prefer extending existing components with new props over creating new files
- Never skip the detection step

---

## 12. Anti-Patterns

AI must **never** generate code that matches these patterns:

### ❌ Creating duplicate components
```
// WRONG: TripButton.vue already duplicates BaseButton
export default { name: 'TripButton' }
```

### ❌ Calling API inside an element component
```vue
<!-- WRONG: BaseCard must not call API -->
<script setup>
import { getTrips } from '@/services/tripService' // ❌
</script>
```

### ❌ Accessing Pinia store inside a Base component
```vue
<!-- WRONG: BaseButton must not use store -->
<script setup>
import { useAuthStore } from '@/stores/auth' // ❌
const auth = useAuthStore()
</script>
```

### ❌ Mutating parent state from a child
```vue
<!-- WRONG: child directly mutates parent ref -->
<script setup>
const props = defineProps(['modelValue'])
props.modelValue.push(item) // ❌ — emit instead
</script>
```

### ❌ Importing a higher-level component into elements
```vue
<!-- WRONG: elements must not depend on common or pages -->
<script setup>
import BaseModal from '@/components/common/BaseModal.vue' // ❌ inside elements/
</script>
```

### ❌ Business logic in layout components
```vue
<!-- WRONG: AppHeader must not manage bookings -->
<script setup>
import { useBookingStore } from '@/stores/booking' // ❌
</script>
```

---

# Figma HTML Analysis Rules

> These rules apply whenever Figma HTML is provided. AI must run these steps BEFORE generating any component code.

---

## Rule 1 — Detect UI elements from Figma HTML

Figma exports all components as `<div>` elements. AI must infer semantic UI intent using the following heuristics:

### Detection signals (evaluate ALL 5 before deciding)

| Signal | How to use it |
|---|---|
| **1. Class names** | Look for classes like `bg-stone-100`, `outline`, `border`, `rounded` → likely interactive field; `shadow`, `backdrop-blur` → likely card/panel |
| **2. Text content** | Placeholder-like text (e.g. "Hà Nội", "Enter email") → input field; "Search", "Submit", "Select" → button; "FROM", "TO", "PRICE" (uppercase small text) → label |
| **3. Layout structure** | A `<div>` with an icon sibling + text sibling inside a bordered container → input row; a `flex` row with multiple input rows + a button → form |
| **4. Icons** | Icon `<div>` next to a text `<div>` inside a bordered box → labeled input; icon-only `<div>` in a button-sized container → icon button |
| **5. Placeholder text** | Text that matches a city name, date format, email format, or "Enter ..." pattern → `<input>` field, NOT static text |

> **Rule:** If 3 or more signals agree → replace with the mapped component. If fewer than 3 → keep the original `<div>`.

---

## Rule 2 — Map detected elements to Nuxt UI components

Once a `<div>` is identified as a semantic UI element, apply this mapping:

| Detected element | Replace with | v-model? | Notes |
|---|---|---|---|
| Text input / search field | `<UInput>` | ✅ yes | Keep placeholder, type, disabled |
| Textarea | `<UTextarea>` | ✅ yes | Preserve rows if detectable |
| Submit / action button | `<UButton>` | ❌ no | Use `type="submit"` or `@click` |
| Cancel / reset button | `<UButton>` | ❌ no | Use `variant="ghost"` or `color="gray"` |
| Dropdown / select | `<USelect>` | ✅ yes | Pass `options` prop from parent |
| Checkbox | `<UCheckbox>` | ✅ yes | — |
| Toggle / switch | `<USwitch>` | ✅ yes | — |
| `<form>` wrapper | `<UForm>` | ❌ no | Use `@submit.prevent` |
| Card / panel container | `<UCard>` | ❌ no | Only if no custom shadow/blur needed |
| Vertical / horizontal rule | `<UDivider>` | ❌ no | Pass `orientation` prop |
| Icon placeholder div | `<UIcon>` | ❌ no | Pick closest Heroicons name |

> **Priority rule by layer:**
> - Building a component in **`elements/`** → use **Nuxt UI** (`UInput`, `UButton`, `UCard`...) as the internal primitive. The `Base*` component IS the wrapper around Nuxt UI.
> - Building a component in **`common/`** → use **existing `Base*` components from `elements/`** first; use Nuxt UI only when no `Base*` exists for that role.

---

## Rule 3 — Props inference from detected elements

After detecting elements, infer props using this logic:

| What is detected | Prop to add | Type | Default |
|---|---|---|---|
| Display-only text (time, price, name) | Named prop per field | String / Number | `''` / `0` |
| Input field with placeholder text | `initialValues: Object` (group all fields) | Object | `{}` |
| Submit button | `loading: Boolean` | Boolean | `false` |
| Disabled state on any element | `disabled: Boolean` | Boolean | `false` |
| Conditional visible section | `show[Section]: Boolean` | Boolean | `true` |
| List / options in dropdown | `options: Array` | Array | `[]` |

---

## Rule 4 — Emits inference from detected elements

| What is detected | Emit to add | Payload |
|---|---|---|
| Form with submit button | `submit` or named action | `{ ...allFieldValues }` |
| "Select" / "Book" / "Choose" button | `select` | item object (or no payload if context is single) |
| Cancel / Close / Reset button | `cancel` / `reset` | — |
| Delete / Remove button | `delete` | `{ id }` |
| Row / card click (entire card is clickable) | `click` | item object |
| Toggle / switch change | `toggle` | `boolean` |

---

## Rule 5 — Internal state inference from detected elements

| What is detected | Local ref to create | Initial value |
|---|---|---|
| `<UInput>` / `<UTextarea>` (text) | `ref('')` | `''` |
| `<UInput type="number">` | `ref(0)` | `0` |
| `<UInput type="date">` | `ref('')` | `''` |
| `<UCheckbox>` / `<USwitch>` | `ref(false)` | `false` |
| `<USelect>` | `ref(null)` | `null` |
| Dropdown open/close | `isOpen = ref(false)` | `false` |
| Multi-step / tab index | `activeStep = ref(0)` | `0` |

> **Do NOT** create local refs for display-only values. Those are props owned by the parent.

---

## 6 Icon inference (Figma → Project Icons → Nuxt UI)

### Icon inference (Figma → Project Icons → Nuxt UI)

Figma HTML often represents icons using `<div>` or `<svg>` elements without semantic meaning.

The AI must infer icons and resolve them using the following **strict priority order**:

#### 1️⃣ Project Vue icon components (highest priority)

First scan the project folder:

```
src/assets/icons/
```

If a Vue icon component with a matching semantic name exists, import and use it directly.

Example files:

```
src/assets/icons/IconCalendar.vue
src/assets/icons/IconUser.vue
src/assets/icons/IconBell.vue
src/assets/icons/IconArrow.vue
src/assets/icons/IconMail.vue
src/assets/icons/IconPhone.vue
src/assets/icons/IconLock.vue
src/assets/icons/IconEye.vue
src/assets/icons/IconEyeOff.vue
src/assets/icons/IconAvatar.vue
src/assets/icons/IconHexagon.vue
```

Usage:

```vue
import IconCalendar from '@/assets/icons/IconCalendar.vue'

<IconCalendar class="w-4 h-4 text-gray-500" />
```

#### 2️⃣ Nuxt UI icons (fallback)

If no matching Vue icon file exists in `src/assets/icons/`, use a Nuxt UI icon.

Examples:

search → `<UIcon name="i-heroicons-magnifying-glass" />`
user → `<UIcon name="i-heroicons-user" />`
bell → `<UIcon name="i-heroicons-bell" />`
close → `<UIcon name="i-heroicons-x-mark" />`
edit → `<UIcon name="i-heroicons-pencil-square" />`
delete → `<UIcon name="i-heroicons-trash" />`
calendar → `<UIcon name="i-heroicons-calendar-days" />`
map-pin → `<UIcon name="i-heroicons-map-pin" />`
users → `<UIcon name="i-heroicons-users" />`

#### Detection signals from Figma HTML

Infer icons using:

• class names (icon-search, icon-user, icon-bell)
• svg naming patterns
• button context (search button, close button)
• common UI patterns

#### Additional rules

• **Always prefer `src/assets/icons/` Vue components over Nuxt UI icons**
• Preserve wrapper classes from Figma HTML
• Import the Vue icon component at the top of `<script setup>` — do NOT inline SVG
• If the icon appears inside a button, pass it through the button's `#icon-left` or `#icon-right` slot

---

## Rule 7 — Uncertainty fallback

If AI cannot confidently determine the semantic role of a `<div>`:
1. Keep the original `<div>` with all original Tailwind classes intact
2. Do NOT guess — never replace a layout `<div>` with a UI component
3. Add a comment: `<!-- could not detect semantic role — kept as div -->`

---

## Quick Reference

### Component layer → UI source priority

| Layer | Building blocks to use | Fallback |
|---|---|---|
| `elements/` (creating a Base* primitive) | **Nuxt UI** (`UInput`, `UButton`, `UCard`, `USelect`...) | Raw HTML only if Nuxt UI has no equivalent |
| `common/` (composing a reusable block) | **Base\* from `elements/`** | Nuxt UI if no Base* exists |
| `pages/` (route-level view) | Base\* components + common/ components | — |
| Icons anywhere | **`src/assets/icons/*.vue`** Vue components | `<UIcon name="i-heroicons-...">` |

### General quick reference

| Situation | Action |
|---|---|
| Creating a new `elements/` primitive | Use Nuxt UI as internal implementation; wrap in `Base*` shell with clean props/emits |
| Creating a new `common/` block | Scan `src/components/elements/` first — compose from existing `Base*` |
| Existing `Base*` lacks a prop | Extend it — add prop with default, keep backward compatible |
| Figma block accepts user input | Sub-type A → wrap `UInput` / `USelect` in a new `Base*` or reuse existing `BaseInput` |
| Figma block triggers an action | Sub-type B → wrap `UButton` in a new `Base*` or reuse existing `BaseButton` |
| Figma block displays / wraps data | Sub-type C → wrap `UCard` in a new `Base*` or reuse existing `BaseCard` |
| Need an icon | Check `src/assets/icons/` first → use `<IconXxx />` if found → else `<UIcon name="i-heroicons-...">` |
| Truly new complex composition | Create in `common/` (no store access) |
| Route-level feature view | Create in `pages/` |
| Store access needed | Only in `pages/` and `stores/` |
| API call needed | Only in `services/` |

---