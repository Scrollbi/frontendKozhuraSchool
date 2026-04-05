const ACCESS_KEY = 'kozhs_access_token'

export interface UserMe {
  id: number
  email: string
  name: string
  surname: string
  roles: { role: string }[]
}

/**
 * Бэкенд отдаёт roles то как ["admin"], то как [{ role: "admin" }] — приводим к одному виду.
 */
export function normalizeRoles(raw: unknown): { role: string }[] {
  if (!Array.isArray(raw)) return []
  const out: { role: string }[] = []
  for (const item of raw) {
    if (typeof item === 'string') {
      out.push({ role: item })
      continue
    }
    if (item && typeof item === 'object' && 'role' in item) {
      const r = (item as { role: unknown }).role
      if (typeof r === 'string') {
        out.push({ role: r })
        continue
      }
    }
  }
  return out
}

/** Проверка роли admin по сырому или нормализованному массиву roles. */
export function userHasAdminRole(roles: unknown): boolean {
  const list = normalizeRoles(roles)
  return list.some((x) => x.role.toLowerCase() === 'admin')
}

/** Приводит ответ /users/me к объекту для кэша (роли могут приходить в разном виде). */
export function normalizeUserMe(raw: {
  id: number
  email: string
  name: string
  surname: string
  roles?: unknown
}): UserMe {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    surname: raw.surname,
    roles: normalizeRoles(raw.roles),
  }
}

function dispatchAuthChange() {
  window.dispatchEvent(new Event('authChange'))
}

export const authService = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY)
  },

  setAccessToken(token: string | null) {
    if (token) localStorage.setItem(ACCESS_KEY, token)
    else localStorage.removeItem(ACCESS_KEY)
    dispatchAuthChange()
  },

  isAuthenticated(): boolean {
    return Boolean(authService.getAccessToken())
  },

  logout() {
    authService.setAccessToken(null)
    localStorage.removeItem('kozhs_user')
  },

  getCachedUser(): UserMe | null {
    const raw = localStorage.getItem('kozhs_user')
    if (!raw) return null
    try {
      return JSON.parse(raw) as UserMe
    } catch {
      return null
    }
  },

  setCachedUser(user: UserMe | null) {
    if (user) localStorage.setItem('kozhs_user', JSON.stringify(user))
    else localStorage.removeItem('kozhs_user')
    dispatchAuthChange()
  },
}
