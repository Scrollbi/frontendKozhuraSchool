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
  /** Поля из полного CoursePublic бэкенда (для страницы «Курсы») */
  author?: UserMinimal
  mentors?: UserMinimal[]
  rating?: number | null
  max_users?: number | null
  users_count?: number | null
  completed_users?: number
}

export interface CategoryDto {
  id: number
  name: string
}

export interface CourseCreatePayload {
  title: string
  description: string
  is_practical: boolean
  request_available: boolean
  is_visible: boolean
  cost: number | null
  max_users: number | null
  video_url: string
  company_id: number | null
  category_id: number
}

export type CourseUpdatePayload = Partial<CourseCreatePayload>

export interface UserListItem {
  id: number
  name: string
  surname: string
  email: string
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

export async function fetchCategories(): Promise<CategoryDto[]> {
  const { data } = await apiClient.get<CategoryDto[]>('/categories/')
  return data
}

export async function createCategory(name: string): Promise<CategoryDto> {
  const { data } = await apiClient.post<CategoryDto>('/categories/', { name: name.trim() })
  return data
}

export async function updateCategory(categoryId: number, name: string): Promise<CategoryDto> {
  const { data } = await apiClient.patch<CategoryDto>(`/categories/${categoryId}`, { name: name.trim() })
  return data
}

export async function createCourse(payload: CourseCreatePayload): Promise<CoursePublic> {
  const { data } = await apiClient.post<CoursePublic>('/courses/', payload)
  return data
}

export async function updateCourse(courseId: number, payload: CourseUpdatePayload): Promise<CoursePublic> {
  const { data } = await apiClient.patch<CoursePublic>(`/courses/${courseId}`, payload)
  return data
}

export async function patchCourseMentors(courseId: number, mentorIds: number[]): Promise<CoursePublic> {
  const { data } = await apiClient.patch<CoursePublic>(`/courses/${courseId}/mentors`, mentorIds)
  return data
}

/** Компании и кураторы — требуют роль автора/ментора (как на бэкенде). */
export async function fetchUsersByRole(
  role: 'company' | 'mentor',
  query?: string,
): Promise<UserListItem[]> {
  const { data } = await apiClient.get<UserListItem[]>('/users/', {
    params: { role, limit: 200, ...(query ? { query } : {}) },
  })
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

export interface RegisterPayload {
  email: string
  name: string
  surname: string
  password: string
}

/** Регистрация (POST /users/register). Возвращает UserMinimal; дальше нужен отдельный login для токена. */
export async function registerRequest(payload: RegisterPayload): Promise<UserMinimal> {
  const { data } = await apiClient.post<UserMinimal>('/users/register', {
    email: payload.email.trim(),
    name: payload.name.trim(),
    surname: payload.surname.trim(),
    password: payload.password,
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

// —— Вакансии и отклики (бэкенд: /jobs, /applications, /company_requests) ——

export interface CompanyUserPublic {
  id: number
  name: string
  surname: string
  avatar: FilePublic | null
  avatar_full: FilePublic | null
  company_description: string | null
  company_extra: string | null
  company_video: string | null
}

export interface CourseMinimal {
  id: number
  title: string
  description: string
  is_practical: boolean
  request_available: boolean
  is_visible: boolean
  cost: number | null
  video_url: string | null
  category: { id: number; name: string }
  rating: number | null
}

export interface JobPublic {
  id: number
  title: string
  salary_min: number
  salary_max: number
  employment_type: string
  description: string
  is_visible: boolean
  company_id: number
  created_at: string
  company: CompanyUserPublic
  courses: CourseMinimal[]
}

export interface JobCreatePayload {
  title: string
  salary_min: number
  salary_max: number
  employment_type: string
  description: string
  is_visible: boolean
}

export interface UserForApplication extends UserMinimal {
  email: string
  courses: CourseMinimal[]
  cv_text?: string | null
}

export interface ApplicationWithUser {
  id: number
  user_id: number
  job_id: number
  accepted: boolean | null
  message: string | null
  created_at: string
  user: UserForApplication
}

export interface CompanyCardPublic extends UserMinimal {
  avatar_full: FilePublic | null
  company_description: string
  company_extra: string | null
  company_video: string
  free_courses: CourseMinimal | null
  paid_courses: CourseMinimal | null
}

/** Дополняет карточки с API компаниями из вакансий, если витрина пустая или не все работодатели попали в /company_cards. */
export function mergeCompanyCardsWithJobs(
  cards: CompanyCardPublic[],
  jobsList: JobPublic[],
): CompanyCardPublic[] {
  const map = new Map<number, CompanyCardPublic>()
  for (const c of cards) map.set(c.id, c)
  for (const j of jobsList) {
    if (map.has(j.company_id)) continue
    const co = j.company
    const desc =
      (co.company_description?.trim() || `${co.surname} ${co.name}`.trim()) || 'Компания'
    map.set(j.company_id, {
      id: co.id,
      name: co.name,
      surname: co.surname,
      avatar: co.avatar,
      avatar_full: co.avatar_full,
      company_description: desc,
      company_extra: co.company_extra ?? null,
      company_video: co.company_video ?? 'https://example.com/',
      free_courses: null,
      paid_courses: null,
    })
  }
  return [...map.values()]
}

export interface ApplicationPublic {
  id: number
  user_id: number
  job_id: number
  accepted: boolean | null
  message: string | null
  created_at: string
  user: UserForApplication
  job: {
    id: number
    title: string
    salary_min: number
    salary_max: number
    employment_type: string
    description: string
    is_visible: boolean
    company_id: number
    created_at: string
  }
}

export async function fetchCompanyCards(): Promise<CompanyCardPublic[]> {
  const { data } = await apiClient.get<CompanyCardPublic[]>('/company_requests/company_cards')
  return data
}

export async function fetchJobs(): Promise<JobPublic[]> {
  const { data } = await apiClient.get<JobPublic[]>('/jobs/')
  return data
}

export async function fetchJob(jobId: number): Promise<JobPublic> {
  const { data } = await apiClient.get<JobPublic>(`/jobs/${jobId}/`)
  return data
}

export async function fetchJobApplications(jobId: number): Promise<ApplicationWithUser[]> {
  const { data } = await apiClient.get<ApplicationWithUser[]>(`/jobs/${jobId}/applications/`)
  return data
}

export async function createJob(payload: JobCreatePayload): Promise<JobPublic> {
  const { data } = await apiClient.post<JobPublic>('/jobs/', payload)
  return data
}

export async function fetchApplication(applicationId: number): Promise<ApplicationPublic> {
  const { data } = await apiClient.get<ApplicationPublic>(`/applications/${applicationId}`)
  return data
}

export async function acceptApplication(applicationId: number): Promise<ApplicationPublic> {
  const { data } = await apiClient.put<ApplicationPublic>(`/applications/${applicationId}/accept`, {})
  return data
}

export async function rejectApplication(applicationId: number): Promise<ApplicationPublic> {
  const { data } = await apiClient.put<ApplicationPublic>(`/applications/${applicationId}/reject`, {})
  return data
}
