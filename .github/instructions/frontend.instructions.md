# Booking Ticket — Copilot Instructions

---
applyTo: "src/**"
---

# Frontend Booking Ticket — Copilot Instructions

## Project Overview

Sales Management / Booking Ticket SPA built with **Vue 3 Composition API** connecting to a **Java Spring Boot** REST API backend.
Two user roles: `admin` and `user`. UI design lives in Figma — do **not** generate UI or styling unless explicitly asked.

---

## Tech Stack

| Layer          | Technology                             |
|----------------|----------------------------------------|
| Framework      | Vue 3 Composition API + `<script setup>` |
| Build          | Vite 8                                 |
| Routing        | Vue Router 5 (`src/router/`)           |
| State          | Pinia 3 — Setup Store style (`src/stores/`) |
| HTTP           | Axios (`src/services/axios.js`)        |
| CSS            | TailwindCSS 3 + SCSS                   |
| UI Library     | Nuxt UI                                |
| Testing        | Vitest (unit) + Playwright (e2e)       |

---

## Folder Structure — Key Conventions

```
src/
├── App.vue
├── main.js
│
├── stores/                    # Pinia stores — one file per domain (NOT src/store/)
│   ├── admin.js
│   ├── auth.js
│   ├── booking.js
│   ├── seat.js
│   ├── trip.js
│   └── user.js
│
├── services/                  # Axios service modules — one file per API resource
│   ├── axios.js               # apiClient singleton + interceptors
│   ├── adminService.js
│   ├── authService.js
│   ├── bookingService.js
│   ├── busRouteService.js
│   ├── loyaltyService.js
│   ├── paymentService.js
│   ├── revenueService.js
│   ├── salaryService.js
│   ├── seatService.js
│   ├── ticketService.js
│   ├── tripService.js
│   └── userService.js
│
├── composables/               # Reusable Composition API logic (use* naming)
│   ├── useAsync.js
│   ├── useAuth.js
│   ├── useModal.js
│   ├── usePagination.js
│   └── useToast.js
│
├── constants/                 # Frozen enums and app-wide constants
│   ├── api_endpoint.js        # All API endpoint strings — import as API_ENDPOINTS
│   ├── routes.js              # ROUTE_NAMES — all route name constants
│   └── index.js               # Re-exports / shared constants
│
├── errors/
│   └── ApiError.js            # Custom error class for API error handling
│
├── types/
│   └── index.js               # JSDoc @typedef domain model types
│
├── utils/                     # Pure helpers — no side effects
│   ├── formatters.js
│   ├── validators.js
│   ├── storage.js
│   └── index.js
│
├── styles/                    # SCSS partials — auto-injected via vite.config.js
│   ├── main.scss              # Entry: @use all partials
│   ├── _variables.scss        # Design tokens (colors, spacing, fonts)
│   ├── _mixins.scss
│   ├── _reset.scss
│   ├── _colors.scss
│   ├── _grids.scss
│   ├── _breakpoints.scss
│   ├── _animation.scss
│   └── _utilities.scss
│
├── static/                    # Static assets (not processed by Vite)
│   ├── icons/                 # Icon Vue components (Icon* naming)
│   │   ├── IconArrow.vue
│   │   ├── IconAvatar.vue
│   │   ├── IconBell.vue
│   │   ├── IconCalendar.vue
│   │   ├── IconEye.vue
│   │   ├── IconEyeOff.vue
│   │   ├── IconHexagon.vue
│   │   ├── IconLock.vue
│   │   ├── IconMail.vue
│   │   ├── IconPhone.vue
│   │   └── IconUser.vue
│   └── image/                 # Static image assets
│
├── layouts/                   # Full page layout wrappers
│   ├── AdminLayout.vue
│   └── UserLayout.vue
│
├── router/
│   ├── index.js               # Router instance + setupGuards()
│   ├── guards.js              # Navigation guards (requiresAuth, role checks)
│   └── routes/
│       ├── auth.js            # /login · /register
│       ├── user.js            # /trips · /seats · /payment · /profile
│       └── admin.js           # /admin/* routes
│
├── components/
│   ├── layout/                # App shell — no business logic
│   │   ├── admin/
│   │   │   ├── Header.vue
│   │   │   ├── Footer.vue
│   │   │   └── Sidebar.vue
│   │   └── user/
│   │       ├── AppHeader.vue
│   │       └── AppFooter.vue
│   ├── common/                # Complex reusable UI blocks — no store/service access
│   │   ├── BaseModal.vue
│   │   ├── BaseSearchForm.vue
│   │   └── ToastContainer.vue
│   └── elements/              # Stateless primitive UI — props in, emits out
│       ├── BaseAvatar.vue
│       ├── BaseBell.vue
│       ├── BaseButton.vue
│       ├── BaseCard.vue
│       └── BaseInput.vue
│
└── pages/
    ├── NotFoundPage.vue
    ├── auth/
    │   ├── LoginPage.vue
    │   └── RegisterPage.vue
    ├── user/
    │   ├── TripView.vue
    │   ├── SeatView.vue
    │   ├── PaymentView.vue
    │   └── ProfileView.vue
    └── admin/
        ├── DashboardView.vue
        ├── TicketsAdmin.vue
        ├── RevenueReports.vue
        ├── BusesRoutes.vue
        ├── TripsManagement.vue
        └── UserManagement.vue
```

---

## Architecture Rules — Always Follow

### Imports
- Use `@/` alias for all internal imports — never use relative paths like `../../`
- Import route names from `@/constants/routes` — never hardcode strings
- Import API endpoints from `@/constants/api` — never hardcode URLs

### Stores (`src/stores/`)
- Always use **Setup Store** style with `defineStore('name', () => { ... })`
- Structure: `ref/computed` → getters as `computed()` → async functions → `return {}`
- Stores call services for data fetching; they do not call `axios` directly
- Use `src/stores/` (plural) — not `src/store/`

### Services (`src/services/`)
- Each service is a plain object exported as `export const xxxService = { ... }`
- Methods map 1:1 to backend endpoints using constants from `@/constants/api`
- Services never hold state — they return raw axios promises

### Components
- All reusable primitives are prefixed with `Base` (e.g. `BaseButton`, `BaseInput`)
- Layout shell components are prefixed with `App` (e.g. `AppHeader`, `AppSidebar`)
- Page components use `View` or `Page` suffix (e.g. `TripView`, `LoginPage`)
- Components **only** receive props / emit events — no direct store calls in `elements/`

### Router
- All route names live in `ROUTE_NAMES` in `@/constants/routes.js`
- Route files split by role: `router/routes/auth.js` · `user.js` · `admin.js`
- Navigation guards live in `router/guards.js`, registered via `setupGuards(router)`
- Use `meta: { requiresAuth, requiresGuest, role }` for access control

### SCSS
- `_variables.scss` is auto-injected into every SFC via `vite.config.js additionalData`
- All SCSS variables are available in `<style>` blocks without explicit import
- New global styles → add a partial under `src/styles/` and `@use` it in `main.scss`

### Environment Variables
- All env vars are accessed via `import.meta.env.VITE_*`
- `VITE_KONG_API_URL` (Kong gateway, e.g. `http://localhost:8000/api`) is required and read **only** in
  `src/constants/api_endpoint.js`; `src/services/axios.js` builds the single `apiClient` from it

---

## Coding Standards

### Vue SFC
- Always use `<script setup>` syntax
- Props: use `defineProps()` with type + default for every prop
- Emits: declare all events with `defineEmits()`
- Avoid `Options API` — this project is Composition API only

### Naming
| Artifact        | Convention               | Example                      |
|-----------------|--------------------------|------------------------------|
| Page SFC        | PascalCase + View/Page   | `TripView.vue`, `LoginPage.vue` |
| Component SFC   | PascalCase + Base/App    | `BaseButton.vue`, `AppHeader.vue` |
| Layout SFC      | PascalCase + Layout      | `UserLayout.vue`             |
| Composable      | camelCase, `use` prefix  | `useAuth.js`, `usePagination.js` |
| Store file      | camelCase domain         | `auth.js`, `booking.js`      |
| Service file    | camelCase + Service      | `tripService.js`             |
| Route name      | PascalCase               | `TripView`, `AdminDashboard` |
| CSS class (BEM) | kebab-case               | `.base-modal`, `.app-sidebar`|
| Constants       | SCREAMING_SNAKE_CASE     | `ROUTE_NAMES`, `API_ENDPOINTS` |

### JavaScript
- ES2022+ features are fine (optional chaining, nullish coalescing, etc.)
- Use JSDoc `@typedef` in `src/types/index.js` for domain model types
- No TypeScript — JSDoc is the type documentation strategy

---

## State & Data Flow Pattern

```
Page → composable/store → service → axios → Java API
```

1. Pages call store actions or composables
2. Store actions call service methods
3. Service methods use `apiClient` from `services/axios.js`
4. `apiClient` response interceptor unwraps `response.data` automatically

---

## Authentication Flow

- JWT stored in `localStorage` via `LOCAL_STORAGE_KEYS` constants
- Token injected per-request in the Axios **request** interceptor
- `401` responses: auto-clear session + redirect to `/login` via **response** interceptor
- Role check: `useAuthStore().isAdmin` (computed from `user.role`)

---

## Adding a New Feature — Checklist

```
1. src/constants/api.js        → add endpoint(s)
2. src/services/xxxService.js  → add service module
3. src/stores/xxx.js           → add Pinia store
4. src/router/routes/xxx.js    → add route(s) + register in router/index.js
5. src/constants/routes.js     → add ROUTE_NAME entry
6. src/pages/xxx/XxxView.vue   → create page component
```

---

## What NOT to Do

- Do **not** write HTML template or UI styling unless asked
- Do **not** hardcode API URLs or route name strings
- Do **not** use Options API (`data()`, `methods:`, `computed:`)
- Do **not** call axios directly from a component or page
- Do **not** put business logic inside `elements/` components
- Do **not** create both `src/store/` and `src/stores/` — use `src/stores/` only
- Do **not** use `$store` or Vuex patterns — this project uses Pinia only

---

## Build & Dev Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run test:unit    # Vitest unit tests
npm run test:e2e     # Playwright end-to-end tests
```
