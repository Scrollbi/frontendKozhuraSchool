import { useEffect, useMemo, useState } from 'react'
import type { CoursePublic } from '../../services/api'
import { publicFileUrl } from '../../services/api'

export interface PartnerSlide {
  id: number
  title: string
  description: string
  imageUrl: string | null
}

const PAGE_SIZE = 2

export default function PartnerCoursesCarousel({ items }: { items: PartnerSlide[] }) {
  const pages = useMemo(() => {
    if (items.length === 0) return [[] as PartnerSlide[]]
    const chunks: PartnerSlide[][] = []
    for (let i = 0; i < items.length; i += PAGE_SIZE) {
      chunks.push(items.slice(i, i + PAGE_SIZE))
    }
    return chunks
  }, [items])

  const pageCount = pages.length
  const [page, setPage] = useState(0)
  const safePage = Math.min(page, pageCount - 1)
  const visible = pages[safePage] ?? []

  useEffect(() => {
    setPage(0)
  }, [items])

  const go = (dir: -1 | 1) => {
    setPage((p) => {
      const next = p + dir
      if (next < 0) return pageCount - 1
      if (next >= pageCount) return 0
      return next
    })
  }

  return (
    <div className="w-full font-sans font-light">
      <div className="mx-auto flex max-w-[1230px] flex-col items-stretch md:flex-row md:items-center md:justify-center md:gap-6 lg:gap-[73px]">
        <CarouselArrow dir="left" onClick={() => go(-1)} label="Предыдущие" className="hidden md:flex" />
        <div className="grid min-h-[360px] w-full max-w-[980px] grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {visible.map((card, idx) => (
            <PartnerCard key={`${card.id}-${safePage}-${idx}`} card={card} />
          ))}
          {visible.length === 1 && (
            <div className="hidden min-h-[200px] rounded-[20px] border border-dashed border-kozhura-text/25 md:block" aria-hidden />
          )}
        </div>
        <CarouselArrow dir="right" onClick={() => go(1)} label="Следующие" className="hidden md:flex" />
      </div>
      <div className="mx-auto mt-4 flex justify-center gap-8 md:hidden">
        <CarouselArrow dir="left" onClick={() => go(-1)} label="Предыдущие" className="flex" />
        <CarouselArrow dir="right" onClick={() => go(1)} label="Следующие" className="flex" />
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <span className="rounded-full bg-[rgba(217,217,217,0.85)] px-2.5 py-1 text-center text-xs font-light text-white shadow-sm">
          {safePage + 1} из {pageCount}
        </span>
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Страница ${i + 1}`}
              onClick={() => setPage(i)}
              className={`h-2 rounded-full transition-all duration-300 ease-out ${
                i === safePage ? 'w-8 bg-kozhura-orange shadow-sm' : 'w-2 bg-zinc-300 hover:bg-zinc-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function PartnerCard({ card }: { card: PartnerSlide }) {
  return (
    <article
      className="glass-card-slider animate-home-fade-in flex h-full min-h-[360px] flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-0.5"
      style={{ animationDelay: '80ms' }}
    >
      <div className="relative aspect-[450/260] w-full shrink-0 overflow-hidden bg-white/70">
        {card.imageUrl ? (
          <img src={card.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <PlaceholderGraphic />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center rounded-b-[20px] border-t border-zinc-200/50 bg-white/70 px-4 py-5 text-center backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-black">{card.title}</h3>
        <p className="mt-2 text-sm font-light leading-relaxed text-kozhura-text">{card.description}</p>
      </div>
    </article>
  )
}

function PlaceholderGraphic() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white/70 text-kozhura-text/45">
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

export function CarouselArrow({
  dir,
  onClick,
  label,
  className = '',
  disabled = false,
}: {
  dir: 'left' | 'right'
  onClick: () => void
  label: string
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-white text-kozhura-text shadow-sm transition hover:border-zinc-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-zinc-200/90 disabled:hover:shadow-sm ${className}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="text-kozhura-text">
        {dir === 'left' ? (
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  )
}

export function coursesToPartnerSlides(courses: CoursePublic[]): PartnerSlide[] {
  return courses.map((c) => {
    const title = companyHeading(c)
    const avatarPath = c.company?.avatar?.path
    const imageUrl = avatarPath ? publicFileUrl(avatarPath) : null
    return {
      id: c.id,
      title,
      description: c.description,
      imageUrl,
    }
  })
}

function companyHeading(c: CoursePublic): string {
  if (!c.company) return c.title
  const parts = [c.company.surname, c.company.name].filter((p) => p?.trim())
  const label = parts.join(' ').trim()
  return label || c.title
}

export const FALLBACK_PARTNER_SLIDES: PartnerSlide[] = [
  {
    id: -1,
    title: 'AGC',
    description:
      'Мировой лидер в производстве стекла для архитектурно-строительного и автомобильного применения. AGC Glass Russia входит в состав компании AGC Glass Europe – европейского подразделения AGC Inc.',
    imageUrl: null,
  },
  {
    id: -2,
    title: 'Schüco',
    description:
      'Ведущий поставщик высококачественных оконных, дверных и фасадных систем из алюминия и стали. Индивидуальный дизайн, максимальная энергоэффективность и экономически целесообразное строительство.',
    imageUrl: null,
  },
  {
    id: -3,
    title: 'ООО «Сибирские Фасады»',
    description:
      'Производственно-строительная компания, реализующая жилые, административные и инфраструктурные проекты. Основная сфера деятельности – оболочки зданий (светопрозрачные конструкции, навесные фасады).',
    imageUrl: null,
  },
  {
    id: -4,
    title: 'UTECH',
    description:
      'Российский поставщик комплексных инженерных продуктов для строительных и промышленных проектов. Официальный правопреемник компании Hilti Group в России.',
    imageUrl: null,
  },
]
