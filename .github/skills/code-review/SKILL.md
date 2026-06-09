---
name: code-review
description: "Review and refine Vue 3 SFC code for logic, HTML semantics, Tailwind CSS, and project conventions. Use when: reviewing component quality, fixing coding conventions, refactoring messy code, polishing before merge."
argument-hint: "Paste the component code or specify the file path to review"
---

# Code Review — Vue 3 Component

Review and refine an existing Vue 3 SFC for coding conventions, logic correctness, HTML semantics, Tailwind CSS best practices, and project architecture compliance.

## When to Use

- Reviewing a component after initial development
- Fixing coding convention violations
- Refactoring template/logic/styling for cleanliness
- Pre-merge quality check
- When user says: "review", "refine", "clean up", "fix conventions"

## Output Format

1. **Report** — List all issues found, grouped by category (Critical / Warning / Suggestion)
2. **Fix** — Apply all fixes directly to the file(s)

---

## Procedure

### Step 1 — Read context files

Before reviewing, read these project files for current rules:

- `.github/INTRUCTIONS.md` — Architecture rules and coding standards
- `tailwind.config.js` — Tailwind configuration
- `src/constants/routes.js` — Route name constants
- `src/constants/api.js` — API endpoint constants

### Step 2 — Review `<script setup>` Logic

Check each item. Mark as ✅ pass or ❌ fail:

#### 2.1 — Composition API only
- [ ] Uses `<script setup>` — no Options API (`data`, `methods`, `computed:`, `watch:` as options)
- [ ] No `defineComponent()` wrapper needed with `<script setup>`

#### 2.2 — Import conventions
- [ ] All imports use `@/` alias — **never** `../`, `./` relative paths for cross-folder imports
- [ ] Route names imported from `@/constants/routes` — no hardcoded route strings like `'/login'`
- [ ] API endpoints imported from `@/constants/api` — no hardcoded URLs
- [ ] Component imports use PascalCase matching filename

#### 2.3 — Reactive state
- [ ] `ref()` for primitives and objects, `reactive()` only when necessary
- [ ] No direct mutation of props — use `emit` to communicate up
- [ ] Computed properties are pure (no side effects)
- [ ] `watch`/`watchEffect` cleaned up if needed (manual stop for conditional watchers)

#### 2.4 — Props & Emits
- [ ] Props declared with `defineProps()` with `type` + `default` for every prop
- [ ] Emits declared with `defineEmits()` — lists all events
- [ ] No undeclared emits (using `$emit` without `defineEmits`)
- [ ] Boolean props default to `false`

#### 2.5 — Data flow
- [ ] No direct API calls (`axios.get/post`) in the component — delegate to stores/services
- [ ] Page components call store actions or composables for data
- [ ] `elements/` components do NOT import stores — only props/emits

#### 2.6 — Naming conventions
| Artifact | Convention | Example |
|---|---|---|
| Page component | PascalCase + `View` or `Page` | `TripView.vue`, `LoginPage.vue` |
| Base component | PascalCase + `Base` prefix | `BaseButton.vue`, `BaseInput.vue` |
| Layout component | PascalCase + `App` prefix | `AppHeader.vue`, `AppSidebar.vue` |
| Composable | camelCase + `use` prefix | `useAuth.js`, `usePagination.js` |
| Store file | camelCase domain | `auth.js`, `booking.js` |
| Constants | SCREAMING_SNAKE_CASE | `ROUTE_NAMES`, `API_ENDPOINTS` |
| Refs/reactive | camelCase | `isLoading`, `formData` |
| Handlers | camelCase + `handle` prefix or verb | `handleSubmit`, `togglePassword` |

#### 2.7 — Logic organization order
`<script setup>` should follow this order:
```
1. Imports (vue → vue-router → stores → components → icons → composables → utils)
2. Store / router instances
3. Props & Emits
4. Reactive state (ref, reactive)
5. Computed properties
6. Functions / handlers
7. Watchers
8. Lifecycle hooks (onMounted, onUnmounted, etc.)
```

#### 2.8 — Error handling
- [ ] Async functions wrapped in try/catch (or handled by composable like `useAsync`)
- [ ] Loading states managed (`isLoading` set before/after async calls)
- [ ] No unhandled promise rejections

### Step 3 — Review `<template>` HTML

#### 3.1 — Semantic HTML
- [ ] Use `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`, `<article>` where appropriate
- [ ] Use `<form>` with `@submit.prevent` for forms — not `<div>` with click handler
- [ ] Use `<button>` for clickable actions — not `<div @click>`
- [ ] Use `<a>` or `<router-link>` for navigation — not `<span @click>`
- [ ] Use `<label>` properly associated with inputs (`for`/`id` pair)
- [ ] Use `<ul>/<ol>` + `<li>` for lists — not `<div>` repetitions
- [ ] Use `<h1>`–`<h6>` for headings with proper hierarchy (one `<h1>` per page)

#### 3.2 — Accessibility (a11y)
- [ ] All `<input>` elements have associated `<label>` with matching `for`/`id`
- [ ] All `<img>` have `alt` attribute (empty `alt=""` for decorative images)
- [ ] Interactive elements (`<button>`, `<a>`) have discernible text or `aria-label`
- [ ] Toggle buttons have `aria-pressed` or `aria-expanded` where applicable
- [ ] Form inputs have descriptive `placeholder` or `aria-label`
- [ ] Non-submit buttons have explicit `type="button"`
- [ ] Focus states are visible (Tailwind `focus:` variants applied)

#### 3.3 — Vue template best practices
- [ ] Use `v-if` / `v-else` — not hidden via CSS for conditional rendering
- [ ] `v-for` always has a unique `:key` — prefer `id` over `index`
- [ ] No `v-if` and `v-for` on the same element (v-if takes precedence in Vue 3 but still bad practice)
- [ ] Use `<template>` for grouping without extra DOM nodes
- [ ] Event handlers use `@` shorthand — not `v-on:`
- [ ] Bind shorthand uses `:` — not `v-bind:`
- [ ] Component props use kebab-case in template (`html-type` not `htmlType`)
- [ ] No complex expressions in template — extract to computed or method

#### 3.4 — Component usage
- [ ] Uses `BaseButton` for buttons — not raw `<button>` with custom styles (unless toggle/icon-only)
- [ ] Uses `BaseInput` if it fits — or builds field markup with Tailwind (not SCSS)
- [ ] Uses `<router-link>` for internal navigation — not `<a href>`
- [ ] Route destinations use `{ name: ROUTE_NAMES.XXX }` — not hardcoded paths

#### 3.5 — Template structure
- [ ] No unnecessary wrapper `<div>` — flatten where possible
- [ ] Template is under 300 lines — split into child components if larger
- [ ] Consistent indentation (2 spaces)
- [ ] Multi-attribute elements have one attribute per line

### Step 4 — Review Tailwind CSS

#### 4.1 — No `<style>` block unless necessary
- [ ] All styling uses Tailwind utility classes in template
- [ ] `<style>` block only exists for things Tailwind can't do (keyframes, complex pseudo-elements)
- [ ] No BEM classes, no custom CSS classes for styling
- [ ] No `<style scoped>` with SCSS when Tailwind can handle it

#### 4.2 — Utility class conventions
- [ ] **Class order**: layout → sizing → spacing → typography → colors → borders → effects → transitions → responsive
  - Example: `flex items-center gap-4 w-full p-4 text-sm font-bold text-gray-700 bg-white border rounded-lg shadow-md transition-all md:p-6`
- [ ] **No redundant classes**: e.g., `flex flex-row` (flex-row is default), `font-normal` (already default)
- [ ] **No conflicting classes**: e.g., `text-sm text-base` on same element
- [ ] **Consistent spacing scale**: stick to Tailwind scale, avoid mixing `p-3.5` with `p-[15px]`
- [ ] **Use Tailwind color palette**: no `text-[#6b7280]` when `text-gray-500` exists
- [ ] **Responsive prefixes**: use `md:` / `lg:` / `max-md:` consistently, mobile-first approach

#### 4.3 — Repeated class patterns
- [ ] If the same long class string repeats 3+ times, consider:
  - Extracting to a child component with props
  - Using `@apply` in a minimal `<style>` block (only for dynamic `:class` bindings)
  - A computed function returning the class string
- [ ] Duplicated input/field markup → extract a local component or use `v-for`

#### 4.4 — Dynamic classes
- [ ] Use object syntax `:class="{ 'bg-red-500': isError }"` for single toggles
- [ ] Use array syntax `:class="[baseClass, conditionClass]"` for multiple
- [ ] Use computed for complex class logic — not inline ternaries longer than 1 condition
- [ ] **Tailwind dynamic classes must be complete**: `bg-red-500` not `` `bg-${color}-500` `` (Tailwind can't detect dynamic class names at build time)

#### 4.5 — Hardcoded values audit
- [ ] No hardcoded colors: `text-[#111827]` → `text-zinc-900`
- [ ] No hardcoded spacing when Tailwind scale exists: `p-[16px]` → `p-4`
- [ ] No hardcoded font-size: `text-[14px]` → `text-sm`
- [ ] Arbitrary values `[...]` only for truly custom values not in Tailwind scale
- [ ] `font-['Inter']` → consider configuring in `tailwind.config.js` `theme.fontFamily` instead

### Step 5 — Cross-cutting concerns

#### 5.1 — Performance
- [ ] No inline object/array creation in template (creates new reference each render):
  - ❌ `:style="{ color: 'red' }"` in template
  - ✅ Use computed or const
- [ ] Heavy computations use `computed()` — not called as methods in template
- [ ] Lists with many items use keyed `v-for` for efficient patching
- [ ] Large lists consider virtual scrolling or pagination

#### 5.2 — Security
- [ ] No `v-html` with user-supplied data (XSS risk)
- [ ] No sensitive data in template comments or console.log
- [ ] Form inputs have appropriate `type` (email, password, tel) for browser validation
- [ ] No inline `javascript:` URLs

#### 5.3 — Icons
- [ ] SVG icons extracted to `src/components/icons/IconName.vue` — not inlined in template
- [ ] Icon components use `currentColor` for fill/stroke
- [ ] Icons imported as components — not as img src or base64

### Step 6 — Generate report

Format the report as:

```
## Code Review: ComponentName.vue

### ❌ Critical (must fix)
1. [LOGIC] Direct API call in component — move to store/service
2. [HTML] Form uses div+click instead of form+submit

### ⚠️ Warning (should fix)
3. [TAILWIND] Hardcoded color `text-[#111827]` → use `text-zinc-900`
4. [HTML] Input missing associated label

### 💡 Suggestion (nice to have)
5. [TAILWIND] Repeated input classes → extract to computed or child component
6. [LOGIC] Password strength logic → extract to `usePasswordStrength` composable
```

### Step 7 — Apply fixes

After presenting the report:
1. Apply all Critical and Warning fixes automatically
2. Ask user before applying Suggestions (they may be opinionated)
3. Verify no errors after fixes with `get_errors`

---

## Severity Levels

| Level | When to use | Action |
|---|---|---|
| ❌ Critical | Bugs, security issues, architecture violations, broken a11y | Fix immediately |
| ⚠️ Warning | Convention violations, inconsistencies, minor a11y gaps | Fix in same PR |
| 💡 Suggestion | Optimization, DRY improvements, nice-to-have refactors | Ask user first |

## Quick Reference — Common Issues

### Tailwind anti-patterns
```html
<!-- ❌ Dynamic class name — Tailwind can't purge -->
<div :class="`bg-${color}-500`">

<!-- ✅ Map to full class names -->
<div :class="colorMap[color]">
```

```html
<!-- ❌ Redundant default classes -->
<div class="flex flex-row items-stretch font-normal">

<!-- ✅ Remove defaults -->
<div class="flex">
```

```html
<!-- ❌ Hardcoded when Tailwind class exists -->
<div class="text-[14px] text-[#6b7280] p-[16px]">

<!-- ✅ Use Tailwind scale -->
<div class="text-sm text-gray-500 p-4">
```

### Template anti-patterns
```html
<!-- ❌ div as button -->
<div @click="doThing" class="cursor-pointer">Click me</div>

<!-- ✅ Semantic button -->
<button type="button" @click="doThing">Click me</button>
```

```html
<!-- ❌ Hardcoded route path -->
<router-link to="/login">Sign in</router-link>

<!-- ✅ Named route -->
<router-link :to="{ name: ROUTE_NAMES.LOGIN }">Sign in</router-link>
```

### Logic anti-patterns
```js
// ❌ API call in component
const data = await axios.get('/api/users')

// ✅ Delegate to store
await userStore.fetchUsers()
```

```js
// ❌ Relative import
import BaseButton from '../../components/elements/BaseButton.vue'

// ✅ Alias import
import BaseButton from '@/components/elements/BaseButton.vue'
```
