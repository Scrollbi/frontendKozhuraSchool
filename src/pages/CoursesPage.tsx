import { useCallback, useEffect, useMemo, useState } from 'react'
import CourseFormModal from '../components/courses/CourseFormModal'
import CoursesShell from '../components/courses/CoursesShell'
import ExpandToggle from '../components/jobs/ExpandToggle'
import {
  fetchCourses,
  fetchMe,
  publicFileUrl,
  updateCategory,
  type CategoryDto,
  type CoursePublic,
} from '../services/api'
import { getApiErrorMessage } from '../services/apiErrors'
import { authService, normalizeUserMe, userHasAdminRole } from '../services/authService'

type SortKey = 'title' | 'rating'
type ViewMode = 'list' | 'grid'

function groupByCategory(courses: CoursePublic[]): Map<number, { category: CategoryDto; courses: CoursePublic[] }> {
  const map = new Map<number, { category: CategoryDto; courses: CoursePublic[] }>()
  for (const c of courses) {
    const id = c.category.id
    const existing = map.get(id)
    if (existing) {
      existing.courses.push(c)
    } else {
      map.set(id, {
        category: { id: c.category.id, name: c.category.name },
        courses: [c],
      })
    }
  }
  return map
}

function sortCourses(list: CoursePublic[], sort: SortKey): CoursePublic[] {
  const copy = [...list]
  if (sort === 'title') {
    copy.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
  } else {
    copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  }
  return copy
}

function descriptionBullets(text: string): string[] {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length > 1) return lines
  const parts = text.split(/[.;]/).map((p) => p.trim()).filter(Boolean)
  return parts.length > 1 ? parts : [text]
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CoursePublic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('title')
  const [view, setView] = useState<ViewMode>('list')
  const [practicalOpen, setPracticalOpen] = useState(true)
  const [theoreticalOpen, setTheoreticalOpen] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CoursePublic | null>(null)
  const [renameCat, setRenameCat] = useState<CategoryDto | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchCourses()
      setCourses(list)
    } catch {
      setError('Не удалось загрузить курсы.')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const syncIsAdmin = useCallback(() => {
    const u = authService.getCachedUser()
    setIsAdmin(u ? userHasAdminRole(u.roles) : false)
  }, [])

  useEffect(() => {
    const applyFromCache = () => {
      const u = authService.getCachedUser()
      setIsAdmin(u ? userHasAdminRole(u.roles) : false)
    }

    if (!authService.getAccessToken()) {
      setIsAdmin(false)
      window.addEventListener('authChange', syncIsAdmin)
      return () => window.removeEventListener('authChange', syncIsAdmin)
    }

    applyFromCache()

    void fetchMe()
      .then((me) => {
        authService.setCachedUser(normalizeUserMe(me))
        setIsAdmin(userHasAdminRole(me.roles))
      })
      .catch(() => applyFromCache())

    window.addEventListener('authChange', syncIsAdmin)
    return () => window.removeEventListener('authChange', syncIsAdmin)
  }, [syncIsAdmin])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return courses
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.name.toLowerCase().includes(q),
    )
  }, [courses, search])

  const practicalCourses = useMemo(
    () => sortCourses(filtered.filter((c) => c.is_practical), sort),
    [filtered, sort],
  )
  const theoreticalCourses = useMemo(
    () => sortCourses(filtered.filter((c) => !c.is_practical), sort),
    [filtered, sort],
  )

  const practicalGroups = useMemo(() => groupByCategory(practicalCourses), [practicalCourses])
  const theoreticalGroups = useMemo(() => groupByCategory(theoreticalCourses), [theoreticalCourses])

  const sortedPracticalKeys = useMemo(
    () =>
      [...practicalGroups.keys()].sort((a, b) =>
        (practicalGroups.get(a)?.category.name ?? '').localeCompare(
          practicalGroups.get(b)?.category.name ?? '',
          'ru',
        ),
      ),
    [practicalGroups],
  )
  const sortedTheoreticalKeys = useMemo(
    () =>
      [...theoreticalGroups.keys()].sort((a, b) =>
        (theoreticalGroups.get(a)?.category.name ?? '').localeCompare(
          theoreticalGroups.get(b)?.category.name ?? '',
          'ru',
        ),
      ),
    [theoreticalGroups],
  )

  const openCreate = () => {
    if (!isAdmin) return
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (c: CoursePublic) => {
    if (!isAdmin) return
    setEditing(c)
    setModalOpen(true)
  }

  const openRename = (cat: CategoryDto) => {
    if (!isAdmin) return
    setRenameCat(cat)
    setRenameValue(cat.name)
  }

  const saveRename = async () => {
    if (!renameCat || renameValue.trim().length < 2) return
    try {
      const updated = await updateCategory(renameCat.id, renameValue)
      setCourses((prev) =>
        prev.map((c) =>
          c.category.id === updated.id ? { ...c, category: { id: updated.id, name: updated.name } } : c,
        ),
      )
      setRenameCat(null)
    } catch (e) {
      setError(getApiErrorMessage(e, 'Не удалось переименовать направление.'))
    }
  }

  const cycleSort = () => setSort((s) => (s === 'title' ? 'rating' : 'title'))

  return (
    <>
      <CoursesShell>
        {loading && (
          <p className="text-center text-sm font-light text-kozhura-text">Загрузка курсов…</p>
        )}
        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        {!loading && (
          <>
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск"
                  className="w-full rounded-full border border-zinc-200/90 bg-white/90 py-2.5 pl-10 pr-4 text-sm text-zinc-900 outline-none focus:border-kozhura-orange"
                />
              </div>
              <div className="flex shrink-0 items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={cycleSort}
                  title={sort === 'title' ? 'Сортировка: название' : 'Сортировка: рейтинг'}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200/90 bg-white text-zinc-700 transition hover:border-kozhura-orange hover:text-kozhura-orange"
                >
                  <SortIcon />
                </button>
                <button
                  type="button"
                  onClick={() => setView((v) => (v === 'list' ? 'grid' : 'list'))}
                  title={view === 'list' ? 'Сетка' : 'Список'}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200/90 bg-white text-zinc-700 transition hover:border-kozhura-orange hover:text-kozhura-orange"
                >
                  {view === 'list' ? <GridIcon /> : <ListIcon />}
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={openCreate}
                    title="Добавить курс"
                    aria-label="Добавить курс"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300/90 bg-white/90 text-2xl font-light leading-none text-zinc-800 shadow-sm transition hover:border-kozhura-orange hover:text-kozhura-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-kozhura-orange"
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            <section className="mt-12">
              <div className="flex items-start gap-3">
                <ExpandToggle
                  expanded={practicalOpen}
                  onToggle={() => setPracticalOpen((v) => !v)}
                  label={practicalOpen ? 'Свернуть практические курсы' : 'Развернуть практические курсы'}
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold uppercase tracking-wide text-zinc-900">
                    Практические курсы
                  </h2>
                  {practicalOpen && (
                    <div className="mt-6 space-y-6">
                      {sortedPracticalKeys.length === 0 ? (
                        <p className="text-sm font-light text-kozhura-text">Нет практических курсов.</p>
                      ) : (
                        sortedPracticalKeys.map((key) => {
                          const block = practicalGroups.get(key)!
                          return (
                            <DirectionBlock
                              key={key}
                              category={block.category}
                              courses={block.courses}
                              view={view}
                              showRename={isAdmin}
                              onRename={() => openRename(block.category)}
                              onEditCourse={openEdit}
                              canEdit={isAdmin}
                            />
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-14">
              <div className="flex items-start gap-3">
                <ExpandToggle
                  expanded={theoreticalOpen}
                  onToggle={() => setTheoreticalOpen((v) => !v)}
                  label={theoreticalOpen ? 'Свернуть теоретические курсы' : 'Развернуть теоретические курсы'}
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold uppercase tracking-wide text-zinc-900">
                    Теоретические курсы
                  </h2>
                  {theoreticalOpen && (
                    <div className="mt-6 space-y-6">
                      {sortedTheoreticalKeys.length === 0 ? (
                        <p className="text-sm font-light text-kozhura-text">Нет теоретических курсов.</p>
                      ) : (
                        sortedTheoreticalKeys.map((key) => {
                          const block = theoreticalGroups.get(key)!
                          return (
                            <DirectionBlock
                              key={key}
                              category={block.category}
                              courses={block.courses}
                              view={view}
                              showRename={isAdmin}
                              onRename={() => openRename(block.category)}
                              onEditCourse={openEdit}
                              canEdit={isAdmin}
                            />
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </CoursesShell>

      <CourseFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSaved={() => void refresh()}
        editing={editing}
        onRequestNewCategory={() => {}}
      />

      {renameCat && (
        <div
          className="fixed inset-0 z-[190] flex items-center justify-center bg-zinc-900/40 p-4"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && setRenameCat(null)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
            <p className="text-sm font-medium text-zinc-900">Название направления</p>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="mt-3 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setRenameCat(null)} className="rounded-full px-4 py-2 text-sm text-zinc-600">
                Отмена
              </button>
              <button
                type="button"
                onClick={() => void saveRename()}
                className="rounded-full bg-kozhura-orange px-4 py-2 text-sm text-white"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function DirectionBlock({
  category,
  courses,
  view,
  showRename,
  onRename,
  onEditCourse,
  canEdit,
}: {
  category: CategoryDto
  courses: CoursePublic[]
  view: ViewMode
  showRename: boolean
  onRename: () => void
  onEditCourse: (c: CoursePublic) => void
  canEdit: boolean
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-zinc-300/85 bg-[#faf8f4]/70 p-4 shadow-[0_1px_0_rgba(0,0,0,0.03)] sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold uppercase tracking-wide text-zinc-800">
          {category.name}
        </h3>
        {showRename && (
          <button
            type="button"
            onClick={onRename}
            title="Редактировать название направления"
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-kozhura-orange"
            aria-label="Редактировать название направления"
          >
            <PencilIcon />
          </button>
        )}
      </div>
      <div
        className={
          view === 'grid'
            ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
            : 'flex flex-col gap-4'
        }
      >
        {courses.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            view={view}
            onEdit={() => onEditCourse(c)}
            canEdit={canEdit}
          />
        ))}
      </div>
    </div>
  )
}

function CourseCard({
  course,
  view,
  onEdit,
  canEdit,
}: {
  course: CoursePublic
  view: ViewMode
  onEdit: () => void
  canEdit: boolean
}) {
  const bullets = descriptionBullets(course.description)
  const thumb =
    course.company?.avatar?.path != null ? publicFileUrl(course.company.avatar.path) : null

  return (
    <article
      className={`flex overflow-hidden rounded-2xl border border-zinc-200/80 bg-[#faf6f0]/90 shadow-sm backdrop-blur-sm transition hover:border-zinc-300/90 ${
        view === 'list' ? 'flex-col sm:flex-row' : 'flex-col'
      }`}
    >
      <div
        className={`flex shrink-0 flex-col gap-3 p-4 sm:p-5 ${
          view === 'list' ? 'sm:w-[220px] sm:border-r sm:border-dashed sm:border-zinc-200/80' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-base font-semibold text-zinc-900">{course.title}</h4>
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="shrink-0 rounded-lg p-1 text-xs text-kozhura-orange hover:underline"
            >
              Изменить
            </button>
          )}
        </div>
        <div
          className={`relative overflow-hidden rounded-xl bg-zinc-200/60 ${
            view === 'grid' ? 'aspect-[16/10] w-full' : 'h-32 w-full sm:h-36'
          }`}
        >
          {thumb ? (
            <img src={thumb} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-light text-zinc-500">
              Нет изображения
            </div>
          )}
        </div>
      </div>
      <div className="min-w-0 flex-1 border-t border-dashed border-zinc-200/80 p-4 sm:border-t-0 sm:border-l sm:border-solid sm:pl-6 sm:pt-5">
        <p className="text-sm font-semibold text-zinc-800">О курсе</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm font-light leading-relaxed text-zinc-700">
          {bullets.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
        {course.rating != null && (
          <p className="mt-3 text-xs text-zinc-500">Рейтинг: {course.rating.toFixed(1)}</p>
        )}
      </div>
    </article>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14.5 14.5L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SortIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 7h6M5 12h10M5 17h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="14" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 6h14M5 12h14M5 18h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a2 2 0 000-2.8L17.3 4a2 2 0 00-2.8 0L4 14.5V20z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
