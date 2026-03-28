import { useId } from 'react'

interface FloatingDateInputProps {
  prefix: 'с' | 'по'
  value: string
  onChange: (v: string) => void
  className?: string
}


export default function FloatingDateInput({ prefix, value, onChange, className = '' }: FloatingDateInputProps) {
  const id = useId()

  return (
    <label
      htmlFor={id}
      className={`group relative flex h-12 min-w-[8.5rem] flex-1 cursor-text items-stretch rounded-xl border border-zinc-200/85 bg-white/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-[border-color,box-shadow] duration-200 hover:border-kozhura-orange/30 hover:shadow-md focus-within:border-kozhura-orange/45 focus-within:shadow-[0_0_0_3px_rgba(234,88,12,0.1)] sm:h-11 sm:min-w-[9.25rem] ${className}`}
    >
      <span
        className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-[15px] font-medium text-kozhura-text/85 transition-all duration-300 ease-out group-hover:left-1/2 group-hover:top-0 group-hover:-translate-x-1/2 group-hover:-translate-y-1/2 group-hover:rounded-md group-hover:bg-white group-hover:px-2 group-hover:py-0.5 group-hover:text-xs group-hover:font-semibold group-hover:text-kozhura-orange group-hover:shadow-sm group-focus-within:left-1/2 group-focus-within:top-0 group-focus-within:-translate-x-1/2 group-focus-within:-translate-y-1/2 group-focus-within:rounded-md group-focus-within:bg-white group-focus-within:px-2 group-focus-within:py-0.5 group-focus-within:text-xs group-focus-within:font-semibold group-focus-within:text-kozhura-orange group-focus-within:shadow-sm"
        aria-hidden
      >
        {prefix}
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="дд.мм.гггг"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full rounded-[inherit] border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm tabular-nums text-zinc-900 outline-none ring-0 transition-all duration-300 placeholder:text-kozhura-text/42 group-hover:px-3 group-hover:pb-1.5 group-hover:pt-[1.2rem] group-hover:pl-3 group-focus-within:px-3 group-focus-within:pb-1.5 group-focus-within:pt-[1.2rem] group-focus-within:pl-3"
      />
    </label>
  )
}
