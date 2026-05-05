import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    redirect: '/travel-application',
    children: [
      {
        path: 'travel-application',
        name: 'TravelApplication',
        component: () => import('../views/TravelApplication.vue'),
        meta: { title: '出差申请单', requiresAuth: true }
      },
      {
        path: 'my-applications',
        name: 'MyApplications',
        component: () => import('../views/MyApplications.vue'),
        meta: { title: '我的申请单', requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 出差申请单系统` : '出差申请单系统'
  
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    next('/travel-application')
  } else {
    next()
  }
})

export default router
