const ACCESS_KEY = 'kozhs_access_token'

export interface UserMe {
  id: number
  email: string
  name: string
  surname: string
  roles: { role: string }[]
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
