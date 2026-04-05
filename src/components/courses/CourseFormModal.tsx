import { FormEvent, useEffect, useState } from 'react'
import {
  createCategory,
  createCourse,
  fetchCategories,
  fetchUsersByRole,
  patchCourseMentors,
  updateCourse,
  type CategoryDto,
  type CourseCreatePayload,
  type CoursePublic,
  type UserListItem,
} from '../../services/api'
import { getApiErrorMessage } from '../../services/apiErrors'

interface CourseFormModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  /** Редактирование существующего курса */
  editing: CoursePublic | null
  onRequestNewCategory: (cat: CategoryDto) => void
}

function buildPayload(
  draft: boolean,
  isPublic: boolean,
  isPractical: boolean,
  values: {
    title: string
    description: string
    maxUsers: string
    videoUrl: string
    costStr: string
    companyId: string
    categoryId: number
  },
): CourseCreatePayload {
  const visible = !draft && isPublic
  let cost: number | null = null
  if (!isPractical) {
    if (visible && isPublic) {
      const n = parseInt(values.costStr.replace(/\D/g, ''), 10)
      cost = Number.isNaN(n) ? 0 : n
    } else if (values.costStr.trim()) {
      const n = parseInt(values.costStr.replace(/\D/g, ''), 10)
      cost = Number.isNaN(n) ? null : n
    }
  }
  const max_users = values.maxUsers.trim() ? parseInt(values.maxUsers.replace(/\D/g, ''), 10) : null
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    is_practical: isPractical,
    request_available: isPractical ? visible : false,
    is_visible: visible,
    cost,
    max_users: max_users !== null && !Number.isNaN(max_users) ? max_users : null,
    video_url: (values.videoUrl.trim() || 'https://example.com').startsWith('http')
      ? values.videoUrl.trim()
      : `https://${values.videoUrl.trim()}`,
    company_id: values.companyId ? Number(values.companyId) : null,
    category_id: values.categoryId,
  }
}

export default function CourseFormModal({
  open,
  onClose,
  onSaved,
  editing,
  onRequestNewCategory,
}: CourseFormModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [maxUsers, setMaxUsers] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [costStr, setCostStr] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [categoryId, setCategoryId] = useState<number>(0)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [companies, setCompanies] = useState<UserListItem[]>([])
  const [mentors, setMentors] = useState<UserListItem[]>([])
  const [mentorIds, setMentorIds] = useState<number[]>([])
  const [draft, setDraft] = useState(true)
  const [isPractical, setIsPractical] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newCatName, setNewCatName] = useState('')
  const [addingCat, setAddingCat] = useState(false)

  useEffect(() => {
    if (!open) return
    setError(null)
    void fetchCategories().then(setCategories).catch(() => setCategories([]))
    void fetchUsersByRole('company').then(setCompanies).catch(() => setCompanies([]))
    void fetchUsersByRole('mentor').then(setMentors).catch(() => setMentors([]))
  }, [open])

  useEffect(() => {
    if (!open) return
    if (editing) {
      setTitle(editing.title)
      setDescription(editing.description)
      setMaxUsers(editing.max_users != null ? String(editing.max_users) : '')
      setVideoUrl(editing.video_url || '')
      setCostStr(editing.cost != null ? String(editing.cost) : '')
      setCompanyId(editing.company?.id != null ? String(editing.company.id) : '')
      setCategoryId(editing.category.id)
      setDraft(!editing.is_visible)
      setIsPractical(editing.is_practical)
      setIsPublic(editing.is_visible)
      setMentorIds(editing.mentors?.map((m) => m.id) ?? [])
    } else {
      setTitle('')
      setDescription('')
      setMaxUsers('')
      setVideoUrl('')
      setCostStr('')
      setCompanyId('')
      setCategoryId(0)
      setDraft(true)
      setIsPractical(false)
      setIsPublic(false)
      setMentorIds([])
    }
  }, [open, editing])

  useEffect(() => {
    if (categories.length && !editing && categoryId === 0) {
      setCategoryId(categories[0].id)
    }
  }, [categories, editing, categoryId])

  useEffect(() => {
    if (!isPractical) setMentorIds([])
  }, [isPractical])

  const setDraftSafe = (v: boolean) => {
    setDraft(v)
    if (v) setIsPublic(false)
  }
  const setPublicSafe = (v: boolean) => {
    setIsPublic(v)
    if (v) setDraft(false)
  }

  const showCost = isPublic && !isPractical
  const showMentors = isPractical

  const toggleMentor = (id: number) => {
    setMentorIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleAddCategory = async () => {
    const name = newCatName.trim()
    if (name.length < 2) return
    setAddingCat(true)
    setError(null)
    try {
      const cat = await createCategory(name)
      setCategories((c) => [...c, cat].sort((a, b) => a.name.localeCompare(b.name)))
      setCategoryId(cat.id)
      onRequestNewCategory(cat)
      setNewCatName('')
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setAddingCat(false)
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!categoryId) {
      setError('Выберите категорию')
      return
    }
    if (showCost && !draft && isPublic && costStr.trim() === '') {
      setError('Укажите стоимость для публичного теоретического курса (0 — бесплатно).')
      return
    }
    setPending(true)
    setError(null)
    try {
      const payload = buildPayload(draft, isPublic, isPractical, {
        title,
        description,
        maxUsers,
        videoUrl,
        costStr,
        companyId,
        categoryId,
      })
      if (editing) {
        await updateCourse(editing.id, payload)
        if (isPractical) {
          await patchCourseMentors(editing.id, mentorIds)
        }
      } else {
        const created = await createCourse(payload)
        if (isPractical && mentorIds.length > 0) {
          await patchCourseMentors(created.id, mentorIds)
        }
      }
      onSaved()
      onClose()
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
      onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-zinc-900/45 backdrop-blur-[2px]" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-modal-title"
        className="relative z-10 max-h-[min(92vh,900px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xl sm:p-8"
        onMouseDown={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="course-modal-title" className="flex-1 text-center text-xl font-semibold text-kozhura-orange">
            Курс
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Закрыть"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Заголовок <span className="text-kozhura-orange">*</span>
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={128}
              className="mt-1 w-full border-0 border-b border-zinc-300 bg-transparent py-2 text-[#121212] outline-none focus:border-kozhura-orange"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Описание <span className="text-kozhura-orange">*</span>
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              maxLength={4096}
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-[#121212] outline-none focus:border-kozhura-orange"
            />
          </label>

          <div className={`grid gap-4 ${showCost ? 'sm:grid-cols-2' : ''}`}>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Общее количество мест
              </span>
              <input
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full border-0 border-b border-zinc-300 bg-transparent py-2 text-[#121212] outline-none focus:border-kozhura-orange"
              />
            </label>
            {showCost && (
              <label className="block">
                <span
                  className={`text-xs font-medium uppercase tracking-wide ${isPublic ? 'text-kozhura-orange' : 'text-zinc-500'}`}
                >
                  Стоимость
                </span>
                <input
                  value={costStr}
                  onChange={(e) => setCostStr(e.target.value)}
                  inputMode="numeric"
                  placeholder="0"
                  className="mt-1 w-full border-0 border-b border-zinc-300 bg-transparent py-2 text-[#121212] outline-none focus:border-kozhura-orange"
                />
              </label>
            )}
          </div>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Ссылка на видео</span>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="youtube / rutube"
              className="mt-1 w-full border-0 border-b border-zinc-300 bg-transparent py-2 text-[#121212] outline-none focus:border-kozhura-orange"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Выберите компанию</span>
              <div className="relative mt-1">
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-zinc-300 bg-white py-2.5 pl-3 pr-9 text-sm outline-none focus:border-kozhura-orange"
                >
                  <option value="">— не выбрано —</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.surname} {c.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-kozhura-orange">
                  ▾
                </span>
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Категория <span className="text-kozhura-orange">*</span>
              </span>
              <div className="relative mt-1">
                <select
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  required
                  className="w-full appearance-none rounded-xl border border-zinc-300 bg-white py-2.5 pl-3 pr-9 text-sm outline-none focus:border-kozhura-orange"
                >
                  <option value="" disabled>
                    —
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-kozhura-orange">
                  ▾
                </span>
              </div>
            </label>
          </div>

          <div className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 p-3">
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Новая категория"
              className="min-w-[140px] flex-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={addingCat || newCatName.trim().length < 2}
              className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm hover:border-kozhura-orange disabled:opacity-40"
            >
              + Добавить
            </button>
          </div>

          {showMentors && (
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Кураторы</span>
              <div className="mt-2 max-h-36 space-y-2 overflow-y-auto rounded-xl border border-zinc-200 p-2">
                {mentors.length === 0 ? (
                  <p className="text-sm text-zinc-500">Нет доступных кураторов (нужна авторизация автора).</p>
                ) : (
                  mentors.map((m) => (
                    <label key={m.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={mentorIds.includes(m.id)}
                        onChange={() => toggleMentor(m.id)}
                        className="rounded border-zinc-300 text-kozhura-orange focus:ring-kozhura-orange"
                      />
                      <span>
                        {m.surname} {m.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-zinc-100 pt-4 text-sm">
            <button type="button" onClick={onClose} className="text-zinc-600 hover:text-kozhura-orange">
              Отменить
            </button>
            <span className="text-zinc-300">/</span>
            <button
              type="submit"
              disabled={pending}
              className="font-medium text-kozhura-orange hover:underline disabled:opacity-50"
            >
              Сохранить
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 border-t border-zinc-100 pt-4">
            <ToggleRow label="Черновик" active={draft} onChange={setDraftSafe} />
            <ToggleRow
              label="Теория / Практика"
              active={isPractical}
              onChange={setIsPractical}
              hint="Вкл — практика"
            />
            <ToggleRow label="Публичный" active={isPublic} onChange={setPublicSafe} accent={isPublic} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  active,
  onChange,
  hint,
  accent,
}: {
  label: string
  active: boolean
  onChange: (v: boolean) => void
  hint?: string
  accent?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-[10px] font-medium uppercase tracking-wide ${accent ? 'text-kozhura-orange' : 'text-zinc-500'}`}>
        {label}
      </span>
      {hint && <span className="text-[10px] text-zinc-400">{hint}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={active}
        onClick={() => onChange(!active)}
        className={`relative h-7 w-12 rounded-full transition-colors ${active ? 'bg-kozhura-orange' : 'bg-zinc-300'}`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            active ? 'left-6' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}
