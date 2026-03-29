import { useCallback, useEffect, useState } from 'react'
import {
  acceptApplication,
  fetchJob,
  fetchJobApplications,
  rejectApplication,
  type ApplicationWithUser,
  type JobPublic,
} from '../../services/api'
import ApplicationRow from './ApplicationRow'
import ExpandToggle from './ExpandToggle'

interface VacancyEmployerViewProps {
  vacancyId: number
  go: (route: string) => void
}

export default function VacancyEmployerView({ vacancyId, go }: VacancyEmployerViewProps) {
  const [job, setJob] = useState<JobPublic | null>(null)
  const [applications, setApplications] = useState<ApplicationWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [descOpen, setDescOpen] = useState(true)
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [j, apps] = await Promise.all([fetchJob(vacancyId), fetchJobApplications(vacancyId)])
      setJob(j)
      setApplications(apps)
    } catch {
      setError('Не удалось загрузить данные. Нужна авторизация как работодатель (компания), владеющая этой вакансией.')
      setJob(null)
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [vacancyId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (job?.title) document.title = `${job.title} — заявки — Kozhura School`
    return () => {
      document.title = 'Kozhura School'
    }
  }, [job?.title])

  const handleAccept = async (applicationId: number) => {
    setActionBusy(true)
    setActionError(null)
    try {
      await acceptApplication(applicationId)
      const apps = await fetchJobApplications(vacancyId)
      setApplications(apps)
    } catch {
      setActionError('Не удалось принять отклик.')
    } finally {
      setActionBusy(false)
    }
  }

  const handleReject = async (applicationId: number) => {
    setActionBusy(true)
    setActionError(null)
    try {
      await rejectApplication(applicationId)
      const apps = await fetchJobApplications(vacancyId)
      setApplications(apps)
    } catch {
      setActionError('Не удалось отклонить отклик.')
    } finally {
      setActionBusy(false)
    }
  }

  const handleOpen = (applicationId: number) => {
    go(`jobs/vacancy/${vacancyId}/application/${applicationId}`)
  }

  const pendingApplications = applications.filter((a) => a.accepted === null)

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-12 text-center text-kozhura-text lg:px-[106px]">
        <p className="text-sm font-light">Загрузка…</p>
      </div>
    )
  }

  if (error && !job) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-12 lg:px-[106px]">
        <p className="text-center text-red-600/90">{error}</p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => go('jobs/companies')}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-800 hover:border-kozhura-orange"
          >
            Назад
          </button>
          <button type="button" onClick={() => go('jobs')} className="text-sm text-kozhura-orange underline">
            К вакансиям
          </button>
        </div>
      </div>
    )
  }

  if (!job) return null

  const backTarget = `jobs/company/${job.company_id}`
  const companyName = `${job.company.surname} ${job.company.name}`.trim()

  return (
    <>
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-20 pt-6 sm:px-8 lg:px-[106px] lg:pt-10">
        <button
          type="button"
          onClick={() => go(backTarget)}
          className="rounded-full border border-zinc-300/90 bg-white/90 px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-kozhura-orange hover:text-kozhura-orange"
        >
          Назад к списку вакансий
        </button>

        <h1 className="mt-8 text-center text-2xl font-semibold tracking-tight text-[#121212] sm:text-3xl">
          {job.title}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-sm text-kozhura-text">
          Зарплата: {new Intl.NumberFormat('ru-RU').format(job.salary_min)} ₽ —{' '}
          {new Intl.NumberFormat('ru-RU').format(job.salary_max)} ₽
        </p>

        <div className="mx-auto mt-8 flex max-w-3xl gap-3">
          <ExpandToggle
            expanded={descOpen}
            onToggle={() => setDescOpen((v) => !v)}
            label={descOpen ? 'Свернуть описание' : 'Развернуть описание'}
          />
          <div className="min-w-0 flex-1 rounded-2xl border border-zinc-200/70 bg-zinc-50/80 p-4 sm:p-6">
            {descOpen ? (
              <div className="rounded-xl border border-dashed border-zinc-300/90 bg-white/70 p-4 text-sm font-light leading-relaxed text-kozhura-text">
                {job.description}
              </div>
            ) : (
              <p className="text-sm font-light text-kozhura-text/70">Описание скрыто. Нажмите «+» слева, чтобы показать.</p>
            )}
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-3xl">
          <p className="mb-2 text-sm font-semibold text-zinc-900">Требуемые курсы:</p>
          <div className="flex flex-wrap gap-2">
            {job.courses.length === 0 ? (
              <span className="text-sm font-light text-kozhura-text">Не указаны в вакансии</span>
            ) : (
              job.courses.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full border border-kozhura-orange/35 bg-white/80 px-3 py-1 text-sm text-zinc-800"
                >
                  {c.title}
                </span>
              ))
            )}
          </div>
        </div>

        {actionError && (
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm text-amber-800">{actionError}</p>
        )}

        <div className="mx-auto mt-14 max-w-3xl border-t border-zinc-200/80 pt-10">
          <h2 className="mb-2 text-lg font-semibold text-zinc-900">Список заявок</h2>
          <p className="mb-6 text-sm font-light text-kozhura-text">
            Показаны только необработанные отклики. Принятые заявки скрыты.
          </p>
          {pendingApplications.length === 0 ? (
            <p className="text-sm font-light text-kozhura-text">
              Нет необработанных заявок по этой вакансии.
            </p>
          ) : (
            <ul className="flex flex-col gap-5">
              {pendingApplications.map((a) => (
                <li key={a.id}>
                  <ApplicationRow
                    application={a}
                    onOpen={handleOpen}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    disabled={actionBusy}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-10 text-center text-sm text-kozhura-text">{companyName}</p>
      </div>
    </>
  )
}
