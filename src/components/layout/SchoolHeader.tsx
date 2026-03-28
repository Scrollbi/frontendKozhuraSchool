import logo from '../icons/logo.png'
import type { UserMe } from '../../services/authService'

interface SchoolHeaderProps {
  go: (route: string) => void
  route: string
  currentUser: UserMe | null
}

const nav = [
  { label: 'Новости', href: 'news' },
  { label: 'Курсы', href: 'courses' },
  { label: 'Вакансии', href: 'jobs' },
  { label: 'Работодателям', href: 'employers' },
] as const

export default function SchoolHeader({ go, route, currentUser }: SchoolHeaderProps) {
  const openProfile = () => {
    if (currentUser) go('profile')
    else go('login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-[106px]">
        <button
          type="button"
          onClick={() => go('home')}
          className="shrink-0 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-kozhura-orange"
        >
          <img src={logo} alt="Kozhura School" className="h-9 w-auto object-contain sm:h-10" />
        </button>

        <nav className="flex min-w-0 flex-1 justify-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex flex-nowrap items-center justify-center gap-x-3 text-xs text-zinc-800 sm:gap-x-5 sm:text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <button
                  type="button"
                  onClick={() => go(item.href)}
                  className={`transition hover:text-kozhura-orange ${
                    route === item.href || (item.href === 'news' && route.startsWith('news/'))
                      ? 'font-semibold text-kozhura-orange'
                      : 'font-light'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-800 transition hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-kozhura-orange"
            aria-label="Уведомления"
            onClick={() => (currentUser ? go('notifications') : go('login'))}
          >
            <EnvelopeIcon />
          </button>
          <button
            type="button"
            onClick={openProfile}
            className="rounded-full border border-zinc-400 px-3.5 py-2 text-sm font-light text-zinc-900 transition hover:border-kozhura-orange hover:text-kozhura-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-kozhura-orange"
          >
            Профиль
          </button>
        </div>
      </div>
    </header>
  )
}

function EnvelopeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 6h16v12H4V6zm0 0l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
