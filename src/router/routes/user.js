import { ROUTE_NAMES } from '@/constants/routes'

/** @type {import('vue-router').RouteRecordRaw[]} */
export const userRoutes = [
  {
    path: '/',
    component: () => import('@/layouts/UserLayout.vue'),
    meta: { requiresAuth: true, role: 'user' },
    children: [
      { path: '', redirect: { name: ROUTE_NAMES.TRIP_VIEW } },
      {
        path: 'trips',
        name: ROUTE_NAMES.TRIP_VIEW,
        component: () => import('@/pages/user/TripView.vue'),
      },
      {
        path: 'seats/:tripId',
        name: ROUTE_NAMES.SEAT_VIEW,
        component: () => import('@/pages/user/SeatView.vue'),
      },
      {
        path: 'tickets',
        name: ROUTE_NAMES.MY_TICKETS,
        component: () => import('@/pages/user/MyTickets.vue'),
      },
      {
        path: 'profile',
        name: ROUTE_NAMES.PROFILE,
        component: () => import('@/pages/user/ProfileView.vue'),
      },
    ],
  },
]
