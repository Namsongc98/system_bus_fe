# Frontend Claude Instructions

Use this file for frontend tasks in `booking_ticket_vue/`. Shared Claude assets
(skills, agents, hooks, references) live in the `System_bus` repository root
`.claude/`. Only the minimal `.claude/settings.json` in this repo is allowed;
do not create other nested `.claude` content here.

## Workspace Layout

The AI workflow expects this layout, with Claude Code started from `System_bus/`:

```
System_bus/            (AI config repo: CLAUDE.md, .claude/)
├── ticket-system/     (backend repo)
└── booking_ticket_vue/ (this repo)
```

Started from this repo alone, only this file and `.claude/settings.json` apply:
the `.env` deny rules still hold, but the shared hooks, skills, and the
references below are not loaded. If `../.claude/` does not exist, say so instead
of guessing its rules.

## Project Scope

Vue 3 Composition API booking-ticket SPA built with Vite, Pinia, Vue Router,
Axios, Tailwind CSS, Nuxt UI, Vitest, and Playwright. It talks to the Spring
Boot services through Kong (`VITE_KONG_API_URL`).

Pages are grouped by role in `src/pages/user`, `src/pages/admin`, and
`src/pages/auth`. Layouts are in `src/layouts`, reusable UI in
`src/components`, Pinia stores in `src/stores`, API wrappers in
`src/services`, helpers in `src/utils`, constants in `src/constants`.

## Required Context

Before editing frontend code, read in this order:

1. `../CLAUDE.md`
2. `../.claude/references/frontend/frontend-instructions.md`
3. The rule files for the task area in `../.claude/references/frontend/rules/`
   (`clean-code.md`, `rule-component.md`, `api-service-rules.md`,
   `figma-style-rules.md`).
4. The matching `frontend-*` skill under `../.claude/skills/`.
5. The closest existing source files in the target area.

## Architecture Rules

- Use `<script setup>` and Composition API only; no Options API, no Vuex.
- Use `@/` aliases for internal imports.
- Import route names from `@/constants/routes` and API endpoints from
  `src/constants/api_endpoint.js`; do not hardcode them.
- Stores call services; components and pages do not call `axios` directly.
- Services use `apiClient` from `src/services/axios.js` and hold no state or UI.
- `components/elements` communicate only through props and emits.
- Reuse existing `Base*`, `App*`, and shared components before creating new ones.

## Commands

```bash
npm install          # Node ^20.19.0 or >=22.12.0
npm run dev          # http://localhost:5173
npm run build
npm run test:unit    # Vitest
npm run test:e2e     # Playwright (needs the dev server)
npm run format       # Prettier, src/ only
```

Run `npm run test:unit` (and `npm run build` for non-trivial changes) before
reporting frontend work as done, and report which commands ran.

## Do Not

- Do not read `.env` or `.env.*`, print the environment, or commit local
  environment files. `.env` is git-ignored; use `.env.example` for names only.
- Do not modify `.github/` AI files or `AGENTS.md` unless asked; they are
  legacy assistant references.
- Do not create duplicate components or put business logic in primitives.
