import { useEffect, useState } from 'react'

function FlyingAirplanes() {
    const [airplanes, setAirplanes] = useState<Array<{ id: number; top: number; direction: 'left' | 'right'; delay: number; duration: number }>>([])
  
    useEffect(() => {
      // Создаем первый самолет сразу
      const createAirplane = () => {
        const id = Date.now() + Math.random()
        const top = Math.random() * 40 + 10 // От 10% до 50% от верха
        const direction = Math.random() > 0.5 ? 'right' : 'left'
        const delay = Math.random() * 2 // Задержка до 2 секунд
        const duration = 15 + Math.random() * 10 // Длительность от 15 до 25 секунд
  
        setAirplanes((prev) => [...prev, { id, top, direction, delay, duration }])
  
        // Удаляем самолет после завершения анимации
        setTimeout(() => {
          setAirplanes((prev) => prev.filter((a) => a.id !== id))
        }, (delay + duration) * 1000)
      }
  
      // Создаем первый самолет
      createAirplane()
  
      // Создаем новые самолеты каждые 8-15 секунд
      const interval = setInterval(() => {
        createAirplane()
      }, 9000 + Math.random() * 9000)
  
      return () => clearInterval(interval)
    }, [])
  
    return (
      <div 
        className="fixed top-0 left-0 right-0 z-[-1] overflow-hidden pointer-events-none" 
        style={{ height: '50vh' }}
      >
        <style>{`
          @keyframes flyLeft {
            from {
              left: 100%;
              opacity: 0;
            }
            5% {
              opacity: 1;
            }
            95% {
              opacity: 1;
            }
            to {
              left: -10%;
              opacity: 0;
            }
          }
          @keyframes flyRight {
            from {
              right: 100%;
              opacity: 0;
            }
            5% {
              opacity: 1;
            }
            95% {
              opacity: 1;
            }
            to {
              right: -10%;
              opacity: 0;
            }
          }
          .airplane {
            position: absolute;
            width: 40px;
            height: 40px;
            opacity: 0;
            z-index: -3;
          }
          .airplane-left {
            animation: flyLeft linear forwards;
            transform: scaleX(-1);
          }
          .airplane-right {
            animation: flyRight linear forwards;
          }
        `}</style>
        {airplanes.map((airplane) => (
          <div
            key={airplane.id}
            className={`airplane airplane-${airplane.direction}`}
            style={{
              top: `${airplane.top}%`,
              animationDuration: `${airplane.duration}s`,
              animationDelay: `${airplane.delay}s`,
            }}
          >
            <svg
              fill="#ffcf99"
              width="100%"
              height="100%"
              viewBox="0 0 56 56"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            >
              <path d="M 54.4141 28 C 54.3906 25.2578 50.6639 23.2656 46.1874 23.2656 L 36.7421 23.2656 C 35.4296 23.2656 34.9374 23.0547 34.1640 22.1641 L 18.4140 4.9844 C 17.9218 4.4219 17.3124 4.1406 16.6093 4.1406 L 13.8905 4.1406 C 13.2812 4.1406 12.9296 4.6797 13.2343 5.3359 L 21.3437 23.2656 L 9.4374 24.6250 L 5.1952 16.8437 C 4.8905 16.2578 4.3749 16 3.6015 16 L 2.5937 16 C 1.9843 16 1.5859 16.3984 1.5859 17.0078 L 1.5859 38.9922 C 1.5859 39.6016 1.9843 39.9766 2.5937 39.9766 L 3.6015 39.9766 C 4.3749 39.9766 4.8905 39.7188 5.1952 39.1563 L 9.4374 31.3750 L 21.3437 32.7344 L 13.2343 50.6641 C 12.9296 51.2968 13.2812 51.8594 13.8905 51.8594 L 16.6093 51.8594 C 17.3124 51.8594 17.9218 51.5547 18.4140 51.0156 L 34.1640 33.8125 C 34.9374 32.9453 35.4296 32.7344 36.7421 32.7344 L 46.1874 32.7344 C 50.6639 32.7344 54.3906 30.7188 54.4141 28 Z" />
            </svg>
          </div>
        ))}
      </div>
    )
}

export default FlyingAirplanes;