import type { ReactNode } from 'react'

interface CoursesShellProps {
  children: ReactNode
}

/** Шапка страницы только для курсов (без вкладок вакансий/компаний). */
export default function CoursesShell({ children }: CoursesShellProps) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-6 sm:px-8 lg:px-[106px] lg:pt-10">
      <div className="flex w-full items-start justify-center">
        <h1 className="relative pb-2 text-base font-semibold uppercase tracking-wide text-kozhura-orange after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-kozhura-orange sm:text-lg">
          Курсы
        </h1>
      </div>

      <div className="mt-8 min-h-[40vh]">{children}</div>
    </div>
  )
}
