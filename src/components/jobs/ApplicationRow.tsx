import { useState } from 'react'
import type { ApplicationWithUser } from '../../services/api'
import ExpandToggle from './ExpandToggle'

interface ApplicationRowProps {
  application: ApplicationWithUser
  onOpen: (applicationId: number) => void
  onAccept: (applicationId: number) => void
  onReject: (applicationId: number) => void
  disabled?: boolean
}

export default function ApplicationRow({
  application,
  onOpen,
  onAccept,
  onReject,
  disabled,
}: ApplicationRowProps) {
  const [coursesOpen, setCoursesOpen] = useState(false)
  const courses = application.user.courses ?? []
  const fullName = `${application.user.surname} ${application.user.name}`.trim()
  const processed = application.accepted !== null

  return (
    <div className="flex gap-2 sm:gap-3">
      <ExpandToggle
        expanded={coursesOpen}
        onToggle={() => setCoursesOpen((v) => !v)}
        label={coursesOpen ? 'Свернуть курсы' : 'Показать курсы кандидата'}
      />
      <div className="min-w-0 flex-1 rounded-2xl border border-zinc-200/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-zinc-900">{fullName}</p>
            {coursesOpen && courses.length > 0 && (
              <ul className="mt-2 space-y-1">
                {courses.map((c) => (
                  <li key={c.id} className="text-sm font-medium text-kozhura-orange">
                    {c.title}
                  </li>
                ))}
              </ul>
            )}
            {coursesOpen && courses.length === 0 && (
              <p className="mt-2 text-sm font-light text-kozhura-text">Нет записей на курсы</p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:pt-0">
            <button
              type="button"
              onClick={() => onOpen(application.id)}
              className="rounded-full border border-zinc-300/90 bg-white px-4 py-1.5 text-sm font-medium text-zinc-800 transition hover:border-kozhura-orange hover:text-kozhura-orange"
            >
              Открыть
            </button>
            <button
              type="button"
              disabled={disabled || processed}
              onClick={() => onReject(application.id)}
              aria-label="Отклонить"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300/90 bg-white text-lg text-zinc-600 transition hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ×
            </button>
            <button
              type="button"
              disabled={disabled || processed}
              onClick={() => onAccept(application.id)}
              aria-label="Принять"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300/90 bg-white text-kozhura-orange transition hover:border-kozhura-orange disabled:cursor-not-allowed disabled:opacity-40"
            >
              ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
