# Frontend Codex Instructions

Use this file for frontend tasks in `booking_ticket_vue/`. Shared Codex assets
live in the repository root `.codex/`; do not recreate a nested project `.codex`
folder.

## Project Structure

This is a Vue 3 Composition API booking-ticket SPA built with Vite, Pinia, Vue
Router, Axios, Tailwind CSS, Nuxt UI, Vitest, and Playwright. The frontend talks
to Java Spring Boot REST services for booking and revenue management.

Application code lives in `src/`. Pages are grouped by role in
`src/pages/user`, `src/pages/admin`, and `src/pages/auth`. Shared layouts are in
`src/layouts`, reusable UI in `src/components`, Pinia stores in `src/stores`, API
wrappers in `src/services`, shared helpers in `src/utils`, constants in
`src/constants`, and static assets in `src/assets` or `public`.

## Required Context

Before editing frontend code, read the relevant files in this order:

1. `../AGENTS.md`
2. `../.codex/references/frontend/frontend-instructions.md`
3. The specific frontend rule files for the task area:
   - `../.codex/references/frontend/rules/clean-code.md`
   - `../.codex/references/frontend/rules/rule-component.md`
   - `../.codex/references/frontend/rules/api-service-rules.md`
   - `../.codex/references/frontend/rules/figma-style-rules.md`
4. The relevant skill under `../.codex/skills/` when the request matches a
   specialized workflow.
5. The closest existing source files in the target area.

Detailed legacy reference material is preserved in
`../.codex/references/frontend/`. Load only the reference file needed for the
current task.

## Architecture Rules

- Use `<script setup>` and Composition API only.
- Use `@/` aliases for internal imports.
- Import route names from `@/constants/routes`; do not hardcode route names in
  new code.
- Import API endpoints from `src/constants/api_endpoint.js` or the current
  project endpoint constant module; do not scatter endpoint strings.
- Stores call services; components and pages should not call `axios` directly.
- Services use `apiClient` from `src/services/axios.js`; services do not hold
  state or show UI feedback.
- `components/elements` communicate only through props and emits.
- Prefer existing `Base*`, `App*`, and shared components before creating new
  components.
- Keep UI work aligned with the existing Figma/component guidance unless the
  user explicitly asks for a redesign.

## Build, Test, And Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start Vite on `http://localhost:5173`.
- `npm run build`: create a production build.
- `npm run preview`: serve the production build on port `4173`.
- `npm run test:unit`: run Vitest unit tests in `jsdom`.
- `npm run test:e2e`: run Playwright browser tests from `e2e`.
- `npm run format`: format files under `src/` with Prettier and the Tailwind
  plugin.

Use Node `^20.19.0` or `>=22.12.0`, as required by `package.json`.

## Coding And Testing

- Use Vue single-file components with PascalCase filenames, such as
  `BaseButton.vue` or `TripsManagement.vue`.
- Keep base elements in `src/components/elements` and broader shared components
  in `src/components/common`.
- Name composables with `useX`, stores by domain, and service files as
  `domainService.js`.
- Follow the existing JavaScript style: ES modules, single quotes, no
  semicolons, and two-space indentation.
- Write focused unit tests as `*.spec.js` in `src/__tests__` or near the
  relevant source if the structure expands.
- Put full user-flow coverage in Playwright specs under `e2e`.

## Do Not

- Do not modify `.github` AI files unless explicitly requested; they are legacy
  AI-assistant reference.
- Do not create duplicate components when an existing component can be reused or
  extended.
- Do not use Options API, Vuex patterns, or `src/store/`.
- Do not put business logic in primitive components.
- Do not commit secrets, tokens, or local environment credentials.
