---
description: Convert Figma plugin generated HTML/CSS into a clean Vue 3 SFC component following project conventions.
name: prompt-figma-to-vue
argument-hint: Paste the Figma-generated HTML/CSS, or describe the component to build
agent: agent
---

Your goal is to convert Figma-exported HTML/CSS into a production-ready Vue 3 Single File Component (SFC) for this project.

If the Figma HTML/CSS is not provided, ask the user to paste it before proceeding.

Follow all steps defined in [SKILL.md](../skills/figma-to-vue/SKILL.md) and [RULE_STYLES.md](../skills/figma-to-vue/RULE_STYLES.md) strictly and in order.

## Required context to read before generating

Before writing any code, read these files:

- [SKILL.md](../skills/figma-to-vue/SKILL.md) — full conversion procedure, component priority, Tailwind mapping, and checklist
- [RULE_STYLES.md](../skills/figma-to-vue/RULE_STYLES.md) — styling rules: Tailwind v4, Nuxt UI, no SCSS, no style blocks
- [BaseButton.vue](../../src/components/elements/BaseButton.vue) — reusable button component props and slots
- [BaseInput.vue](../../src/components/elements/BaseInput.vue) — reusable input component props and slots
- [BaseCard.vue](../../src/components/elements/BaseCard.vue) — reusable card container
- [BaseModal.vue](../../src/components/common/BaseModal.vue) — reusable modal component
- [routes.js](../../src/constants/routes.js) — route name constants (use these, never hardcode route strings)

## Component Priority (strictly follow)

1. **`@/components/elements/`** — `BaseButton`, `BaseInput`, `BaseCard`, `BaseAvatar`, `BaseBell`, `BaseSortFilter,...` — check FIRST
2. **`@/components/common/`** — `BaseModal`, `BaseTripCard`, `BaseSearchForm`, `BaseSavePaymentForm,...` — check SECOND
3. **Nuxt UI `U*` components** — when no Base*/Common* wrapper exists (`USelect`, `UCheckbox`, `UBadge`, `UModal`, etc.)
4. **Raw HTML + Tailwind** — only when none of the above applies

## Icon Priority (strictly follow)

1. `src/assets/icons/Icon*.vue` — check existing icons: `IconArrow`, `IconAvatar`, `IconBell`, `IconCalendar`, `IconEye`, `IconEyeOff`, `IconHexagon`, `IconLock`, `IconMail`, `IconPhone`, `IconUser`
2. `<UIcon name="i-heroicons-*" />` — infer closest Heroicons name when no asset icon matches
3. Create new `src/assets/icons/IconName.vue` — only if neither above covers the icon

## Requirements

- Output format: Vue SFC with `<script setup>` first, then `<template>`. **No `<style>` block.**
- All styling via **Tailwind CSS v4 utility classes**. No `style=""` attributes. No SCSS.
- Replace all absolute positioning from Figma with Flexbox or Grid Tailwind classes.
- Remove all Figma-specific attributes (`data-figma-*`, `data-node-*`, `data-layer`).
- Use semantic HTML (`<header>`, `<nav>`, `<main>`, `<form>`, `<label>`, `<button>`).
- Add accessibility: `for`/`id` on label+input pairs, `alt` on images, `type="button"` on non-submit buttons.
- All imports use the `@/` alias — never relative paths.
- Route names from `@/constants/routes` — never hardcoded strings.
- No API calls in the component — delegate to stores or services.
- Mobile-first responsive design using Tailwind breakpoint prefixes (`sm:`, `md:`, `lg:`).
- If the component exceeds 300 lines of template, split it into sub-components.

## Figma HTML
<!-- INPUT FROM PROMPT -->

## Output

Provide:
1. The complete Vue SFC file with its suggested path (e.g. `src/pages/auth/LoginPage.vue`).
2. Any new icon components created at `src/assets/icons/`.
3. Any composable extracted to `src/composables/`, if reusable logic was identified.
4. A brief summary: which Base/Common components were reused, which Nuxt UI components were used, which icons were resolved.
