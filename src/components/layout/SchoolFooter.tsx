import logo from '../icons/logo.png'

export default function SchoolFooter({ go }: { go: (route: string) => void }) {
  return (
    <footer className="relative z-20 border-t border-black/50 bg-white/90">
      <div className="mx-auto flex min-h-[60px] max-w-[1440px] flex-col flex-wrap items-center justify-center gap-4 px-3 py-2.5 text-center sm:flex-row sm:justify-center sm:gap-8 sm:text-left lg:gap-[77px]">
        <button
          type="button"
          onClick={() => go('home')}
          className="shrink-0 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-kozhura-orange"
        >
          <img src={logo} alt="Kozhura School" className="h-9 w-auto object-contain sm:h-10" />
        </button>
        <p className="max-w-[272px] text-sm font-light text-black">Архитектурно-строительная компания</p>
        <p className="max-w-[470px] text-sm font-light leading-snug text-black">
          Местонахождение: 630132, г. Новосибирск, ул. 1905 года, 69, офис 6; ИНН 5407982582
        </p>
        <div className="max-w-[272px] text-sm font-light leading-snug text-black">
          <p>Контакты: +7 (383) 204-99-14</p>
          <a href="mailto:info@kozhura.team" className="text-black underline-offset-2 hover:text-kozhura-orange hover:underline">
            info@kozhura.team
          </a>
        </div>
      </div>
    </footer>
  )
}
