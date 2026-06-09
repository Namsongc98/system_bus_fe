import { createRouter, createWebHistory } from 'vue-router'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/user'
import { adminRoutes } from './routes/admin'
import { setupGuards } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    ...userRoutes,
    ...adminRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

setupGuards(router)

export default router
