import { useEffect, useMemo, useState } from 'react'
import { CarouselArrow } from '../home/PartnerCoursesCarousel'
import { publicFileUrl } from '../../services/api'

interface ImageSlide {
  key: string
  imageUrl: string | null
}

/**
 * Одна фотография на экран, оформление как у карусели на главной:
 * стрелки по бокам (desktop), снизу подпись «Изображение N из M», бейдж и точки.
 */
export default function NewsFilesGallery({ paths }: { paths: string[] }) {
  const slides: ImageSlide[] = useMemo(
    () =>
      paths.length > 0
        ? paths.map((path, i) => ({ key: `${path}-${i}`, imageUrl: publicFileUrl(path) }))
        : [{ key: 'empty', imageUrl: null }],
    [paths],
  )

  const pageCount = slides.length
  const [page, setPage] = useState(0)
  const safePage = Math.min(page, pageCount - 1)
  const current = slides[safePage]!

  const pathsKey = paths.join('\0')

  useEffect(() => {
    setPage(0)
  }, [pathsKey])

  const go = (dir: -1 | 1) => {
    if (pageCount <= 1) return
    setPage((p) => {
      const next = p + dir
      if (next < 0) return pageCount - 1
      if (next >= pageCount) return 0
      return next
    })
  }

  const caption =
    paths.length === 0 ? 'Нет прикреплённых изображений' : `Изображение ${safePage + 1} из ${pageCount}`

  return (
    <div className="w-full font-sans font-light">
      <div className="flex flex-col items-center gap-4">
        {/* Image with arrows */}
        <div className="relative flex w-full items-center justify-center gap-2 sm:gap-3">
          <CarouselArrow
            dir="left"
            onClick={() => go(-1)}
            label="Предыдущее фото"
            disabled={pageCount <= 1}
            className="shrink-0"
          />
          <article
            className="glass-card-slider animate-home-fade-in flex w-full max-w-[350px] flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-0.5 sm:max-w-[400px]"
            style={{ animationDelay: '80ms' }}
          >
            <div className="relative aspect-[4/3] w-full min-h-[200px] overflow-hidden bg-white/70 sm:min-h-[240px]">
              {current.imageUrl ? (
                <img
                  src={current.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <PlaceholderGraphic />
              )}
            </div>
          </article>
          <CarouselArrow
            dir="right"
            onClick={() => go(1)}
            label="Следующее фото"
            disabled={pageCount <= 1}
            className="shrink-0"
          />
        </div>

        {/* Caption and counter below image */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-center text-sm font-light leading-relaxed text-kozhura-text">{caption}</p>
          {pageCount > 1 && (
            <>
              <span className="rounded-full bg-[rgba(217,217,217,0.85)] px-2.5 py-1 text-center text-xs font-light text-white shadow-sm">
                {safePage + 1} из {pageCount}
              </span>
              <div className="flex items-center justify-center gap-2">
                {Array.from({ length: pageCount }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Изображение ${i + 1}`}
                    onClick={() => setPage(i)}
                    className={`h-2 rounded-full transition-all duration-300 ease-out ${
                      i === safePage ? 'w-8 bg-kozhura-orange shadow-sm' : 'w-2 bg-zinc-300 hover:bg-zinc-400'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PlaceholderGraphic() {
  return (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-white/70 text-kozhura-text/45">
      <svg width="72" height="56" viewBox="0 0 72 56" fill="none" aria-hidden>
        <path
          d="M8 44L24 28l10 10 18-18 12 12v16H8V44z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="22" cy="18" r="5" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  )
}
