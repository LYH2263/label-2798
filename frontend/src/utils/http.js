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
      const { id } = JSON.parse(userInfo)
      config.headers['X-User-Id'] = id
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  (response) => {
    const { data } = response

    if (data && (data.status === 200 || data.status === 201)) {
      return data
    }

    if (data && data.message) {
      ElMessage.error(data.message)
      return Promise.reject(new Error(data.message))
    }

    return data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 401:
          ElMessage.error(data?.message || '登录已过期，请重新登录')
          sessionStorage.removeItem('userInfo')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
        case 403:
          ElMessage.error(data?.message || '权限不足')
          break
        case 404:
          ElMessage.error(data?.message || '请求的资源不存在')
          break
        case 400:
          ElMessage.error(data?.message || '请求参数错误')
          break
        case 500:
          ElMessage.error(data?.message || '服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '网络请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      ElMessage.error(error.message || '网络请求失败')
    }

    return Promise.reject(error)
  }
)

export default http
