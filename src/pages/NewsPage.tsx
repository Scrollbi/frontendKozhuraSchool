import { useEffect, useMemo, useState } from 'react'
import NewsFiltersBar from '../components/news/NewsFiltersBar'
import NewsFeed from '../components/news/NewsFeed'
import { fetchNews, type NewsPublic } from '../services/api'

function parseDdMmYyyy(s: string): number | null {
  const m = s.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!m) return null
  const day = Number(m[1])
  const month = Number(m[2]) - 1
  const year = Number(m[3])
  const d = new Date(year, month, day)
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function endOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

function filterNews(items: NewsPublic[], q: string, fromStr: string, toStr: string): NewsPublic[] {
  const ql = q.trim().toLowerCase()
  const fromT = parseDdMmYyyy(fromStr)
  const toT = parseDdMmYyyy(toStr)

  return items.filter((n) => {
    if (ql) {
      const hay = `${n.title} ${n.content}`.toLowerCase()
      if (!hay.includes(ql)) return false
    }
    const created = new Date(n.created_at).getTime()
    if (fromT != null && created < fromT) return false
    if (toT != null && created > endOfDay(toT)) return false
    return true
  })
}

interface NewsPageProps {
  go: (route: string) => void
}

export default function NewsPage({ go }: NewsPageProps) {
  const [items, setItems] = useState<NewsPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchNews()
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось загрузить новости. Проверьте, что сервер запущен.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(
    () => filterNews(items, search, dateFrom, dateTo),
    [items, search, dateFrom, dateTo],
  )

  return (
    <div className="bg-transparent px-4 pb-12 pt-6 sm:px-8 lg:max-w-[1440px] lg:mx-auto lg:px-[114px] lg:pb-16 lg:pt-10">
      <h1 className="mb-8 text-center text-3xl font-semibold tracking-tight text-[#121212] sm:text-[30px] sm:leading-9">
        Новости
      </h1>

      <div className="glass-news-shell w-full">
        <NewsFiltersBar
          search={search}
          onSearchChange={setSearch}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
        />
        <NewsFeed items={filtered} loading={loading} error={error} onOpenNews={(id) => go(`news/${id}`)} />
      </div>
    </div>
  )
}
