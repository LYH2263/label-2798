import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('../views/Main.vue'),
    redirect: '/main/products',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'products',
        name: 'ProductManage',
        component: () => import('../views/ProductManage.vue'),
        meta: { requiresAuth: true, title: '商品管理' }
      },
      {
        path: 'employees',
        name: 'EmployeeManage',
        component: () => import('../views/EmployeeManage.vue'),
        meta: { requiresAuth: true, title: '员工管理' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { requiresAuth: true, title: '个人中心' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userInfo = sessionStorage.getItem('userInfo')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !userInfo) {
    next('/login')
  } else if (to.path === '/login' && userInfo) {
    next('/main')
  } else {
    next()
  }
})

export default router
