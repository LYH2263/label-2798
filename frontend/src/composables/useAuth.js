import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export function useAuth() {
  const userInfo = ref(null)

  const initUserInfo = () => {
    const stored = sessionStorage.getItem('userInfo')
    if (stored) {
      userInfo.value = JSON.parse(stored)
    }
    return userInfo.value
  }

  const getToken = () => {
    const info = userInfo.value || initUserInfo()
    return info ? info.id : null
  }

  const isLoggedIn = () => {
    return !!getToken()
  }

  const login = async (loginFn, credentials, successMessage = '登录成功') => {
    try {
      const res = await loginFn(credentials)
      if (res && res.data) {
        sessionStorage.setItem('userInfo', JSON.stringify(res.data))
        userInfo.value = res.data
        ElMessage.success(successMessage)
        return true
      }
      return false
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  const logout = (message = '退出成功') => {
    sessionStorage.removeItem('userInfo')
    userInfo.value = null
    ElMessage.success(message)
  }

  return {
    userInfo,
    initUserInfo,
    getToken,
    isLoggedIn,
    login,
    logout
  }
}
