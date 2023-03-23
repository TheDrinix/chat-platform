import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from "./guards/isAuthenticated";
import HomeView from '@/views/home/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/views/AboutView.vue')
    },
    {
      path: '/',
      redirect: { name: 'chatRequests' }
    },
    {
      path: '/chats',
      name: 'home',
      beforeEnter: isAuthenticated,
      component: HomeView,
      children: [
        { path: '', name: 'chatRequests', component: () => import("@/views/home/RequestsView.vue") },
        { path: ':chat_id', name: 'chat', component: () => import('@/views/home/ChatView.vue')}
      ]
    },
    {
      path: '/user',
      name: 'user',
      beforeEnter: isAuthenticated,
      component: () => import('@/views/UserView.vue')
    },
    { path: '/auth/confirm/:token', name: 'accountConfirmation', component: () => import("@/views/AccountConfirmView.vue") },
    { path: '/auth', name: 'auth', component: () => import('@/views/AuthView.vue') },
  ]
})

export default router
