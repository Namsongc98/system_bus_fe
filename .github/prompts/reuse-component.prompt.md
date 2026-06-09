---
description: Fill an empty Base element or common component from Figma HTML using the reuse-component-skill. Choose Pattern A (primitive element) or Pattern B (common component composing Base elements).
name: prompt-reuse-component
argument-hint: "Pattern A or B, component name (e.g. BaseButton), then paste Figma HTML"
agent: agent
---

Apply the [reuse-component-skill](../skills/reuse-component-skill/SKILL.md).

Before writing any code, read the full skill file to understand all rules, sub-type templates, and architecture guardrails.

---

## Inputs required

If any of the following are missing, ask the user before proceeding:

| Input | Description |
|---|---|
| **Pattern** | `A` — fill a primitive Base element component · `B` — fill a common component that composes Base elements |
| **Component name** | The target file that is already created and currently empty (e.g. `BaseTagBadge`, `BaseRatingCard`, `BaseSearchForm`) |
| **Figma HTML** | The raw HTML/CSS exported from the Figma plugin |

---

## Pattern A — Fill an empty Base element component (primitive)

> Use when: the target file is inside `src/components/elements/` and represents a single primitive UI unit.

### Step 1 — Read the target file
Open `src/components/elements/[ComponentName].vue` and confirm it is empty before generating.

### Step 2 — Identify sub-type
Look at the Figma HTML and select **one** sub-type. Use the matching template from Section 8 of the skill.

- [ ] **Sub-type A — Interactive field** — user types / selects / toggles a value
- [ ] **Sub-type B — Action trigger** — user clicks to trigger something
- [ ] **Sub-type C — Display / Container** — shows data or wraps content

### Step 3 — Infer props from Figma HTML

| What you see in Figma HTML | Prop to add | Type | Default |
|---|---|---|---|
| Static or changing display text | named display prop | String / Number | `''` / `0` |
| Input placeholder text | `modelValue` + `placeholder` | String | `''` |
| Numeric display (price, count, %) | named prop | Number | `0` |
| Boolean state (active, selected) | named Boolean prop | Boolean | `false` |
| List of options (dropdown) | `options: Array` | Array | `[]` |
| Enum variant (size, color, type) | `variant` / `size` / `type` | String | first value |
| Loading spinner on button | `loading: Boolean` | Boolean | `false` |
| Grayed-out / disabled styling | `disabled: Boolean` | Boolean | `false` |

### Step 4 — Infer emits from Figma HTML

| What you see in Figma HTML | Emit | Payload |
|---|---|---|
| Text / date / number input field | `update:modelValue` | new value |
| Submit / Search / Book button | `click` | — |
| Select / Choose button | `select` | item or no payload |
| Cancel / Close / Reset button | `cancel` / `close` / `reset` | — |
| Delete / Remove button | `delete` | `{ id }` |
| Entire block is clickable | `click` | item object |
| Toggle / switch element | `toggle` | boolean |

### Step 5 — Infer slots from Figma HTML

| What you see in Figma HTML | Slot |
|---|---|
| Region with variable inner content | `default` slot |
| Named region (header, footer, actions) | named slot |
| All content is fixed | no slot needed |

### Rules
- Use the sub-type template from Section 8 of the skill matching the sub-type selected above
- `defineOptions({ inheritAttrs: false })` + `v-bind="$attrs"` on root element
- No store / service / router imports
- Do NOT add styling beyond what is strictly required for functionality
- **Use Nuxt UI** (`UInput`, `UButton`, `USelect`, `UCard`, `UIcon`…) as the internal building blocks inside the `Base*` wrapper
- For icons: check `src/static/icons/` first → use `<IconXxx />` (imported Vue component) if found → else use `<UIcon name="i-heroicons-…" />`

---

## Pattern B — Fill an empty common component (composes Base elements)

> Use when: the target file is inside `src/components/common/` and composes multiple Base element components.

### Step 1 — Read the target file
Open `src/components/common/[ComponentName].vue` and confirm it is empty before generating.

### Step 2 — Scan available Base element components
Read every file in `src/components/elements/` and list what is available before deciding on replacements:

| Component | Import path | Sub-type | Key props |
|---|---|---|---|
| `BaseInput` | `@/components/elements/BaseInput.vue` | A | `modelValue`, `type`, `placeholder`, `label`, `error`, `disabled` |
| `BaseButton` | `@/components/elements/BaseButton.vue` | B | `label`, `htmlType`, `variant`, `loading`, `disabled`, `block` |
| `BaseCard` | `@/components/elements/BaseCard.vue` | C | *(read from file)* |
| `BaseAvatar` | `@/components/elements/BaseAvatar.vue` | C | *(read from file)* |
| `BaseBell` | `@/components/elements/BaseBell.vue` | B/C | *(read from file)* |
| *(others)* | `@/components/elements/[BaseXxx].vue` | A/B/C | *(read from file)* |

> **Priority for `common/` components:** always use an existing `Base*` component from `elements/` before reaching for Nuxt UI.

### Step 3 — Detect replaceable blocks in Figma HTML

For each block detected, pick the matching `Base*` (or Nuxt UI if no `Base*` exists):

| Figma block | Replace with | Props to pass |
|---|---|---|
| *(describe detected block)* | `BaseXxx` or `UXxx` | *(list props)* |

### Step 4 — Infer props contract for this common component

| What is detected in Figma HTML | Prop to expose | Type | Default |
|---|---|---|---|
| Input fields (group all) | `initialValues` | Object | `{}` |
| Submit / action button | `loading` | Boolean | `false` |
| Display-only text values | named prop per field | String / Number | `''` / `0` |
| Conditional section visibility | `show[Section]` | Boolean | `true` |
| Dropdown options | `[field]Options` | Array | `[]` |

### Step 5 — Infer emits contract

| What is detected in Figma HTML | Emit | Payload |
|---|---|---|
| Form submit button | `search` / `submit` | `{ ...allFieldValues }` |
| Reset / Clear button | `reset` | — |
| Select / Book / Choose button | `select` | item or no payload |

### Step 6 — Infer internal state (local refs only)

| What is detected | `ref` to create | Initial value |
|---|---|---|
| Text input field | `fieldName = ref('')` | `''` |
| Date input field | `fieldName = ref('')` | `''` |
| Number input field | `fieldName = ref(0)` | `0` |
| Select / dropdown | `fieldName = ref(null)` | `null` |
| Toggle / switch | `fieldName = ref(false)` | `false` |

> Do NOT create refs for display-only values — those are props owned by the parent.

### Conversion rules
1. Keep ALL Tailwind classes from Figma HTML exactly as-is on wrapper divs
2. For each detected block: replace with matching `Base*` from Step 3
3. If no `Base*` matches: map to Nuxt UI (`UInput` / `UButton` / `UCard` / `UDivider` / `UIcon`…)
4. `defineOptions({ inheritAttrs: false })` + `v-bind="$attrs"` on the outermost element
5. If `initialValues` is provided: populate internal refs using `onMounted` + `watch(initialValues, …)`
6. Emit all collected data UP — never manage external state inside this component
7. For icons: check `src/static/icons/` first → import and use `<IconXxx />` if found → else `<UIcon name="i-heroicons-…" />`

### Architecture rules (non-negotiable)
- No Pinia store access
- No API service calls
- No `useRouter` / `useRoute`
- All data flows OUT via emits only — parent page owns state after emit

---

## Figma HTML
<!-- PASTE FIGMA HTML HERE -->

## Component name
<!-- e.g. BaseTagBadge or BaseSearchForm -->

## Pattern selection
<!-- A or B -->

---

## Output

Provide:
1. The complete Vue SFC written into the target file path.
2. The sub-type selected (Pattern A only) and reasoning.
3. The list of `Base*` components reused and props passed (Pattern B only).
4. A brief summary: what was detected in the Figma HTML, what was replaced, and any decisions made.
