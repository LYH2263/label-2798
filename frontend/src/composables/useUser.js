import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { login as loginApi, changePassword as changePasswordApi } from '../api/userApi'

export const useUser = () => {
  const userInfo = ref({ username: '', role: '' })
  const loading = ref(false)

  const roleText = computed(() => {
    const map = { admin: '管理员', manager: '经理', staff: '普通员工' }
    return map[userInfo.value.role] || '普通员工'
  })

  const roleType = computed(() => {
    const map = { admin: 'danger', manager: 'warning', staff: 'primary' }
    return map[userInfo.value.role] || 'primary'
  })

  const loadUserInfo = () => {
    const stored = sessionStorage.getItem('userInfo')
    if (stored) {
      userInfo.value = JSON.parse(stored)
    }
  }

  const handleLogin = async (username, password) => {
    loading.value = true
    try {
      const res = await loginApi({ username, password })
      if (res.status === 200) {
        sessionStorage.setItem('userInfo', JSON.stringify(res.data))
        userInfo.value = res.data
        ElMessage.success('登录成功')
        return true
      }
    } catch (error) {
      ElMessage.error('登录失败，请稍后重试')
    } finally {
      loading.value = false
    }
    return false
  }

  const handleChangePassword = async (id, oldPassword, newPassword) => {
    loading.value = true
    try {
      await changePasswordApi({ id, oldPassword, newPassword })
      ElMessage.success('密码修改成功，请重新登录')
      return true
    } catch (error) {
      ElMessage.error(error.message || '密码修改失败')
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    sessionStorage.removeItem('userInfo')
    userInfo.value = { username: '', role: '' }
  }

  onMounted(() => {
    loadUserInfo()
  })

  return {
    userInfo,
    loading,
    roleText,
    roleType,
    loadUserInfo,
    handleLogin,
    handleChangePassword,
    logout
  }
}
