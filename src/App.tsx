import { useEffect, useState } from 'react'
import { useRoute } from './hooks/useRoute'
import SchoolHeader from './components/layout/SchoolHeader'
import SchoolFooter from './components/layout/SchoolFooter'
import CityscapeBackground from './components/building/City'
import FlyingAirplanes from './components/airplanes/Airplanes'
import HomePage from './pages/HomePage'
import NewsPage from './pages/NewsPage'
import NewsDetailPage from './pages/NewsDetailPage'
import PlaceholderPage from './pages/PlaceholderPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { authService, type UserMe } from './services/authService'

function titleForRoute(route: string): string {
  switch (route) {
    case 'news':
      return 'Новости'
    case 'courses':
      return 'Курсы'
    case 'jobs':
      return 'Вакансии'
    case 'employers':
      return 'Работодателям'
    case 'notifications':
      return 'Уведомления'
    default:
      return ''
  }
}

export default function App() {
  const [route, go] = useRoute()
  const [currentUser, setCurrentUser] = useState<UserMe | null>(() => authService.getCachedUser())

  useEffect(() => {
    const sync = () => setCurrentUser(authService.getCachedUser())
    window.addEventListener('authChange', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('authChange', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const renderMain = () => {
    if (route === 'home' || route === '') return <HomePage />
    if (route === 'login') return <LoginPage go={go} />
    if (route === 'profile') return <ProfilePage go={go} />
    const newsDetail = /^news\/(\d+)$/.exec(route)
    if (newsDetail) return <NewsDetailPage id={Number(newsDetail[1])} go={go} />
    if (route === 'news') return <NewsPage go={go} />
    if (route === 'courses' || route === 'jobs' || route === 'employers' || route === 'notifications') {
      return <PlaceholderPage title={titleForRoute(route)} />
    }
    return <HomePage />
  }

  return (
    <div className="relative min-h-screen bg-white text-zinc-900">
      <div className="relative z-10 flex min-h-screen flex-col">
        <SchoolHeader go={go} route={route} currentUser={currentUser} />
        <main className="relative z-10 flex-1">{renderMain()}</main>
        <SchoolFooter go={go} />
        <CityscapeBackground />
        <FlyingAirplanes />
      </div>
    </div>
  )
}
