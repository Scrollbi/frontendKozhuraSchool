import axios from 'axios'
import { authService } from './authService'

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const token = authService.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export interface FilePublic {
  id: string
  path: string
}

export interface UserMinimal {
  id: number
  name: string
  surname: string
  avatar: FilePublic | null
}

export interface CoursePublic {
  id: number
  title: string
  description: string
  is_practical: boolean
  request_available: boolean
  is_visible: boolean
  cost: number | null
  video_url: string
  company: UserMinimal | null
  category: { id: number; name: string }
}

export interface NewsPublic {
  id: number
  title: string
  content: string
  is_published: boolean
  created_at: string
  files: FilePublic[]
}

export async function fetchCourses(): Promise<CoursePublic[]> {
  // завершающий / чтобы FastAPI не отдавал 307 на абсолютный URL бэкенда (ломает CORS через Vite proxy)
  const { data } = await apiClient.get<CoursePublic[]>('/courses/')
  return data
}

export async function fetchNews(): Promise<NewsPublic[]> {
  const { data } = await apiClient.get<NewsPublic[]>('/news/')
  return data
}

export async function fetchNewsById(id: number): Promise<NewsPublic> {
  const { data } = await apiClient.get<NewsPublic>(`/news/${id}/`)
  return data
}

export async function loginRequest(username: string, password: string): Promise<{ access_token: string }> {
  const body = new URLSearchParams()
  body.set('username', username)
  body.set('password', password)
  const { data } = await apiClient.post<{ access_token: string; token_type: string }>('/users/login', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export async function fetchMe(): Promise<UserMeResponse> {
  const { data } = await apiClient.get<UserMeResponse>('/users/me')
  return data
}

/** Minimal fields we use from UserMe */
export type UserMeResponse = import('./authService').UserMe & Record<string, unknown>

export function publicFileUrl(path: string): string {
  if (!path) return ''
  const trimmed = path.replace(/^\/+/, '')
  const normalized = trimmed.startsWith('public/') ? trimmed.slice('public/'.length) : trimmed
  return `/files/public/${normalized}`
}
