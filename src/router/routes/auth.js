import { ROUTE_NAMES } from '@/constants/routes'

/** @type {import('vue-router').RouteRecordRaw[]} */
export const authRoutes = [
  {
    path: '/login',
    name: ROUTE_NAMES.LOGIN,
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: ROUTE_NAMES.REGISTER,
    component: () => import('@/pages/auth/RegisterPage.vue'),
    meta: { requiresGuest: true },
  },
]
