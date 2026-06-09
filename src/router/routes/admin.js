import { ROUTE_NAMES } from '@/constants/routes'

/** @type {import('vue-router').RouteRecordRaw[]} */
export const adminRoutes = [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '', redirect: { name: ROUTE_NAMES.ADMIN_DASHBOARD } },
      {
        path: 'dashboard',
        name: ROUTE_NAMES.ADMIN_DASHBOARD,
        component: () => import('@/pages/admin/DashboardView.vue'),
      },
      {
        path: 'tickets',
        name: ROUTE_NAMES.ADMIN_TICKETS,
        component: () => import('@/pages/admin/TicketsAdmin.vue'),
      },
      {
        path: 'revenue',
        name: ROUTE_NAMES.ADMIN_REVENUE,
        component: () => import('@/pages/admin/RevenueReports.vue'),
      },
      {
        path: 'buses-routes',
        alias: 'buses',
        name: ROUTE_NAMES.ADMIN_BUSES,
        component: () => import('@/pages/admin/BusesRoutes.vue'),
      },
      {
        path: 'trips',
        name: ROUTE_NAMES.ADMIN_TRIPS,
        component: () => import('@/pages/admin/TripsManagement.vue'),
      },
      {
        path: 'users',
        name: ROUTE_NAMES.ADMIN_USERS,
        component: () => import('@/pages/admin/UserManagement.vue'),
      },
    ],
  },
]
