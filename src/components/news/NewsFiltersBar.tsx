import { useId } from 'react'

interface NewsFiltersBarProps {
  search: string
  onSearchChange: (v: string) => void
  dateFrom: string
  onDateFromChange: (v: string) => void
  dateTo: string
  onDateToChange: (v: string) => void
}

export default function NewsFiltersBar({
  search,
  onSearchChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: NewsFiltersBarProps) {
  const searchId = useId()

  return (
    <div className="border-b border-zinc-200/45 bg-gradient-to-b from-white/55 via-white/40 to-orange-50/20 px-4 py-5 sm:px-6 sm:py-6">
      <div
        className="mx-auto flex w-full max-w-none flex-col gap-4 rounded-2xl bg-white/70 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-zinc-200/55 backdrop-blur-md sm:flex-row sm:items-center sm:gap-4 sm:p-3"
        role="search"
      >
        <div className="relative min-h-[3rem] min-w-0 flex-1">
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            aria-hidden
          >
            <SearchIcon />
          </span>
          <input
            id={searchId}
            type="search"
            placeholder="Поиск по заголовку и тексту…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-12 w-full rounded-xl border border-zinc-200/70 bg-white/90 py-2 pl-11 pr-4 text-sm text-zinc-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-all duration-200 placeholder:text-kozhura-text/50 focus:border-kozhura-orange/50 focus:bg-white focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.06),0_0_0_4px_rgba(234,88,12,0.08)] sm:h-11"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-zinc-50/60 via-zinc-50/40 to-transparent px-3 py-2.5 ring-1 ring-inset ring-zinc-200/40">
            <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-md opacity-60 transition-all duration-200 hover:opacity-100">
              <input
                type="date"
                value={dateFrom ? (dateFrom.includes('.') ? dateFrom.split('.').reverse().join('-') : dateFrom) : ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (val) {
                    const [y, m, d] = val.split('-')
                    onDateFromChange(`${d}.${m}.${y}`)
                  } else {
                    onDateFromChange('')
                  }
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Выбрать дату с"
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-zinc-600">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" className="transition-colors duration-200 hover:stroke-[#EA580C]" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="transition-colors duration-200 hover:stroke-[#EA580C]" />
              </svg>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="дд.мм.гггг"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-28 border-0 border-b border-transparent bg-transparent py-1.5 text-sm font-medium text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-kozhura-orange/40 focus:bg-white/50"
            />
            <span className="mx-1 text-zinc-300">—</span>
            <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-md opacity-60 transition-all duration-200 hover:opacity-100">
              <input
                type="date"
                value={dateTo ? (dateTo.includes('.') ? dateTo.split('.').reverse().join('-') : dateTo) : ''}
                onChange={(e) => {
                  const val = e.target.value
                  if (val) {
                    const [y, m, d] = val.split('-')
                    onDateToChange(`${d}.${m}.${y}`)
                  } else {
                    onDateToChange('')
                  }
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Выбрать дату по"
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-zinc-600">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" className="transition-colors duration-200 hover:stroke-[#EA580C]" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="transition-colors duration-200 hover:stroke-[#EA580C]" />
              </svg>
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="дд.мм.гггг"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-28 border-0 border-b border-transparent bg-transparent py-1.5 text-sm font-medium text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-kozhura-orange/40 focus:bg-white/50"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}
