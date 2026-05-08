import axios from 'axios'
import { ElMessage } from 'element-plus'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use(
  (config) => {
    const userInfo = sessionStorage.getItem('userInfo')
    if (userInfo) {
      config.headers['x-user-info'] = userInfo
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || '网络请求失败'

    if (status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      sessionStorage.removeItem('userInfo')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
    } else {
      ElMessage.error(message)
    }

    return Promise.reject(error)
  }
)

export default http
