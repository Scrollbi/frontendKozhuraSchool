import { useEffect, useState } from 'react'

const EMPLOYMENT_TYPES = [
  'Полная занятость',
  'Частичная занятость',
  'Проектная работа',
  'Оформление по ГПХ',
  'Стажировка',
] as const

export interface VacancyFormValues {
  title: string
  description: string
  employmentType: string
  salaryFrom: string
  salaryTo: string
  courses: [string, string, string]
  draft: boolean
}

interface VacancyFormModalProps {
  open: boolean
  onClose: () => void
  /** Возвращает Promise — при ошибке модалка не закрывается */
  onSave: (values: VacancyFormValues) => void | Promise<void>
}

const emptyCourses: [string, string, string] = ['', '', '']

export default function VacancyFormModal({ open, onClose, onSave }: VacancyFormModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [employmentType, setEmploymentType] = useState<string>('Полная занятость')
  const [salaryFrom, setSalaryFrom] = useState('')
  const [salaryTo, setSalaryTo] = useState('')
  const [courses, setCourses] = useState<[string, string, string]>([...emptyCourses])
  const [draft, setDraft] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleSave = async () => {
    setSaveError(null)
    if (!title.trim() || !description.trim()) {
      setSaveError('Заполните заголовок и описание.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        employmentType,
        salaryFrom: salaryFrom.trim(),
        salaryTo: salaryTo.trim(),
        courses: [...courses],
        draft,
      })
      onClose()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Не удалось сохранить вакансию.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px]"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vacancy-form-title"
        className="relative z-[1] flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 id="vacancy-form-title" className="flex-1 text-center text-xl font-semibold text-kozhura-orange">
            Вакансия
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Закрыть"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-kozhura-text">
            Заголовок<span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-0 border-b border-zinc-300 bg-transparent py-2 text-zinc-900 outline-none focus:border-kozhura-orange"
            placeholder=""
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-kozhura-text">
            Описание<span className="text-red-500">*</span>
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full resize-y rounded-xl border border-zinc-300/90 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-kozhura-orange focus:ring-1 focus:ring-kozhura-orange/30"
          />
        </label>

        <div className="mb-4">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-kozhura-text">
            Тип занятости
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {EMPLOYMENT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setEmploymentType(t)}
                className={`rounded-full border px-3 py-2 text-sm transition ${
                  employmentType === t
                    ? 'border-kozhura-orange text-kozhura-orange'
                    : 'border-zinc-300 text-zinc-800 hover:border-zinc-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-kozhura-text">
            Заработная плата
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="text-sm text-kozhura-text">с</span>
              <input
                type="text"
                inputMode="numeric"
                value={salaryFrom}
                onChange={(e) => setSalaryFrom(e.target.value)}
                className="w-28 rounded-full border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-kozhura-orange"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm text-kozhura-text">по</span>
              <input
                type="text"
                inputMode="numeric"
                value={salaryTo}
                onChange={(e) => setSalaryTo(e.target.value)}
                className="w-28 rounded-full border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-kozhura-orange"
              />
            </label>
          </div>
        </div>

        <div className="mb-6">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-kozhura-text">
            Требуемые курсы
          </span>
          <div className="flex flex-wrap gap-2">
            {([0, 1, 2] as const).map((i) => (
              <input
                key={i}
                type="text"
                value={courses[i]}
                onChange={(e) => {
                  const next = [...courses] as [string, string, string]
                  next[i] = e.target.value
                  setCourses(next)
                }}
                placeholder="имя"
                className="min-w-[100px] flex-1 rounded-full border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-kozhura-orange sm:max-w-[140px]"
              />
            ))}
          </div>
        </div>

        {saveError && <p className="mb-2 text-center text-sm text-red-600">{saveError}</p>}

        <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-zinc-100 pt-4 sm:flex-row">
          <label className="flex cursor-pointer items-center gap-3">
            <span className="text-sm text-zinc-700">Черновик</span>
            <button
              type="button"
              role="switch"
              aria-checked={draft}
              onClick={() => setDraft(!draft)}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                draft ? 'bg-kozhura-orange' : 'bg-zinc-300'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  draft ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </label>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="rounded-full bg-kozhura-orange px-8 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-kozhura-orange focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
