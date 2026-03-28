import { useEffect, useState } from 'react'
import { fetchMe } from '../services/api'
import { authService, type UserMe } from '../services/authService'

export default function ProfilePage({ go }: { go: (route: string) => void }) {
  const [user, setUser] = useState<UserMe | null>(() => authService.getCachedUser())

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      go('login')
      return
    }
    void fetchMe()
      .then((me) => {
        const minimal: UserMe = {
          id: me.id,
          email: me.email,
          name: me.name,
          surname: me.surname,
          roles: Array.isArray(me.roles) ? (me.roles as UserMe['roles']) : [],
        }
        authService.setCachedUser(minimal)
        setUser(minimal)
      })
      .catch(() => {
        authService.logout()
        go('login')
      })
  }, [go])

  if (!user) {
    return (
      <div className="px-4 py-20 text-center text-kozhura-text">
        <p>Загрузка профиля…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold text-kozhura-ink">Профиль</h1>
      <p className="mt-4 text-kozhura-text">
        {user.surname} {user.name}
      </p>
      <p className="mt-1 text-kozhura-text">{user.email}</p>
      <button
        type="button"
        onClick={() => {
          authService.logout()
          go('home')
        }}
        className="mt-8 rounded-full border border-kozhura-text px-5 py-2 text-sm font-medium text-kozhura-text transition hover:border-kozhura-orange hover:text-kozhura-orange"
      >
        Выйти
      </button>
    </div>
  )
}
