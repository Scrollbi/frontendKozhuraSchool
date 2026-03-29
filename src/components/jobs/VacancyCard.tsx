import type { JobPublic } from '../../services/api'

interface VacancyCardProps {
  job: JobPublic
  onApplications: (vacancyId: number) => void
}

function formatSalary(from: number, to: number): { from: string; to: string } {
  const f = new Intl.NumberFormat('ru-RU').format(from)
  const t = new Intl.NumberFormat('ru-RU').format(to)
  return { from: f, to: t }
}

export default function VacancyCard({ job, onApplications }: VacancyCardProps) {
  const companyName = `${job.company.surname} ${job.company.name}`.trim()
  const { from, to } = formatSalary(job.salary_min, job.salary_max)

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-zinc-200/60 bg-white/70 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-sm transition hover:border-zinc-300/80 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-snug text-zinc-900">{job.title}</h3>
        <button
          type="button"
          className="shrink-0 rounded-lg p-1.5 text-kozhura-text/60 transition hover:bg-zinc-100 hover:text-zinc-800"
          aria-label="Действия"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="6" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="18" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>
      <p className="line-clamp-4 text-sm font-light leading-relaxed text-kozhura-text">{job.description}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-800">
        <span>От {from} ₽</span>
        <span>До {to} ₽</span>
      </div>
      <p className="text-center text-sm font-medium text-kozhura-text">{companyName}</p>
      <button
        type="button"
        onClick={() => onApplications(job.id)}
        className="mx-auto mt-1 rounded-full border border-zinc-300/90 bg-white/90 px-6 py-2 text-sm font-medium text-zinc-800 transition hover:border-kozhura-orange hover:text-kozhura-orange"
      >
        Заявки
      </button>
    </article>
  )
}
