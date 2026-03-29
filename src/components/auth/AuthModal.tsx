import { type ReactNode, FormEvent, useEffect, useId, useRef, useState } from 'react'
import { fetchMe, loginRequest, registerRequest } from '../../services/api'
import { getApiErrorMessage } from '../../services/apiErrors'
import { authService, normalizeUserMe } from '../../services/authService'

type AuthMode = 'login' | 'register'

interface AuthModalProps {
  open: boolean
  mode: AuthMode
  onClose: () => void
  onModeChange: (mode: AuthMode) => void
  onLoggedIn: () => void
}

export default function AuthModal({ open, mode, onClose, onModeChange, onLoggedIn }: AuthModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) return
    setError(null)
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open, mode])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const completeSession = async () => {
    const me = await fetchMe()
    authService.setCachedUser(normalizeUserMe(me))
    onLoggedIn()
    onClose()
    setEmail('')
    setName('')
    setSurname('')
    setPassword('')
    setShowPassword(false)
  }

  const onSubmitLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const { access_token } = await loginRequest(email.trim(), password)
      authService.setAccessToken(access_token)
      await completeSession()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Неверный email или пароль'))
    } finally {
      setPending(false)
    }
  }

  const onSubmitRegister = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Пароль не короче 8 символов')
      return
    }
    if (name.trim().length < 2 || surname.trim().length < 2) {
      setError('Имя и фамилия — не короче 2 символов')
      return
    }
    setPending(true)
    try {
      await registerRequest({
        email: email.trim(),
        name: name.trim(),
        surname: surname.trim(),
        password,
      })
      const { access_token } = await loginRequest(email.trim(), password)
      authService.setAccessToken(access_token)
      await completeSession()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setPending(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-[2px]" aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-[420px] rounded-2xl border border-zinc-200/90 bg-white/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-8"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-xl font-semibold text-[#121212]">
            {mode === 'login' ? 'Вход' : 'Регистрация'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-kozhura-orange"
            aria-label="Закрыть"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mb-6 flex rounded-full border border-zinc-200/90 bg-zinc-50/80 p-1 text-sm">
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className={`flex-1 rounded-full py-2 font-medium transition ${
              mode === 'login'
                ? 'bg-white text-kozhura-orange shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => onModeChange('register')}
            className={`flex-1 rounded-full py-2 font-medium transition ${
              mode === 'register'
                ? 'bg-white text-kozhura-orange shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Регистрация
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={onSubmitLogin} className="flex flex-col gap-4">
            <Field label="Email" htmlFor="auth-email">
              <input
                ref={firstFieldRef}
                id="auth-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-[#121212] outline-none transition focus:border-kozhura-orange focus:ring-1 focus:ring-kozhura-orange"
              />
            </Field>
            <PasswordField
              id="auth-password-login"
              label="Пароль"
              autoComplete="current-password"
              value={password}
              onChange={setPassword}
              show={showPassword}
              onToggleShow={() => setShowPassword((s) => !s)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="mt-1 rounded-full bg-kozhura-orange py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-55"
            >
              {pending ? 'Вход…' : 'Войти'}
            </button>
          </form>
        ) : (
          <form onSubmit={onSubmitRegister} className="flex flex-col gap-4">
            <Field label="Email" htmlFor="auth-reg-email">
              <input
                ref={firstFieldRef}
                id="auth-reg-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-[#121212] outline-none transition focus:border-kozhura-orange focus:ring-1 focus:ring-kozhura-orange"
              />
            </Field>
            <Field label="Имя" htmlFor="auth-name">
              <input
                id="auth-name"
                type="text"
                autoComplete="given-name"
                required
                minLength={2}
                maxLength={16}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-[#121212] outline-none transition focus:border-kozhura-orange focus:ring-1 focus:ring-kozhura-orange"
              />
            </Field>
            <Field label="Фамилия" htmlFor="auth-surname">
              <input
                id="auth-surname"
                type="text"
                autoComplete="family-name"
                required
                minLength={2}
                maxLength={16}
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-[#121212] outline-none transition focus:border-kozhura-orange focus:ring-1 focus:ring-kozhura-orange"
              />
            </Field>
            <PasswordField
              id="auth-password-reg"
              label="Пароль"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
              show={showPassword}
              onToggleShow={() => setShowPassword((s) => !s)}
              hint="Не менее 8 символов"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="mt-1 rounded-full bg-kozhura-orange py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-55"
            >
              {pending ? 'Регистрация…' : 'Зарегистрироваться'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-zinc-700">
      {label}
      {children}
    </label>
  )
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
  hint,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggleShow: () => void
  autoComplete: string
  hint?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-3 pr-12 text-[#121212] outline-none transition focus:border-kozhura-orange focus:ring-1 focus:ring-kozhura-orange"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-kozhura-orange"
          aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
          tabIndex={-1}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A10.4 10.4 0 0112 5c6 0 10 7 10 7a18.5 18.5 0 01-5.1 5.8M6.4 6.4A18.5 18.5 0 002 12s4 7 10 7a9.7 9.7 0 004.2-.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
