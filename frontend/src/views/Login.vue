<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <el-icon class="logo-icon"><Box /></el-icon>
        <h1 class="title">商品库存管理系统</h1>
        <p class="subtitle">Inventory Management System</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>测试账号: admin / 123456</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Box } from '@element-plus/icons-vue'
import { useAuth } from '../composables/useAuth'
import { useLoading } from '../composables/useLoading'
import { userApi } from '../api'

const router = useRouter()
const { login } = useAuth()
const { loading, runWithLoading } = useLoading()

const loginFormRef = ref()

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
  } catch {
    return
  }

  const success = await runWithLoading(
    () => login(
      (credentials) => userApi.login(credentials),
      { username: loginForm.username, password: loginForm.password },
      '登录成功'
    )
  )

  if (success) {
    router.push('/main')
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: radial-gradient(circle at top left, #e6e9f0 0%, #eef1f5 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  width: 1000px;
  height: 1000px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 50%;
  top: -400px;
  right: -300px;
  z-index: 0;
}

.login-box {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  padding: 50px 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.login-box:hover {
  transform: translateY(-5px);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  font-size: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 15px;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

.title {
  font-size: 28px;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 14px;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 500;
}

.login-form {
  margin-top: 30px;
}

:deep(.el-input__wrapper) {
  background-color: #f7fafc !important;
  box-shadow: none !important;
  border: 2px solid transparent !important;
  border-radius: 12px !important;
  padding: 8px 16px !important;
  transition: all 0.2s ease !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #667eea !important;
  background-color: #fff !important;
}

.login-btn {
  width: 100%;
  height: 54px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  margin-top: 15px;
  box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 15px 25px -5px rgba(102, 126, 234, 0.5);
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  color: #a0aec0;
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 480px) {
  .login-box {
    padding: 40px 25px;
  }
}
</style>
