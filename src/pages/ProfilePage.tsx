import { useEffect, useState } from 'react'
import { fetchMe } from '../services/api'
import { getApiErrorMessage } from '../services/apiErrors'
import { authService, normalizeUserMe, type UserMe } from '../services/authService'

export default function ProfilePage({
  go,
  onOpenLogin,
}: {
  go: (route: string) => void
  onOpenLogin: () => void
}) {
  const [user, setUser] = useState<UserMe | null>(() =>
    authService.isAuthenticated() ? authService.getCachedUser() : null,
  )
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      onOpenLogin()
      return
    }
    setLoadError(null)
    void fetchMe()
      .then((me) => {
        const minimal = normalizeUserMe(me)
        authService.setCachedUser(minimal)
        setUser(minimal)
      })
      .catch((err) => {
        authService.logout()
        setLoadError(getApiErrorMessage(err))
        onOpenLogin()
      })
  }, [onOpenLogin])

  if (!authService.isAuthenticated()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-kozhura-text">Войдите, чтобы открыть профиль.</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="px-4 py-20 text-center text-kozhura-text">
        <p>{loadError ?? 'Загрузка профиля…'}</p>
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
