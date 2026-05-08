import { createRouter, createWebHistory } from 'vue-router'

const Login = () => import('../views/Login.vue')
const Main = () => import('../views/Main.vue')
const ProductManage = () => import('../views/ProductManage.vue')
const EmployeeManage = () => import('../views/EmployeeManage.vue')
const Profile = () => import('../views/Profile.vue')

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/main',
    name: 'Main',
    component: Main,
    meta: { requiresAuth: true },
    redirect: '/main/products',
    children: [
      {
        path: 'products',
        name: 'ProductManage',
        component: ProductManage,
        meta: { requiresAuth: true }
      },
      {
        path: 'employees',
        name: 'EmployeeManage',
        component: EmployeeManage,
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { requiresAuth: true }
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

  if (to.meta.requiresAuth === false) {
    if (userInfo) {
      next('/main')
    } else {
      next()
    }
  } else {
    if (userInfo) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
