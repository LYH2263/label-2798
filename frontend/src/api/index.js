import http from '../utils/http'

export const employeeApi = {
  getList: (params) => http.get('/employees', { params }),
  getById: (id) => http.get(`/employees/${id}`),
  create: (data) => http.post('/employees', data),
  update: (id, data) => http.put(`/employees/${id}`, data),
  delete: (id) => http.delete(`/employees/${id}`)
}

export const productApi = {
  getList: (params) => http.get('/products', { params }),
  getById: (id) => http.get(`/products/${id}`),
  create: (data) => http.post('/products', data),
  update: (id, data) => http.put(`/products/${id}`, data),
  delete: (id) => http.delete(`/products/${id}`),
  updateStock: (id, data) => http.patch(`/products/${id}/stock`, data)
}

export const userApi = {
  login: (data) => http.post('/users/login', data),
  updateProfile: (data) => http.put('/users/profile', data),
  updatePassword: (data) => http.put('/users/password', data)
}
