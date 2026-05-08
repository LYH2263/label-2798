import http from '../utils/http'

export const getEmployees = (params) => http.get('/employees', { params })

export const getEmployeeById = (id) => http.get(`/employees/${id}`)

export const createEmployee = (data) => http.post('/employees', data)

export const updateEmployee = (id, data) => http.put(`/employees/${id}`, data)

export const deleteEmployee = (id) => http.delete(`/employees/${id}`)
