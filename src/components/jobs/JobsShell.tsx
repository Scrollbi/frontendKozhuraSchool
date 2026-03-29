import type { ReactNode } from 'react'

type JobsTab = 'vacancies' | 'companies'

interface JobsShellProps {
  activeTab: JobsTab
  go: (route: string) => void
  onAddClick: () => void
  children: ReactNode
  /** Показать кнопку «+» */
  showFab?: boolean
}

export default function JobsShell({
  activeTab,
  go,
  onAddClick,
  children,
  showFab = true,
}: JobsShellProps) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-6 sm:px-8 lg:px-[106px] lg:pt-10">
      <div className="flex w-full items-start justify-between gap-3">
        <div className="w-11 shrink-0 sm:w-12" aria-hidden />
        <div className="flex min-w-0 flex-1 justify-center gap-8 sm:gap-12 md:gap-16">
          <button
            type="button"
            onClick={() => go('jobs')}
            className={`relative pb-2 text-base font-light transition-colors sm:text-lg ${
              activeTab === 'vacancies'
                ? 'font-semibold text-kozhura-orange after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-kozhura-orange'
                : 'text-zinc-700 hover:text-kozhura-orange/90'
            }`}
          >
            Вакансии
          </button>
          <button
            type="button"
            onClick={() => go('jobs/companies')}
            className={`relative pb-2 text-base font-light transition-colors sm:text-lg ${
              activeTab === 'companies'
                ? 'font-semibold text-kozhura-orange after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-kozhura-orange'
                : 'text-zinc-700 hover:text-kozhura-orange/90'
            }`}
          >
            Компании
          </button>
        </div>
        {showFab ? (
          <button
            type="button"
            onClick={onAddClick}
            aria-label="Добавить вакансию"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-300/90 bg-white/90 text-2xl font-light leading-none text-zinc-800 shadow-sm transition hover:border-kozhura-orange hover:text-kozhura-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-kozhura-orange"
          >
            +
          </button>
        ) : (
          <div className="w-11 shrink-0 sm:w-12" aria-hidden />
        )}
      </div>

      <div className="mt-10 min-h-[40vh]">{children}</div>
    </div>
  )
}
