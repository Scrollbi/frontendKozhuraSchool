import { useEffect, useMemo, useState } from 'react'
import NewsFilesGallery from '../components/news/NewsFilesGallery'
import { CarouselArrow } from '../components/home/PartnerCoursesCarousel'
import { fetchNews, fetchNewsById, type NewsPublic } from '../services/api'
import { formatNewsDate } from '../components/news/NewsFeed'

interface NewsDetailPageProps {
  id: number
  go: (route: string) => void
}

function sortNewsByDateDesc(list: NewsPublic[]): NewsPublic[] {
  return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export default function NewsDetailPage({ id, go }: NewsDetailPageProps) {
  const [news, setNews] = useState<NewsPublic | null>(null)
  const [newsIndex, setNewsIndex] = useState<NewsPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      const listResult = await fetchNews().catch(() => null)
      if (!cancelled && Array.isArray(listResult)) {
        setNewsIndex(sortNewsByDateDesc(listResult))
      }

      try {
        const d = await fetchNewsById(id)
        if (!cancelled) setNews(d)
      } catch {
        const sorted = Array.isArray(listResult) ? sortNewsByDateDesc(listResult) : []
        const found = sorted.find((x) => x.id === id)
        if (!cancelled) {
          if (found) setNews(found)
          else setError('Новость не найдена.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (news?.title) document.title = `${news.title} — Kozhura School`
    return () => {
      document.title = 'Kozhura School'
    }
  }, [news?.title])

  const { prevId, nextId } = useMemo(() => {
    const idx = newsIndex.findIndex((n) => n.id === id)
    if (idx < 0) return { prevId: null as number | null, nextId: null as number | null }
    // Список от новых к старым: влево — более новая, вправо — более старая
    const newer = idx > 0 ? newsIndex[idx - 1]?.id : null
    const older = idx < newsIndex.length - 1 ? newsIndex[idx + 1]?.id : null
    return { prevId: newer ?? null, nextId: older ?? null }
  }, [newsIndex, id])

  const imagePaths = useMemo(() => (news?.files ?? []).map((f) => f.path).filter(Boolean), [news])

  const paragraphs = useMemo(() => {
    if (!news?.content) return []
    return news.content
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
  }, [news?.content])

  if (loading) {
    return (
      <div className="mx-auto max-w-[1440px] bg-transparent px-4 pb-16 pt-8 text-center text-kozhura-text sm:px-8 lg:px-[106px] lg:pt-10">
        <p className="text-sm font-light">Загрузка…</p>
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="mx-auto max-w-[1440px] bg-transparent px-4 pb-16 pt-8 sm:px-8 lg:px-[106px] lg:pt-10">
        <p className="text-center text-red-600/90">{error ?? 'Новость не найдена.'}</p>
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => go('news')}
            className="rounded-full border border-zinc-300 bg-white/90 px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:border-kozhura-orange hover:text-kozhura-orange"
          >
            Все новости
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] bg-transparent px-4 pb-16 pt-6 sm:px-8 lg:px-[106px] lg:pb-20 lg:pt-10">
      <h1 className="w-full text-center text-3xl font-semibold tracking-tight text-[#121212] sm:text-[30px] sm:leading-9">
        {news.title}
      </h1>

      <div className="mt-6 flex w-full items-center justify-between gap-3 sm:gap-4">
        <CarouselArrow
          dir="left"
          disabled={prevId == null}
          onClick={() => prevId != null && go(`news/${prevId}`)}
          label="Предыдущая новость"
          className="shrink-0"
        />
        <button
          type="button"
          onClick={() => go('news')}
          className="shrink rounded-full border border-zinc-300/90 bg-white/80 px-5 py-2 text-sm font-medium text-zinc-800 shadow-sm backdrop-blur-sm transition hover:border-zinc-400 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-kozhura-orange"
        >
          Все новости
        </button>
        <CarouselArrow
          dir="right"
          disabled={nextId == null}
          onClick={() => nextId != null && go(`news/${nextId}`)}
          label="Следующая новость"
          className="shrink-0"
        />
      </div>

      <div className="mt-10 w-full lg:mt-12">
        <div className="glass-news-shell w-full overflow-hidden">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:gap-8 sm:p-8 lg:gap-10 lg:p-10">
            {/* Left column - Image */}
            <div className="w-full sm:max-w-[400px] lg:max-w-[450px]">
              <NewsFilesGallery paths={imagePaths} />
            </div>
            
            {/* Right column - Content */}
            <div className="flex-1 border-t border-zinc-200/60 pt-6 sm:border-t-0 sm:pt-0">
              <time
                className="text-sm font-medium tabular-nums text-kozhura-text"
                dateTime={news.created_at}
              >
                {formatNewsDate(news.created_at)}
              </time>
              <h2 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-zinc-900">{news.title}</h2>
              <div className="mt-5 space-y-4 text-base font-light leading-relaxed text-kozhura-text">
                {paragraphs.length > 0 ? paragraphs.map((p, i) => <p key={i}>{p}</p>) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
