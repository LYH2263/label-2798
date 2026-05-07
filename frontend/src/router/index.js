import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Main from '../views/Main.vue'
import EmployeeManage from '../views/EmployeeManage.vue'
import ProductManage from '../views/ProductManage.vue'
import Profile from '../views/Profile.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/main',
    name: 'Main',
    component: Main,
    redirect: '/main/products',
    children: [
      {
        path: 'products',
        name: 'ProductManage',
        component: ProductManage
      },
      {
        path: 'employees',
        name: 'EmployeeManage',
        component: EmployeeManage
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userInfo = sessionStorage.getItem('userInfo')
  
  if (to.path !== '/login' && !userInfo) {
    next('/login')
  } else if (to.path === '/login' && userInfo) {
    next('/main')
  } else {
    next()
  }
})

export default router