// src/lib/api.ts
// ─────────────────────────────────────────────────────────────
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { useEmployeeStore } from '@/store/employeeStore'

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1'

// Public API client (no auth)
export const publicApi = axios.create({
  baseURL: BASE_URL + '/public',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

// Admin API client
export const adminApi = axios.create({
  baseURL: BASE_URL + '/admin',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

adminApi.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

// Employee API client
export const employeeApi = axios.create({
  baseURL: BASE_URL + '/employee',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

employeeApi.interceptors.request.use((config) => {
  const token = useEmployeeStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

employeeApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useEmployeeStore.getState().logout()
      window.location.href = '/employee/login'
    }
    return Promise.reject(err)
  }
)

// Auth clients (no prefix)
export const authApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})