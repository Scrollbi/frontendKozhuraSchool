import { useCallback, useEffect, useMemo, useState } from 'react'
import JobsShell from '../components/jobs/JobsShell'
import CompanyCard from '../components/jobs/CompanyCard'
import VacancyCard from '../components/jobs/VacancyCard'
import VacancyFormModal, { type VacancyFormValues } from '../components/jobs/VacancyFormModal'
import ApplicationUserView from '../components/jobs/ApplicationUserView'
import VacancyEmployerView from '../components/jobs/VacancyEmployerView'
import {
  createJob,
  fetchCompanyCards,
  fetchJobs,
  mergeCompanyCardsWithJobs,
  type CompanyCardPublic,
  type JobPublic,
} from '../services/api'

interface JobsPageProps {
  route: string
  go: (route: string) => void
}

function parseRoute(route: string) {
  if (route === 'jobs') return { kind: 'vacancies' as const }
  if (route === 'jobs/companies') return { kind: 'companies' as const }
  const appUser = /^jobs\/vacancy\/(\d+)\/application\/(\d+)$/.exec(route)
  if (appUser) {
    return {
      kind: 'applicationUser' as const,
      vacancyId: Number(appUser[1]),
      applicationId: Number(appUser[2]),
    }
  }
  const c = /^jobs\/company\/(\d+)$/.exec(route)
  if (c) return { kind: 'companyVacancies' as const, companyId: Number(c[1]) }
  const v = /^jobs\/vacancy\/(\d+)$/.exec(route)
  if (v) return { kind: 'vacancyEmployer' as const, vacancyId: Number(v[1]) }
  return { kind: 'vacancies' as const }
}

export default function JobsPage({ route, go }: JobsPageProps) {
  const parsed = useMemo(() => parseRoute(route), [route])
  const [formOpen, setFormOpen] = useState(false)
  const [companies, setCompanies] = useState<CompanyCardPublic[]>([])
  const [jobs, setJobs] = useState<JobPublic[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  const refreshJobs = useCallback(async () => {
    try {
      const j = await fetchJobs()
      setJobs(j)
    } catch {
      setJobs([])
    }
  }, [])

  useEffect(() => {
    if (!route.startsWith('jobs')) return
    let cancelled = false
    ;(async () => {
      try {
        const j = await fetchJobs()
        if (!cancelled) setJobs(j)
      } catch {
        if (!cancelled) setJobs([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [route])

  useEffect(() => {
    if (parsed.kind !== 'companies' && parsed.kind !== 'companyVacancies') return
    let cancelled = false
    setListLoading(true)
    setListError(null)
    fetchCompanyCards()
      .then((c) => {
        if (!cancelled) setCompanies(c)
      })
      .catch(() => {
        if (!cancelled) {
          setCompanies([])
          setListError('Не удалось загрузить компании. Проверьте, что бэкенд запущен.')
        }
      })
      .finally(() => {
        if (!cancelled) setListLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [parsed.kind])

  const displayCompanies = useMemo(
    () => mergeCompanyCardsWithJobs(companies, jobs),
    [companies, jobs],
  )

  const handleSaveForm = async (values: VacancyFormValues) => {
    const min = parseInt(values.salaryFrom.replace(/\D/g, ''), 10)
    const max = parseInt(values.salaryTo.replace(/\D/g, ''), 10)
    if (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < 0 || min > max) {
      throw new Error('Укажите корректный диапазон зарплаты (только цифры).')
    }
    await createJob({
      title: values.title,
      description: values.description,
      salary_min: min,
      salary_max: max,
      employment_type: values.employmentType,
      is_visible: !values.draft,
    })
    await refreshJobs()
  }

  if (parsed.kind === 'applicationUser') {
    return (
      <ApplicationUserView
        vacancyId={parsed.vacancyId}
        applicationId={parsed.applicationId}
        go={go}
      />
    )
  }

  if (parsed.kind === 'vacancyEmployer') {
    return <VacancyEmployerView vacancyId={parsed.vacancyId} go={go} />
  }

  if (parsed.kind === 'companyVacancies') {
    const company = displayCompanies.find((c) => c.id === parsed.companyId)
    const vacancies = jobs.filter((j) => j.company_id === parsed.companyId)
    const jobSample = vacancies[0] ?? jobs.find((j) => j.company_id === parsed.companyId)
    const companyTitle = jobSample
      ? `${jobSample.company.surname} ${jobSample.company.name}`.trim()
      : company
        ? company.company_description?.trim().slice(0, 120) || `${company.surname} ${company.name}`
        : `Компания #${parsed.companyId}`

    return (
      <>
        <JobsShell activeTab="companies" go={go} onAddClick={() => setFormOpen(true)}>
          <button
            type="button"
            onClick={() => go('jobs/companies')}
            className="mb-6 rounded-full border border-zinc-300/90 bg-white/90 px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-kozhura-orange hover:text-kozhura-orange"
          >
            Назад
          </button>
          {listLoading && !company && !jobSample && (
            <p className="text-center text-sm text-kozhura-text">Загрузка…</p>
          )}
          {listError && <p className="text-center text-sm text-red-600">{listError}</p>}
          <h2 className="text-center text-2xl font-semibold text-[#121212] sm:text-3xl">{companyTitle}</h2>
          <p className="mt-2 text-center text-sm font-light text-kozhura-text">Список вакансий компании</p>
          <div className="mx-auto mt-10 max-w-5xl border-t border-zinc-200/60 pt-10">
            {vacancies.length === 0 ? (
              <p className="text-center text-sm font-light text-kozhura-text">
                У этой компании пока нет вакансий или список ещё загружается.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {vacancies.map((job) => (
                  <VacancyCard key={job.id} job={job} onApplications={(id) => go(`jobs/vacancy/${id}`)} />
                ))}
              </div>
            )}
          </div>
        </JobsShell>
        <VacancyFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSaveForm} />
      </>
    )
  }

  if (parsed.kind === 'companies') {
    return (
      <>
        <JobsShell activeTab="companies" go={go} onAddClick={() => setFormOpen(true)}>
          {listLoading && (
            <p className="text-center text-sm font-light text-kozhura-text">Загрузка компаний…</p>
          )}
          {listError && <p className="mb-6 text-center text-sm text-red-600">{listError}</p>}
          {!listLoading && displayCompanies.length === 0 && !listError && (
            <p className="text-center text-sm font-light text-kozhura-text">
              Компаний пока нет: в бэкенде для витрины нужны активная компания с описанием и видео, либо опубликованные вакансии с привязкой к компании.
            </p>
          )}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {displayCompanies.map((c) => (
              <CompanyCard key={c.id} company={c} onOpenVacancies={(id) => go(`jobs/company/${id}`)} />
            ))}
          </div>
        </JobsShell>
        <VacancyFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSaveForm} />
      </>
    )
  }

  return (
    <>
      <JobsShell activeTab="vacancies" go={go} onAddClick={() => setFormOpen(true)}>
        <div className="flex min-h-[45vh] items-center justify-center rounded-2xl border border-dashed border-zinc-300/60 bg-white/30 px-4 py-16 text-center">
          <p className="max-w-md text-sm font-light leading-relaxed text-kozhura-text">
            Список всех вакансий с сайта можно смотреть во вкладке «Компании». Здесь позже появится общий каталог.
            Добавьте вакансию кнопкой «+» (нужна роль компании).
          </p>
        </div>
      </JobsShell>
      <VacancyFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSaveForm} />
    </>
  )
}
