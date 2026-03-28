export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-kozhura-ink">{title}</h1>
      <p className="mt-4 text-kozhura-text">Раздел в разработке.</p>
    </div>
  )
}
