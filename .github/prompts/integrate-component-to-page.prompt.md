---
description: Compose a Nuxt/Vue page by analyzing Figma HTML and integrating existing reusable components. Replaces matching Figma blocks with Base*/Common* components, maps remaining elements to Nuxt UI, and generates a clean layout shell with wiring hints.
name: prompt-integrate-components-to-page
argument-hint: Provide page description, wire logic, list of reusable components, and Figma HTML
agent: agent
---

Apply the [integrate-components-to-page skill](../skills/integrate-components-to-page./SKILL.md).

Read the full SKILL.md before writing any code.

---

## How to use this prompt

Fill in the four sections below, then run the prompt.

| Section | Required? | Description |
|---|---|---|
| **Page description** | ✅ | What this page does, its route, and layout context |
| **Wire logic** | ✅ | What store actions, API calls, and events the page needs after the shell is generated |
| **Reusable components** | ✅ | List of components available for this page (copy from registry below) |
| **Figma HTML** | ✅ | Raw HTML exported from the Figma plugin |

---

## Component Registry (always up-to-date)

Copy the relevant rows into your prompt's "Reusable components" section.

### common/

| Component | Import path | Key props | Emits |
|---|---|---|---|
| `BaseSearchForm` | `@/components/common/BaseSearchForm.vue` | `loading`, `initialValues` | `search({ from, to, date, passengers })`, `reset` |
| `BaseTripCard` | `@/components/common/BaseTripCard.vue` | `departureTime`, `departurePeriod`, `arrivalTime`, `arrivalPeriod`, `busPlate`, `availableSeats`, `totalSeats`, `price`, `premium` | `select` |
| `BaseMapCar` | `@/components/common/BaseMapCar.vue` | `seats: Array<{ id, number, status }>` | `select(seat)` |
| `BaseFormSelectPayment` | `@/components/common/BaseFormSelectPayment.vue` | `seat`, `subtotal`, `loading`, `initialValues` | `submit({ fullName, phone, email })` |
| `BaseSavePaymentForm` | `@/components/common/BaseSavePaymentForm.vue` | *(read file)* | `submit` |
| `BaseModal` | `@/components/common/BaseModal.vue` | `modelValue` (v-model), `title`, `size` | `update:modelValue`, `close` |
| `ToastContainer` | `@/components/common/ToastContainer.vue` | — | — |

### elements/

| Component | Import path | Key props | Emits |
|---|---|---|---|
| `BaseButton` | `@/components/elements/BaseButton.vue` | `label`, `htmlType`, `type` (primary/secondary/outline), `size`, `loading`, `block` | `click` |
| `BaseInput` | `@/components/elements/BaseInput.vue` | `modelValue` (v-model), `type`, `placeholder`, `label`, `error`, `disabled`, `variant`, `ui` | `update:modelValue`, `blur` |
| `BaseCard` | `@/components/elements/BaseCard.vue` | `shadow`, `padding`, `rounded`, `hoverable` | — (slot-based) |
| `BaseAvatar` | `@/components/elements/BaseAvatar.vue` | *(read file)* | — |
| `BaseBell` | `@/components/elements/BaseBell.vue` | *(read file)* | — |
| `BaseSortFilter` | `@/components/elements/BaseSortFilter.vue` | `modelValue` (v-model), options | `update:modelValue` |

### icons (src/assets/icons/)
`IconArrow` · `IconAvatar` · `IconBell` · `IconCalendar` · `IconEye` · `IconEyeOff` · `IconHexagon` · `IconLock` · `IconMail` · `IconPhone` · `IconUser`

---

## Prompt Template

```
@workspace Apply integrate-components-to-page skill.

## Target page
File: src/pages/[section]/[PageName].vue
Route: /[route-path]
Layout: [UserLayout | AdminLayout]

## Page description
[Describe what this page does in 2-3 sentences.
e.g. "Displays a list of trips matching user search criteria.
Users can filter, sort, and select a trip to proceed to seat selection."]

## Wire logic (to implement after shell is generated)
- Store: [e.g. useTripStore — fetchTrips(), trips state]
- On mount: [e.g. fetch trips from query params]
- Events:
  - @search on BaseSearchForm → tripStore.fetchTrips(payload)
  - @select on BaseTripCard → router.push({ name: ROUTE_NAMES.SEAT, query: { tripId } })
  - [add more...]
- Loading state: [e.g. useAsync wrapping fetchTrips]

## Reusable components available
[COPY ROWS FROM REGISTRY ABOVE that are relevant to this page]

| Component | Import path | Key props | Emits |
|---|---|---|---|
| `BaseSearchForm` | `@/components/common/BaseSearchForm.vue` | `loading`, `initialValues` | `search`, `reset` |
| `BaseTripCard` | `@/components/common/BaseTripCard.vue` | `departureTime`, ..., `price`, `premium` | `select` |
| ... | ... | ... | ... |

## Figma HTML
[PASTE FIGMA HTML HERE]

## Rules
1. Read SKILL.md first — follow all detection and replacement rules
2. Replace every matching Figma block with the listed reusable component
3. Map remaining blocks to Nuxt UI (UInput, UButton, USelect, UIcon…)
4. Preserve ALL Tailwind classes on wrapper divs — do not remove or flatten
5. Add wiring hint comment above every placed component (props + emits + TODO)
6. Root element must have v-bind="$attrs"
7. Script block: import components only — no store calls, no API calls, no business logic
8. Use route names from @/constants/routes — never hardcode strings
```

---

## Example (filled in)

```
@workspace Apply integrate-components-to-page skill.

## Target page
File: src/pages/user/TripView.vue
Route: /trips
Layout: UserLayout

## Page description
Displays available bus trips matching the user's search query (from, to, date, passengers).
Users can sort/filter results and click a trip card to proceed to seat selection.

## Wire logic (to implement after shell is generated)
- Store: useTripStore — actions: fetchTrips(payload), state: trips[], isLoading
- On mount: read query params → prefill BaseSearchForm, call fetchTrips
- Events:
  - @search on BaseSearchForm → tripStore.fetchTrips(payload)
  - @reset on BaseSearchForm → tripStore.clearTrips()
  - @select on BaseTripCard → router.push({ name: ROUTE_NAMES.SEAT, query: { tripId: trip.id } })
  - @update:modelValue on BaseSortFilter → local sortKey ref
- Loading state: useAsync wrapping tripStore.fetchTrips

## Reusable components available

| Component | Import path | Key props | Emits |
|---|---|---|---|
| `BaseSearchForm` | `@/components/common/BaseSearchForm.vue` | `loading`, `initialValues` | `search`, `reset` |
| `BaseTripCard` | `@/components/common/BaseTripCard.vue` | `departureTime`, `arrivalTime`, `busPlate`, `availableSeats`, `totalSeats`, `price`, `premium` | `select` |
| `BaseSortFilter` | `@/components/elements/BaseSortFilter.vue` | `modelValue` | `update:modelValue` |
| `BaseButton` | `@/components/elements/BaseButton.vue` | `label`, `type`, `loading` | `click` |

## Figma HTML
<div class="page-wrapper ...">
  <!-- search panel -->
  <div class="search-panel bg-white/70 ...">...</div>
  <!-- results list -->
  <div class="results flex flex-col gap-4">
    <div class="trip-row ...">...</div>
  </div>
</div>
```

---

## Output expected from AI

1. **Complete Vue SFC** written to the target file path
2. **Wiring summary**: which components were placed, which emits need handlers
3. **TODO checklist**: all `<!-- TODO: ... -->` items extracted as a list for the next step
