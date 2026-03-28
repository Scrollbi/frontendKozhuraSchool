import type { NewsPublic } from '../../services/api'
import { publicFileUrl } from '../../services/api'

interface NewsFeedProps {
  items: NewsPublic[]
  loading: boolean
  error: string | null
  onOpenNews?: (id: number) => void
}

export function formatNewsDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

function thumbUrl(item: NewsPublic): string | null {
  const f = item.files?.[0]
  if (!f?.path) return null
  return publicFileUrl(f.path)
}

const cardClass =
  'flex flex-col gap-4 rounded-2xl border border-zinc-200/60 bg-white/70 px-4 py-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-200 sm:flex-row sm:items-start sm:gap-6 sm:px-5 sm:py-6'

const cardInteractiveClass =
  'w-full text-left hover:border-zinc-300/80 hover:bg-white/80 hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)] focus:outline-none focus-visible:ring-2 focus-visible:ring-kozhura-orange focus-visible:ring-offset-2'

export default function NewsFeed({ items, loading, error, onOpenNews }: NewsFeedProps) {
  if (loading) {
    return (
      <div className="px-6 py-16 text-center text-kozhura-text">
        <p className="text-sm font-light">Загрузка новостей…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 py-16 text-center text-red-600/90">
        <p className="text-sm leading-relaxed">{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-kozhura-text">
        <p className="text-sm font-light">Новостей не найдено.</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-5 p-4 sm:gap-6 sm:p-6">
      {items.map((item) => {
        const inner = (
          <>
            <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl border border-zinc-200/60 bg-gradient-to-br from-zinc-50 to-zinc-100/90 shadow-inner sm:h-24 sm:w-36">
              {thumbUrl(item) ? (
                <img src={thumbUrl(item)!} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-kozhura-text/35">
                  <svg width="40" height="32" viewBox="0 0 72 56" fill="none" aria-hidden>
                    <path
                      d="M8 44L24 28l10 10 18-18 12 12v16H8V44z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <circle cx="22" cy="18" r="5" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold leading-snug text-zinc-900">{item.title}</h2>
              <p className="mt-2 line-clamp-4 text-base font-light leading-relaxed text-kozhura-text sm:line-clamp-3">
                {item.content}
              </p>
            </div>
            <time
              className="shrink-0 whitespace-nowrap text-sm font-medium tabular-nums text-kozhura-text sm:pt-1 sm:text-right"
              dateTime={item.created_at}
            >
              {formatNewsDate(item.created_at)}
            </time>
          </>
        )

        return (
          <li key={item.id}>
            {onOpenNews ? (
              <button type="button" onClick={() => onOpenNews(item.id)} className={`${cardClass} ${cardInteractiveClass}`}>
                {inner}
              </button>
            ) : (
              <article className={`${cardClass} hover:border-zinc-300/80 hover:bg-white/80 hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)]`}>
                {inner}
              </article>
            )}
          </li>
        )
      })}
    </ul>
  )
}
