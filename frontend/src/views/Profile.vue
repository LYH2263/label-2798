<template>
  <div class="profile-container">
    <el-card class="profile-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><User /></el-icon><span>个人中心</span>
        </div>
      </template>
      <div class="profile-content">
        <div class="user-section">
          <el-avatar :size="100" class="user-avatar"><el-icon class="avatar-icon"><User /></el-icon></el-avatar>
          <div class="user-basic">
            <h2 class="username">{{ userInfo.username }}</h2>
            <p class="user-role">{{ roleText }}</p>
          </div>
        </div>
        <el-divider />
        <div class="info-section">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
            <el-descriptions-item label="角色"><el-tag :type="roleType">{{ roleText }}</el-tag></el-descriptions-item>
            <el-descriptions-item label="登录时间">{{ loginTime }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <el-divider />
        <div class="action-section">
          <el-button type="warning" @click="showPasswordDialog = true" :icon="Lock">修改密码</el-button>
        </div>
      </div>
    </el-card>
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
        <el-button type="primary" @click="handleUpdatePassword" :loading="loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Lock } from '@element-plus/icons-vue'
import { useUser } from '../composables/useUser'
import '../styles/profile.css'

const { userInfo, roleText, roleType, handleChangePassword, loading } = useUser()
const loginTime = ref('')
const showPasswordDialog = ref(false)
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const passwordFormRef = ref(null)

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.value.newPassword) callback(new Error('两次输入的密码不一致'))
  else callback()
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

onMounted(() => { loginTime.value = new Date().toLocaleString('zh-CN') })

const handleUpdatePassword = async () => {
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      const success = await handleChangePassword(
        userInfo.value.id, passwordForm.value.oldPassword, passwordForm.value.newPassword
      )
      if (success) {
        passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
        showPasswordDialog.value = false
        setTimeout(() => { sessionStorage.removeItem('userInfo'); window.location.href = '/login' }, 1500)
      }
    }
  })
}
</script>
