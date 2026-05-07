<template>
  <div class="profile-container">
    <el-card class="profile-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </div>
      </template>

      <div class="profile-content">
        <!-- 用户头像和信息 -->
        <div class="user-section">
          <el-avatar :size="100" class="user-avatar">
            <el-icon class="avatar-icon"><User /></el-icon>
          </el-avatar>
          <div class="user-basic">
            <h2 class="username">{{ userInfo.username }}</h2>
            <p class="user-role">{{ roleText }}</p>
          </div>
        </div>

        <el-divider />

        <!-- 详细信息表单 -->
        <div class="info-section">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">
              {{ userInfo.username }}
            </el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag :type="roleType">{{ roleText }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="登录时间">
              {{ loginTime }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <el-divider />

        <!-- 操作按钮 -->
        <div class="action-section">
          <el-button type="warning" @click="showPasswordDialog = true" :icon="Lock">
            修改密码
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="500px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="90px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdatePassword" :loading="loading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import http from '../utils/http'

const userInfo = ref({ username: '', role: '' })
const loginTime = ref('')
const loading = ref(false)
const showPasswordDialog = ref(false)
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const passwordFormRef = ref(null)

const roleText = computed(() => {
  return userInfo.value.role === 'admin' ? '管理员' : '普通员工'
})

const roleType = computed(() => {
  return userInfo.value.role === 'admin' ? 'danger' : 'primary'
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

onMounted(() => {
  const stored = sessionStorage.getItem('userInfo')
  if (stored) {
    userInfo.value = JSON.parse(stored)
  }
  loginTime.value = new Date().toLocaleString('zh-CN')
})

const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await http.put('/users/password', {
          id: userInfo.value.id,
          oldPassword: passwordForm.value.oldPassword,
          newPassword: passwordForm.value.newPassword
        })
        ElMessage.success('密码修改成功，请重新登录')
        passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
        showPasswordDialog.value = false
        setTimeout(() => {
          sessionStorage.removeItem('userInfo')
          window.location.href = '/login'
        }, 1500)
      } catch (error) {
        ElMessage.error(error.message || '密码修改失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.profile-container {
  width: 100%;
  padding: 16px;
}

.profile-card {
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.profile-content {
  padding: 6px 0;
}

.user-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 24px 0;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.avatar-icon {
  font-size: 50px;
  color: #fff;
}

.user-basic {
  text-align: left;
}

.username {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: var(--text-primary);
}

.user-role {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.info-section {
  padding: 8px 0;
}

.action-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 18px 0 8px;
}

@media (max-width: 768px) {
  .user-section {
    flex-direction: column;
    gap: 15px;
  }

  .action-section {
    flex-direction: column;
  }

  .action-section .el-button {
    width: 100%;
  }
}
</style>
