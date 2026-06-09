---
name: figma-to-vue
description: "Convert Figma plugin generated HTML/CSS into a clean Vue 3 SFC component. Use when: pasting Figma HTML, converting design to Vue, creating page from Figma export, building component from Figma output."
argument-hint: "Paste the Figma-generated HTML/CSS below"
---

# Figma to Vue 3 Component

Convert raw Figma plugin HTML/CSS output into a clean, production-ready Vue 3 Single File Component following the project's architecture.

## When to Use

- Converting Figma Dev Mode or plugin-exported HTML/CSS into a Vue component
- Building a new page or component from a Figma design
- Refactoring Figma-generated markup into project-standard code

## Output Format

Always produce a Vue SFC in this exact order:

```vue
<script setup>
</script>

<template>
</template>
```

**Styling approach: Tailwind CSS v4 utility classes directly in the template + Nuxt UI components where applicable.** Do NOT use `<style>` blocks. Do NOT use `lang="scss"` — SCSS has been removed from the project.

## Procedure

### Step 1 — Analyze the Figma HTML

1. Identify the page/component purpose (auth page, card, form, modal, etc.)
2. List all UI elements: headings, inputs, buttons, icons, images, links
3. Identify repeated patterns that should become reusable components
4. Note all colors, fonts, spacing, border-radius, shadows used

### Step 2 — Map Figma values to Tailwind classes

Map every Figma value to Tailwind utility classes:

| Figma Value | Tailwind Class |
|---|---|
| `#0EA5E9`, `sky-500` | `text-sky-500`, `bg-sky-500` |
| `#0369a1`, `sky-700` | `text-sky-700`, `bg-sky-700` |
| `#8B5CF6`, `violet-500` | `text-violet-500`, `bg-violet-500` |
| `#7c3aed`, `violet-600` | `text-violet-600`, `bg-violet-600` |
| `#6d28d9`, `violet-700` | `text-violet-700`, `bg-violet-700` |
| `#10B981`, `emerald-500` | `text-emerald-500`, `bg-emerald-500` |
| `#16a34a`, `green-600` | `text-green-600`, `bg-green-600` |
| `#d97706`, `amber-600` | `text-amber-600`, `bg-amber-600` |
| `#dc2626`, `red-600` | `text-red-600`, `bg-red-600` |
| `#111827`, `zinc-900` | `text-zinc-900` |
| `#374151`, `gray-700` | `text-gray-700` |
| `#6b7280`, `gray-500` | `text-gray-500` |
| `#9ca3af`, `gray-400` | `text-gray-400` |
| `#e5e7eb`, `gray-200` | `border-gray-200` |
| `#d6d3d1`, `stone-300` | `text-stone-300` |
| `#f5f5f4/50`, `stone-100/50` | `bg-stone-100/50` |
| `#ffffff` | `bg-white`, `text-white` |
| `#f9fafb` | `bg-gray-50` |
| `4px` | `p-1`, `gap-1`, `rounded` |
| `8px` | `p-2`, `gap-2`, `rounded-lg` |
| `12px` | `p-3`, `gap-3`, `rounded-xl` |
| `16px` | `p-4`, `gap-4`, `rounded-2xl` |
| `20px` | `p-5`, `gap-5` |
| `24px` | `p-6`, `gap-6` |
| `32px` | `p-8`, `gap-8` |
| `40px` | `p-10`, `gap-10` |
| `48px` | `p-12`, `gap-12` |
| `9999px` | `rounded-full` |
| `Inter` | `font-['Inter']` (or configure in tailwind.config.js) |
| `Poppins` | `font-['Poppins']` |
| `10px` font | `text-[10px]` |
| `12px` font | `text-xs` |
| `14px` font | `text-sm` |
| `16px` font | `text-base` |
| `18px` font | `text-lg` |
| `20px` font | `text-xl` |
| `24px` font | `text-2xl` |
| `30px` font | `text-3xl` |

For colors not directly in Tailwind palette, use arbitrary values: `bg-[#custom]`, `text-[#custom]`.
For opacity variants use slash syntax: `bg-white/70`, `bg-sky-700/85`.

### Step 3 — Refactor HTML structure

Apply these transformations to the Figma HTML:

1. **Remove unnecessary wrapper divs** — Figma generates deeply nested `<div>` trees. Flatten to the minimum needed.
2. **Replace absolute positioning with flexbox/grid** — Figma uses `position: absolute` for everything. Convert to:
   - `flex flex-col`, `flex items-center justify-center`
   - `grid grid-cols-2 gap-4` for grid layouts
3. **Remove all inline styles** — Use Tailwind classes instead.
4. **Remove Figma-specific attributes** — `data-figma-*`, `data-node-*`, `data-layer`, etc.
5. **Add semantic HTML** — Use `<header>`, `<nav>`, `<main>`, `<form>`, `<label>`, `<button>` instead of generic `<div>`.
6. **Add accessibility** — `for`/`id` on labels+inputs, `alt` on images, `type="button"` on non-submit buttons.

### Step 4 — Use existing reusable components

**Priority order (always check in this order):**
1. **Reuse project components first** — always check `@/components/elements/` and `@/components/common/` before anything else
2. **Nuxt UI components** (`U*`) — when no project wrapper exists for the needed primitive
3. **Raw HTML + Tailwind** — only when neither above applies

> ⚠️ NEVER skip step 1. If a `Base*` or `Common*` component exists that fits the design, USE IT.

#### Priority 1A — `@/components/elements/` (reusable UI primitives)

##### `BaseButton` (`@/components/elements/BaseButton.vue`)
```vue
<BaseButton
  type="primary|secondary|outline"
  size="sm|md|lg"
  html-type="button|submit"
  :loading="isLoading"
  :disabled="isDisabled"
  block
>
  Label Text
</BaseButton>
```
Slots: `#icon-left`, `#default`, `#icon-right`

##### `BaseInput` (`@/components/elements/BaseInput.vue`)
Props: `modelValue`, `type`, `label`, `placeholder`, `error`, `disabled`, `required`, `size`, `color`, `variant`, `ui`
Slots: `#leading`, `#trailing` — use for icons inside the input

```vue
<BaseInput v-model="value" placeholder="Email">
  <template #leading>
    <IconMail class="size-4 text-gray-400" />
  </template>
</BaseInput>
```

##### `BaseCard` (`@/components/elements/BaseCard.vue`)
Use for card containers when the component exists and fits the design.

##### Other elements — always scan `@/components/elements/` for:
`BaseAvatar`, `BaseBell`, `BaseSortFilter` — use if they match the design.

#### Priority 1B — `@/components/common/` (reusable page-level blocks)

Always scan this folder before building from scratch:
- `BaseModal.vue` — use for all modal/dialog patterns
- `BaseSavePaymentForm.vue` — use for payment form sections
- `BaseSearchForm.vue` — use for search/filter bars
- `BaseTripCard.vue` — use for trip card listings
- `ToastContainer.vue` — already mounted in `App.vue`, do NOT add again

#### Priority 2 — Nuxt UI primitives (when no Base* wrapper exists)
```vue
<USelect />, <UTextarea />, <UCheckbox />, <URadio />
<UBadge />, <UAvatar />, <USeparator />
<UModal />, <UDropdownMenu />, <UTooltip />
```

### Step 5 — Component Pattern & Override Logic (Logic from Nuxt UI)

When using or creating components, follow the "override pattern" inspired by Nuxt UI:

1. **Avoid wrapping in extra divs** just for styling. If the component layout allows, apply Tailwind classes directly to it or its top-level slots.
2. **Prop-driven styling**: If a component accepts a `:ui` or `class` prop, use it to override internal styles without breaking its structure.
3. **Form Management (UFormGroup Pattern)**: Group labels, inputs, and error messages consistently. Use the following markup pattern for custom forms:
   ```vue
   <div class="flex flex-col gap-2">
     <label :class="labelClass" :for="id">{{ label }}</label>
     <div class="relative flex items-center">
       <!-- Input & Icons here -->
     </div>
     <!-- Error message logic here -->
   </div>
   ```

### Step 6 — Extract icons

**Do NOT inline SVG icons directly in the template.**

**Icon priority order:**
1. **Check `src/assets/icons/`** — always use existing `Icon*.vue` components first
   ```vue
   import IconMail from '@/assets/icons/IconMail.vue'
   <!-- Usage: <IconMail class="size-4 text-gray-400" /> -->
   ```
   Available icons to check: `IconArrow`, `IconAvatar`, `IconBell`, `IconCalendar`, `IconEye`, `IconEyeOff`, `IconHexagon`, `IconLock`, `IconMail`, `IconPhone`, `IconUser`

2. **Nuxt UI `<UIcon>` with Heroicons** — when no matching asset icon exists, **infer** the closest Heroicons name:
   - envelope → `i-heroicons-envelope`
   - lock / password → `i-heroicons-lock-closed`
   - eye / show → `i-heroicons-eye`
   - eye-off / hide → `i-heroicons-eye-slash`
   - user / profile → `i-heroicons-user`
   - phone → `i-heroicons-phone`
   - calendar / date → `i-heroicons-calendar-days`
   - search → `i-heroicons-magnifying-glass`
   - close / x → `i-heroicons-x-mark`
   - check → `i-heroicons-check`
   - arrow right → `i-heroicons-arrow-right`
   - chevron down → `i-heroicons-chevron-down`
   - bell / notification → `i-heroicons-bell`
   - home → `i-heroicons-home`
   - settings → `i-heroicons-cog-6-tooth`
   - logout → `i-heroicons-arrow-right-on-rectangle`
   - plus / add → `i-heroicons-plus`
   - edit / pencil → `i-heroicons-pencil`
   - delete / trash → `i-heroicons-trash`
   - upload → `i-heroicons-arrow-up-tray`
   - download → `i-heroicons-arrow-down-tray`
   ```vue
   <UIcon name="i-heroicons-envelope" class="size-4 text-gray-400" />
   ```

3. **New icon component** — only if neither above covers the icon. Create in `src/assets/icons/IconName.vue` with `fill="currentColor"` or `stroke="currentColor"`.

### Step 6 — Write Tailwind utility classes

Rules:
- **Use Tailwind utility classes** directly on elements in the template
- **No BEM naming, no custom CSS classes** unless Tailwind cannot express the style
- **Group related utilities logically**: layout → sizing → spacing → typography → colors → effects
- **Use responsive prefixes**: `sm:`, `md:`, `lg:`, `xl:` for breakpoints
- **Use state variants**: `hover:`, `focus:`, `disabled:`, `active:`
- **Use `@apply`** only inside `<style>` blocks when you truly need a reusable class name for dynamic `:class` bindings — prefer inline utilities
- **Arbitrary values** for one-off styles: `w-[520px]`, `text-[10px]`, `bg-[#custom]`
- **For gradients**: `bg-gradient-to-r from-sky-700 to-violet-500`
- **For backdrop blur**: `backdrop-blur-md`
- **For shadows**: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`

### Step 7 — Extract reusable logic to composables

If the component contains logic that could be reused elsewhere, extract it:

```
src/composables/useComposableName.js
```

Examples:
- Form validation → `useFormValidation.js`
- Password strength calculation → `usePasswordStrength.js`
- Debounced input → `useDebounce.js`
- Date formatting → `useDateFormat.js`

Composable pattern:
```js
import { ref, computed } from 'vue'

export function useFeatureName() {
  const state = ref(null)
  const derived = computed(() => /* ... */)

  function action() { /* ... */ }

  return { state, derived, action }
}
```

### Step 8 — Final checklist

Before delivering the component, verify:

- [ ] `<script setup>` — Composition API only, no Options API
- [ ] All imports use `@/` alias, never relative paths
- [ ] Route names from `@/constants/routes`, never hardcoded strings
- [ ] No API calls in the component — delegate to stores/services
- [ ] Props declared with `defineProps()` with type + default
- [ ] Events declared with `defineEmits()`
- [ ] **All styling uses Tailwind v4 utility classes** — no hardcoded CSS, no `<style>` blocks, no `lang="scss"`
- [ ] **Nuxt UI components used** where applicable (`UInput`, `UButton`, `USelect`, etc.)
- [ ] Responsive: `md:` prefix for tablet+, mobile-first approach
- [ ] No inline SVG — icons from `src/assets/icons/` or `<UIcon>`
- [ ] No inline styles (`style="..."`)
- [ ] Semantic HTML with accessibility attributes
- [ ] Component is small and focused — split if over 300 lines of template

### Step 9 — Styling Strategy

#### Rules (strictly follow)
- **Tailwind CSS v4 only** — utility classes directly in the template
- **No `<style>` blocks** — do not add `<style>` or `<style lang="scss">` to any SFC
- **No `@apply`** — write utility classes inline, never via @apply
- **Nuxt UI `:ui` prop** — use to override internal component styles without extra wrappers
  ```vue
  <UInput :ui="{ base: 'bg-stone-100 py-4' }" />
  ```
- **Tailwind `@layer`** — for truly global overrides, add to `src/assets/css/main.css` only

#### Reset Awareness
- Tailwind v4 Preflight (loaded via `@import "tailwindcss"`) handles all resets: `box-sizing`, `margin: 0`, `list-style: none`, etc.
- When converting Figma CSS, **skip** any property already handled by Preflight.

#### Figma → Tailwind conversion logic
- `display: flex; align-items: center;` → `flex items-center`
- `padding: 16px;` → `p-4`
- `font-size: 14px; color: #333;` → `text-sm text-gray-800`
- `position: absolute; left: 16px;` → use flexbox/grid instead; avoid absolute unless necessary
- Complex gradients → `bg-gradient-to-br from-sky-600 via-violet-600 to-violet-800`

### C. SCSS Integration (Namespace & Scoping)
- **Scoping**: When SCSS is needed, use `<style lang="scss" scoped>`.
- **Imports**: Always use `@use "@/styles/_variables" as *;` at the top of the `<style>` block.
- **BEM over Inline**: If a component has complex internal styling, use BEM naming instead of deep nesting to avoid high specificity that overrides Tailwind.

### D. Design Token Mapping
- **Hex Codes**: NEVER use raw Hex codes from Figma if a matching variable exists in `#file:_colors.scss` or `#file:_variables.scss`.
- **Mapping**: 
    - If Figma #7C3AED -> Use `$color-primary` (SCSS) or `text-primary-600` (Tailwind).
    - If Figma 12px border-radius -> Use `$radius-md` or `rounded-xl`.

### E. Responsive Logic
- **Constraint**: DO NOT use `@media` queries.
- **Action**: Use Tailwind prefixes (`sm:`, `md:`, `lg:`) or the SCSS mixin `@include sp` from `#file:_breakpoints.scss`.

## Reference Files

When executing this skill, read these project files for current values:

- `tailwind.config.js` — Tailwind configuration and custom theme extensions
- `.github/instructions/frontend.intructions.md` — Project architecture rules
- `github/skills/figma-to-vue/RULES_STYLES.md` — Specific Tailwind rules for styling Figma components
- `src/components/elements/BaseButton.vue` — Button component API
- `src/components/elements/BaseInput.vue` — Input component API




# Promt pattern 
Form page
## Logic wiring
- Form state: form ref { email, password }
- Submit handler: handleLogin() → calls authStore.login(form.value)
- Keep all existing event bindings (@submit.prevent, v-model)
- Do NOT change validation logic

Pure UI component (elements/ hoặc common/):
## Logic wiring
- No store, no service, no router
- Props: [list props]
- Emits: [list events]
- Internal state only: isOpen ref for dropdown toggle

Page (có store + API):
## Logic wiring
- Store: useTripStore() — call tripStore.fetchTrips() on mounted
- Loading state: use isLoading ref
- Error handling: toast.error() via useToast()
- Route navigation: router.push({ name: ROUTE_NAMES.SEAT_VIEW })
