import { useCallback, useEffect, useState } from 'react'
import {
  acceptApplication,
  fetchApplication,
  publicFileUrl,
  rejectApplication,
  type ApplicationPublic,
} from '../../services/api'
import { getApiErrorMessage } from '../../services/apiErrors'

interface ApplicationUserViewProps {
  vacancyId: number
  applicationId: number
  go: (route: string) => void
}

export default function ApplicationUserView({ vacancyId, applicationId, go }: ApplicationUserViewProps) {
  const [data, setData] = useState<ApplicationPublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const backRoute = `jobs/vacancy/${vacancyId}`

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const app = await fetchApplication(applicationId)
      if (app.job_id !== vacancyId) {
        setError('Этот отклик относится к другой вакансии.')
        setData(null)
        return
      }
      setData(app)
    } catch (e) {
      setError(getApiErrorMessage(e, 'Не удалось загрузить данные. Нужны права работодателя по этой вакансии.'))
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [applicationId, vacancyId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (data?.user) {
      const name = `${data.user.surname} ${data.user.name}`.trim()
      document.title = `${name} — о пользователе — Kozhura School`
    }
    return () => {
      document.title = 'Kozhura School'
    }
  }, [data?.user])

  const handleAccept = async () => {
    if (!data) return
    setActionBusy(true)
    setActionError(null)
    try {
      await acceptApplication(data.id)
      go(backRoute)
    } catch (e) {
      setActionError(getApiErrorMessage(e, 'Не удалось одобрить отклик.'))
    } finally {
      setActionBusy(false)
    }
  }

  const handleReject = async () => {
    if (!data) return
    setActionBusy(true)
    setActionError(null)
    try {
      await rejectApplication(data.id)
      go(backRoute)
    } catch (e) {
      setActionError(getApiErrorMessage(e, 'Не удалось отклонить отклик.'))
    } finally {
      setActionBusy(false)
    }
  }

  const handleContact = () => {
    if (!data?.user.email) return
    window.location.href = `mailto:${encodeURIComponent(data.user.email)}`
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 text-center text-sm font-light text-kozhura-text lg:px-[106px]">
        Загрузка…
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-12 lg:px-[106px]">
        <button
          type="button"
          onClick={() => go(backRoute)}
          className="rounded-full border border-zinc-300/90 bg-white/90 px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-kozhura-orange hover:text-kozhura-orange"
        >
          Назад
        </button>
        <p className="mt-8 text-center text-red-600/90">{error}</p>
      </div>
    )
  }

  const { user } = data
  const fullName = `${user.surname} ${user.name}`.trim()
  const courses = user.courses ?? []
  const avatarSrc = user.avatar?.path ? publicFileUrl(user.avatar.path) : null
  const pending = data.accepted === null
  const descriptionParts: string[] = []
  if (user.cv_text?.trim()) descriptionParts.push(user.cv_text.trim())
  if (data.message?.trim()) descriptionParts.push(`Сообщение к отклику:\n${data.message.trim()}`)
  const descriptionText =
    descriptionParts.length > 0 ? descriptionParts.join('\n\n') : 'Описание и резюме не указаны.'

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-24 pt-6 sm:px-8 lg:px-[106px] lg:pt-10">
      <button
        type="button"
        onClick={() => go(backRoute)}
        className="rounded-full border border-zinc-300/90 bg-white/90 px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-kozhura-orange hover:text-kozhura-orange"
      >
        Назад
      </button>

      <h1 className="mt-10 text-center text-2xl font-semibold tracking-tight text-[#121212] sm:text-3xl">
        О пользователе
      </h1>

      {!pending && (
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-zinc-600">
          Отклик уже обработан ({data.accepted ? 'одобрен' : 'отклонён'}). Кнопки решения недоступны.
        </p>
      )}

      {actionError && (
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-amber-800">{actionError}</p>
      )}

      <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8 lg:gap-y-12">
        {/* Левая колонка: аватар, имя, курсы */}
        <aside className="flex flex-col items-center text-center lg:col-span-3 lg:items-start lg:text-left">
          <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-900 bg-zinc-50">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserPlaceholderIcon className="h-20 w-20 text-zinc-800" />
            )}
          </div>
          <p className="mt-6 text-lg font-semibold text-[#121212]">{fullName}</p>
          <p className="mt-3 text-sm font-medium text-zinc-800">Курсы:</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
            {courses.length === 0 ? (
              <span className="text-sm font-light text-kozhura-text">Нет записей на курсы</span>
            ) : (
              courses.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-800"
                >
                  {c.title}
                </span>
              ))
            )}
          </div>
        </aside>

        {/* Центр: описание */}
        <section className="lg:col-span-6">
          <div className="border-t border-b border-zinc-300/80 py-6">
            <p className="whitespace-pre-wrap text-sm font-light leading-relaxed text-zinc-800">
              {descriptionText}
            </p>
          </div>
        </section>

        {/* Правая колонка: действия */}
        <div className="flex flex-col items-stretch justify-start gap-3 lg:col-span-3">
          <button
            type="button"
            onClick={handleContact}
            disabled={!user.email}
            className="rounded-full border border-zinc-900 bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Связаться
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={!pending || actionBusy}
            className="rounded-full border border-zinc-900 bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Отклонить
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={!pending || actionBusy}
            className="rounded-full border border-zinc-900 bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Одобрить
          </button>
        </div>
      </div>
    </div>
  )
}

function UserPlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
