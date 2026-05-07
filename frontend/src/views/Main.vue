<template>
  <el-container class="main-container">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-header">
        <el-icon class="header-icon"><Box /></el-icon>
        <span class="header-title">库存管理</span>
      </div>
      
      <el-menu
        :default-active="$route.path"
        router
        class="sidebar-menu"
        background-color="#1a1f37"
        text-color="#b8c2cc"
        active-text-color="#fff"
      >
        <el-menu-item index="/main/products">
          <el-icon><Box /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/main/employees">
          <el-icon><UserFilled /></el-icon>
          <span>员工管理</span>
        </el-menu-item>
        <el-menu-item index="/main/profile">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="main-header">
        <div class="header-left">
          <el-icon class="collapse-btn"><Fold /></el-icon>
          <span class="breadcrumb">{{ breadcrumbTitle }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="36" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ userInfo.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区 -->
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

const router = useRouter()
const userInfo = ref({ username: '', role: '' })
const breadcrumbTitle = ref('商品管理')

onMounted(() => {
  const stored = sessionStorage.getItem('userInfo')
  if (stored) {
    userInfo.value = JSON.parse(stored)
  }
  // 根据路由设置面包屑
  updateBreadcrumb()
})

const updateBreadcrumb = () => {
  const path = router.currentRoute.value.path
  if (path.includes('/products')) {
    breadcrumbTitle.value = '商品管理'
  } else if (path.includes('/employees')) {
    breadcrumbTitle.value = '员工管理'
  } else if (path.includes('/profile')) {
    breadcrumbTitle.value = '个人中心'
  }
}

// 监听路由变化
router.afterEach(() => {
  updateBreadcrumb()
})

const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/main/profile')
  } else if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      sessionStorage.removeItem('userInfo')
      ElMessage.success('退出成功')
      router.push('/login')
    }).catch(() => {})
  }
}
</script>

<style scoped>
.main-container {
  min-height: 100vh;
  background: transparent;
}

.sidebar {
  background: linear-gradient(180deg, #151a2e 0%, #1f2a44 100%);
  box-shadow: 6px 0 22px rgba(15, 23, 42, 0.18);
  z-index: 10;
}

.sidebar-header {
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  color: #fff;
  background: rgba(255, 255, 255, 0.04);
}

.header-icon {
  font-size: 32px;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-right: 12px;
}

.header-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.sidebar-menu {
  border: none;
  padding: 16px 12px;
}

:deep(.el-menu-item) {
  height: 54px !important;
  line-height: 54px !important;
  margin-bottom: 8px !important;
  border-radius: 12px !important;
  font-weight: 500 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
}

:deep(.el-menu-item.is-active) {
  background: var(--primary-gradient) !important;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.25) !important;
  color: #fff !important;
}

.main-header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  height: 70px !important;
}

.breadcrumb {
  font-size: 16px;
  font-weight: 700;
  color: #2d3748;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 16px;
  background: #f3f6ff;
  border-radius: 100px;
  transition: all 0.2s;
}

.user-info:hover {
  background: #eaf0ff;
  transform: translateY(-1px);
}

.username {
  font-weight: 600;
  font-size: 14px;
}

.main-content {
  padding: 24px 30px 28px;
  height: calc(100vh - 70px);
  overflow: hidden;
}
</style>
