import http from '../utils/http'

export const getUsers = () => http.get('/users')

export const login = (data) => http.post('/users/login', data)

export const updateProfile = (data) => http.put('/users/profile', data)

export const changePassword = (data) => http.put('/users/password', data)
