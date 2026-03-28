import { useEffect, useState } from 'react'
import PartnerCoursesCarousel, {
  coursesToPartnerSlides,
  FALLBACK_PARTNER_SLIDES,
} from '../components/home/PartnerCoursesCarousel'
import { fetchCourses } from '../services/api'
import type { CoursePublic } from '../services/api'

const infoBlocks = [
  {
    n: '01',
    title: 'Теория',
    body: 'Современные технологии строительства, BIM-моделирование, автоматизация, VR/AR в проектировании.',
  },
  {
    n: '02',
    title: 'Практика',
    body: 'Реализация проектов с использованием передовых технологий и практические занятия на производстве.',
  },
  {
    n: '03',
    title: 'Стажировка',
    body: 'Работа с реальными проектами и компаниями, участие в стажировках на базе крупных строительных предприятий.',
  },
] as const

export default function HomePage() {
  const [slides, setSlides] = useState(() => FALLBACK_PARTNER_SLIDES)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const all = await fetchCourses()
        if (cancelled) return
        const partner = filterPartnerCourses(all)
        if (partner.length > 0) {
          setSlides(coursesToPartnerSlides(partner))
        } else {
          setSlides(FALLBACK_PARTNER_SLIDES)
        }
      } catch {
        if (!cancelled) setSlides(FALLBACK_PARTNER_SLIDES)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="bg-transparent text-black">
      <section className="relative overflow-x-hidden bg-transparent pb-2">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-0 top-0 h-[500px] w-[180%] -translate-x-[20%] -translate-y-[15%] origin-top-left -rotate-[12deg] bg-zinc-200/35" />
          <div className="absolute right-0 top-0 h-[350px] w-[140%] translate-x-[10%] -translate-y-[5%] origin-top-right rotate-[20deg] bg-orange-500/18" />
        </div>
        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-8 overflow-visible px-4 py-10 sm:px-8 lg:flex-row lg:items-start lg:gap-9 lg:px-[114px] lg:pb-20 lg:pt-14">
          <div
            className="glass-hero-surface animate-home-fade-up flex w-full max-w-[433px] flex-col items-stretch gap-4 self-center py-[15px] pl-2.5 pr-2.5 lg:self-start"
            style={{ animationDelay: '0ms' }}
          >
            <h1 className="text-center text-4xl font-normal leading-tight text-zinc-900 sm:text-[50px] sm:leading-[61px]">
              Kozhura <span className="text-kozhura-orange">School</span>
            </h1>
            <p className="text-center text-lg text-kozhura-text sm:text-xl">
              Строим будущее, где каждый кирпич — инновация!
            </p>
            <ul className="flex flex-col gap-2 py-1">
              {(['Теория', 'Практика', 'Стажировка'] as const).map((label) => (
                <li key={label} className="flex justify-center sm:justify-start sm:pl-2">
                  <div className="flex w-full max-w-[300px] items-center gap-3 px-4 py-3 text-left sm:max-w-none">
                    <CheckIcon className="shrink-0" />
                    <span className="text-xl font-semibold text-zinc-900 underline decoration-zinc-300 underline-offset-[6px]">
                      {label}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="glass-info-panel flex w-full max-w-[752px] flex-1 flex-col items-stretch gap-4 overflow-hidden py-[15px] pl-2.5 pr-2.5 animate-home-fade-up lg:min-h-[254px]"
            style={{ animationDelay: '120ms' }}
          >
            <div className="glass-info-strip flex min-h-[40px] w-full items-center justify-center gap-2.5 self-stretch px-4 py-[3px]">
              <p className="text-base font-semibold leading-[19px] text-kozhura-ink">Актуальная информация</p>
            </div>
            <div className="flex w-full flex-col gap-4 self-stretch py-2 lg:flex-row lg:justify-center lg:gap-5 lg:px-1">
              {infoBlocks.map((b) => (
                <div
                  key={b.n}
                  className="glass-info-cell relative flex w-full cursor-default flex-col items-center justify-start gap-3 px-4 py-5 text-center sm:px-5 sm:py-6 lg:w-[calc(33.333%-10px)] lg:flex-none lg:px-3 lg:py-4"
                >
                  <div className="flex items-center justify-center gap-2.5">
                    <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-md bg-kozhura-orange text-[11px] font-bold text-white shadow-sm">
                      {b.n}
                    </span>
                    <span className="text-center text-sm font-semibold leading-snug text-kozhura-ink">{b.title}</span>
                  </div>
                  <p className="w-full text-pretty text-center text-[13px] font-normal leading-relaxed text-kozhura-text sm:text-[15px]">
                    {b.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="partner-section-bg relative border-t border-zinc-200 py-12 sm:py-14">
        <h2 className="mb-10 text-center text-2xl font-semibold text-[#121212] sm:text-[30px] sm:leading-9">
          Курсы от партнёров
        </h2>
        <PartnerCoursesCarousel items={slides} />
      </section>
    </div>
  )
}

function filterPartnerCourses(courses: CoursePublic[]): CoursePublic[] {
  return courses.filter((c) => c.company != null)
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="9" stroke="#EA580C" strokeWidth="2" />
      <path d="M6 10l2.5 2.5L14 7" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
