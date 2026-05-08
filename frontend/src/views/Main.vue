<template>
  <el-container class="main-container">
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-header">
        <el-icon class="header-icon"><Box /></el-icon>
        <span class="header-title">库存管理</span>
      </div>
      <el-menu :default-active="$route.path" router class="sidebar-menu" background-color="#1a1f37" text-color="#b8c2cc" active-text-color="#fff">
        <el-menu-item index="/main/products">
          <el-icon><Box /></el-icon><span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/main/employees">
          <el-icon><UserFilled /></el-icon><span>员工管理</span>
        </el-menu-item>
        <el-menu-item index="/main/profile">
          <el-icon><User /></el-icon><span>个人中心</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="main-header">
        <div class="header-left">
          <el-icon class="collapse-btn"><Fold /></el-icon>
          <span class="breadcrumb">{{ breadcrumbTitle }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="36" class="user-avatar"><el-icon><User /></el-icon></el-avatar>
              <span class="username">{{ userInfo.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile"><el-icon><User /></el-icon>个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout"><el-icon><SwitchButton /></el-icon>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUser } from '../composables/useUser'
import '../styles/main.css'

const router = useRouter()
const { userInfo, logout } = useUser()
const breadcrumbTitle = ref('商品管理')

const updateBreadcrumb = () => {
  const path = router.currentRoute.value.path
  if (path.includes('/products')) breadcrumbTitle.value = '商品管理'
  else if (path.includes('/employees')) breadcrumbTitle.value = '员工管理'
  else if (path.includes('/profile')) breadcrumbTitle.value = '个人中心'
}

onMounted(() => updateBreadcrumb())
router.afterEach(() => updateBreadcrumb())

const handleCommand = async (command) => {
  if (command === 'profile') {
    router.push('/main/profile')
  } else if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      })
      logout()
      ElMessage.success('退出成功')
      router.push('/login')
    } catch { /* cancelled */ }
  }
}
</script>
