import { FormEvent, useState } from 'react'
import { fetchMe, loginRequest } from '../services/api'
import { authService } from '../services/authService'

export default function LoginPage({ go }: { go: (route: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const { access_token } = await loginRequest(email.trim(), password)
      authService.setAccessToken(access_token)
      const me = await fetchMe()
      authService.setCachedUser({
        id: me.id,
        email: me.email,
        name: me.name,
        surname: me.surname,
        roles: Array.isArray(me.roles) ? me.roles : [],
      })
      go('home')
    } catch {
      setError('Неверный email или пароль')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-2xl font-semibold text-kozhura-ink">Вход</h1>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <label className="block text-sm text-kozhura-text">
          Email
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-black outline-none focus:border-kozhura-orange"
          />
        </label>
        <label className="block text-sm text-kozhura-text">
          Пароль
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-black outline-none focus:border-kozhura-orange"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-kozhura-orange py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? 'Вход…' : 'Войти'}
        </button>
      </form>
      <button type="button" onClick={() => go('home')} className="mt-6 text-sm text-kozhura-text underline-offset-2 hover:underline">
        На главную
      </button>
    </div>
  )
}
