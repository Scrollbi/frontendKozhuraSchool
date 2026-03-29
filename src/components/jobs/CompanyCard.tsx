import type { CompanyCardPublic } from '../../services/api'

interface CompanyCardProps {
  company: CompanyCardPublic
  onOpenVacancies: (companyId: number) => void
}

export default function CompanyCard({ company, onOpenVacancies }: CompanyCardProps) {
  const title =
    company.company_description?.trim().slice(0, 120) ||
    `${company.surname} ${company.name}`.trim()

  return (
    <article className="flex min-h-[180px] flex-col items-center justify-between gap-4 rounded-2xl border border-zinc-200/60 bg-white/70 px-5 py-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-sm transition hover:border-zinc-300/80 hover:shadow-md sm:min-h-[200px]">
      <h3 className="line-clamp-4 text-center text-base font-semibold leading-snug text-zinc-900">{title}</h3>
      <button
        type="button"
        onClick={() => onOpenVacancies(company.id)}
        className="rounded-full border border-zinc-300/90 bg-white/80 px-5 py-2 text-sm font-medium text-zinc-800 transition hover:border-kozhura-orange hover:text-kozhura-orange"
      >
        Вакансии
      </button>
    </article>
  )
}
