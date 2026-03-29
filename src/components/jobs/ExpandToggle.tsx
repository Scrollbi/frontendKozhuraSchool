/** Кнопка сворачивания/разворачивания в стиле макета: иконка списка + стрелка. */
export default function ExpandToggle({
  expanded,
  onToggle,
  label,
}: {
  expanded: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={label}
      className="mt-0.5 flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-zinc-200/85 bg-white/90 text-zinc-600 shadow-sm transition hover:border-kozhura-orange/50 hover:text-kozhura-orange focus:outline-none focus-visible:ring-2 focus-visible:ring-kozhura-orange"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="text-current">
        <path d="M4 7h16M4 12h12M4 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d={expanded ? 'M18 15l-3-3 3-3' : 'M15 9l3 3-3 3'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
