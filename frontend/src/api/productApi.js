import http from '../utils/http'

export const getProducts = (params) => http.get('/products', { params })

export const getProductById = (id) => http.get(`/products/${id}`)

export const createProduct = (data) => http.post('/products', data)

export const updateProduct = (id, data) => http.put(`/products/${id}`, data)

export const deleteProduct = (id) => http.delete(`/products/${id}`)

export const updateStock = (id, data) => http.patch(`/products/${id}/stock`, data)
