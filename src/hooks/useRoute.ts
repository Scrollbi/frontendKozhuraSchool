import { useCallback, useEffect, useState } from 'react'

export function useRoute() {
  const get = () => (location.hash.startsWith('#/') ? location.hash.slice(2) : 'home')
  const [route, setRoute] = useState(get())
  const go = useCallback((r: string) => {
    window.location.hash = `#/${r}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])
  useEffect(() => {
    const onHash = () => {
      const newRoute = get()
      const isRouteChange = location.hash.startsWith('#/')
      setRoute(newRoute)
      if (isRouteChange) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return [route, go] as const
}
