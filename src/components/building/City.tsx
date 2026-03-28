import type { CSSProperties } from 'react'

// Фоновый компонент с анимированными зданиями
function CityscapeBackground() {
    const buildings = [
      // Задний план (меньше, дальше)
      { width: '3%', height: '35%', left: '2%', delay: 0.1, color: '#f5f3f0', zIndex: 1, scale: 0.85, opacity: 1, isGray: true, pattern: 'diamond' },
      { width: '4%', height: '42%', left: '6%', delay: 0.15, color: '#fcf7f2', zIndex: 1, scale: 0.85, opacity: 1, pattern: 'circle' },
      { width: '3.5%', height: '38%', left: '11%', delay: 0.2, color: '#faf4ef', zIndex: 1, scale: 0.85, opacity: 1, shape: 'trapezoid-right' },
      
      // // Средний план
      { width: '4.5%', height: '55%', left: '18%', delay: 0, color: '#f5f3f0', zIndex: 2, scale: 1, opacity: 1, isGray: true, pattern: 'octagon', shape: 'protrusion-left' },
      { width: '5%', height: '68%', left: '24%', delay: 0.2, color: '#ebe8e2', zIndex: 2, scale: 1, opacity: 1, isGray: true, shape: 'trapezoid-left' },
      { width: '3.5%', height: '48%', left: '31%', delay: 0.3, color: '#fcf7f2', zIndex: 2, scale: 1, opacity: 1, pattern: 'square' },
      { width: '4%', height: '62%', left: '36%', delay: 0.1, color: '#faf4ef', zIndex: 2, scale: 1, opacity: 1, pattern: 'hexagon', shape: 'stepped' },
      
      // // Передний план (больше, ближе)
      { width: '6%', height: '82%', left: '43%', delay: 0.25, color: '#f0ede8', zIndex: 3, scale: 1.1, opacity: 1, isGray: true, shape: 'protrusion-right' },
      { width: '4.5%', height: '58%', left: '51%', delay: 0.35, color: '#ebe8e2', zIndex: 3, scale: 1.1, opacity: 1, isGray: true, pattern: 'diamond', shape: 'trapezoid-right' },
      { width: '5.5%', height: '75%', left: '57%', delay: 0.15, color: '#fcf7f2', zIndex: 3, scale: 1.1, opacity: 1, pattern: 'circle'},
      
      // // Средний план (продолжение)
      { width: '4%', height: '52%', left: '65%', delay: 0.4, color: '#f5f3f0', zIndex: 2, scale: 1, opacity: 1, isGray: true, pattern: 'octagon', shape: 'tower' },
      // { width: '3.5%', height: '45%', left: '71%', delay: 0.5, color: '#faf4ef', zIndex: 2, scale: 1, opacity: 1 },
      { width: '5%', height: '70%', left: '76%', delay: 0.3, color: '#f0ede8', zIndex: 2, scale: 1, opacity: 1, isGray: true, shape: 'stepped' },
      
      // // Передний план (правая часть)
      { width: '6.5%', height: '88%', left: '83%', delay: 0.2, color: '#fcf7f2', zIndex: 3, scale: 1.1, opacity: 1, pattern: 'square', shape: 'protrusion-left' },
      { width: '4%', height: '60%', left: '91%', delay: 0.45, color: '#ebe8e2', zIndex: 3, scale: 1.1, opacity: 1, pattern: 'circle' },
      
      // // Задний план (правая часть)
      { width: '3%', height: '40%', left: '96%', delay: 0.3, color: '#faf4ef', zIndex: 1, scale: 0.85, opacity: 1, pattern: 'diamond' },
      
      // // Пары зданий на передний план: низкое перед высоким
      // // Пара 1 (левая часть): высокое сзади, низкое спереди
      { width: '5.5%', height: '78%', left: '8%', delay: 0.4, color: '#f0ede8', zIndex: 3, scale: 1.15, opacity: 1, isGray: true, shape: 'trapezoid-right' },
      { width: '4%', height: '45%', left: '12%', delay: 0.6, color: '#fcf7f2', zIndex: 4, scale: 1.2, opacity: 1, pattern: 'circle', shape: 'protrusion-right' },
      
      // // Пара 2 (центр): высокое сзади, низкое спереди
      { width: '6%', height: '82%', left: '38%', delay: 0.5, color: '#ebe8e2', zIndex: 3, scale: 1.15, opacity: 1, isGray: true, pattern: 'octagon', shape: 'stepped' },
      // { width: '4.5%', height: '50%', left: '40%', delay: 0.7, color: '#faf4ef', zIndex: 4, scale: 1.2, opacity: 1 },
      
      // // Пара 3 (правая часть): высокое сзади, низкое спереди
      { width: '5.5%', height: '82%', left: '68%', delay: 0.45, color: '#fcf7f2', zIndex: 3, scale: 1.15, opacity: 1, pattern: 'square', shape: 'tower' },
      { width: '3.5%', height: '40%', left: '71%', delay: 0.65, color: '#f5f3f0', zIndex: 4, scale: 1.2, opacity: 1, isGray: true, pattern: 'hexagon', shape: 'protrusion-center' },
      
      // // Пара 4 (дальше справа): высокое сзади, низкое спереди
      { width: '6%', height: '80%', left: '86%', delay: 0.5, color: '#f0ede8', zIndex: 3, scale: 1.15, opacity: 1, isGray: true, pattern: 'diamond', shape: 'trapezoid-left' },
      // { width: '4%', height: '48%', left: '88%', delay: 0.7, color: '#faf4ef', zIndex: 4, scale: 1.2, opacity: 1 },
    ]
  
    return (
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden visible opacity-75">
        <style>{`
          @keyframes buildUp {
            from {
                visibility: visible;
                opacity: 0;
                transform: scaleY(0) scale(var(--building-scale, 1));
                transform-origin: bottom;
              }
              to {
                visibility: visible;
                opacity: 1;
                transform: scaleY(1) scale(var(--building-scale, 1));
                transform-origin: bottom;
              }
            }
          }
          @keyframes subtleGlow {
            0%, 100% {
              box-shadow: 0 0 0 rgba(255, 136, 0, 0);
            }
            50% {
              box-shadow: 0 0 6px rgba(255, 136, 0, 0.15);
            }
          }
          @keyframes shadowFadeIn {
            from {
              box-shadow: 0 0 0 rgba(0, 0, 0, 0);
            }
            to {
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
            }
          }
          .building {
            opacity: 0;
            animation: buildUp 5s ease-out forwards, shadowFadeIn 5s ease-out forwards;
            position: absolute;
            bottom: 0;
            transform-origin: bottom;
            overflow: hidden;
          }
          .building::before {
            content: '';
            position: absolute;
            inset: 0;
            background: 
              repeating-linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.04) 0px,
                rgba(0, 0, 0, 0.06) 2px,
                transparent 2px,
                transparent 20px
              ),
              repeating-linear-gradient(
                to right,
                rgba(0, 0, 0, 0.03) 0px,
                rgba(0, 0, 0, 0.03) 1px,
                transparent 1px,
                transparent 33%
              ),
              repeating-linear-gradient(
                to right,
                rgba(0, 0, 0, 0.03) 0px,
                rgba(0, 0, 0, 0.03) 1px,
                transparent 1px,
                transparent 67%
              ),
              linear-gradient(to top,
                rgba(0, 0, 0, 0.02) 0%,
                transparent 40%,
                transparent 60%,
                rgba(0, 0, 0, 0.01) 100%
              );
            pointer-events: none;
          }
          .building[data-gray="true"]::before {
            background: 
              repeating-linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.04) 0px,
                rgba(0, 0, 0, 0.06) 2px,
                transparent 2px,
                transparent 20px
              ),
              repeating-linear-gradient(
                to right,
                rgba(0, 0, 0, 0.03) 0px,
                rgba(0, 0, 0, 0.03) 1px,
                transparent 1px,
                transparent 33%
              ),
              repeating-linear-gradient(
                to right,
                rgba(0, 0, 0, 0.03) 0px,
                rgba(0, 0, 0, 0.03) 1px,
                transparent 1px,
                transparent 67%
              ),
              linear-gradient(to top,
                rgba(0, 0, 0, 0.02) 0%,
                transparent 40%,
                transparent 60%,
                rgba(0, 0, 0, 0.01) 100%
              );
          }
          .building[data-foreground="true"] {
            animation: buildUp 5.5s ease-out forwards, shadowFadeIn 5s ease-out forwards, subtleGlow 4s ease-in-out 4.5s;
            box-shadow: 
              inset -1px 0 0 rgba(255, 136, 0, 0.25),
              inset 1px 0 0 rgba(0, 0, 0, 0.1),
              0 -20px 0 -17px rgba(0, 0, 0, 0.06),
              0 -40px 0 -37px rgba(0, 0, 0, 0.04),
              0 -60px 0 -57px rgba(0, 0, 0, 0.03),
              0 -80px 0 -77px rgba(0, 0, 0, 0.02);
          }
          
          /* Геометрические паттерны */
          .building[data-pattern="diamond"]::before {
            background: 
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 24px,
                rgba(0, 0, 0, 0.03) 24px,
                rgba(0, 0, 0, 0.03) 27px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 24px,
                rgba(0, 0, 0, 0.03) 24px,
                rgba(0, 0, 0, 0.03) 27px
              ),
              repeating-linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.04) 0px,
                rgba(0, 0, 0, 0.06) 2px,
                transparent 2px,
                transparent 20px
              );
          }
          
          .building[data-pattern="circle"]::before {
            background: 
              radial-gradient(
                circle at 50% 50%,
                transparent 8px,
                rgba(0, 0, 0, 0.04) 8px,
                rgba(0, 0, 0, 0.04) 10px,
                transparent 10px
              ),
              radial-gradient(
                circle at 50% 50%,
                transparent 8px,
                rgba(0, 0, 0, 0.04) 8px,
                rgba(0, 0, 0, 0.04) 10px,
                transparent 10px
              );
            background-size: 24px 24px;
            background-position: 0 0, 12px 12px;
          }
          
          .building[data-pattern="square"]::before {
            background: 
              repeating-linear-gradient(
                to right,
                rgba(0, 0, 0, 0.03) 0px,
                rgba(0, 0, 0, 0.03) 1.5px,
                transparent 1.5px,
                transparent 36px
              ),
              repeating-linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.03) 0px,
                rgba(0, 0, 0, 0.03) 1.5px,
                transparent 1.5px,
                transparent 36px
              ),
              repeating-linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.04) 0px,
                rgba(0, 0, 0, 0.06) 2px,
                transparent 2px,
                transparent 20px
              );
          }
          
          .building[data-pattern="octagon"]::before {
            background: 
              repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 18px,
                rgba(0, 0, 0, 0.03) 18px,
                rgba(0, 0, 0, 0.03) 21px,
                transparent 21px,
                transparent 39px
              ),
              repeating-linear-gradient(
                45deg,
                transparent 0px,
                transparent 18px,
                rgba(0, 0, 0, 0.025) 18px,
                rgba(0, 0, 0, 0.025) 21px,
                transparent 21px,
                transparent 39px
              ),
              repeating-linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.04) 0px,
                rgba(0, 0, 0, 0.06) 2px,
                transparent 2px,
                transparent 20px
              );
          }
          
          .building[data-pattern="hexagon"]::before {
            background: 
              repeating-linear-gradient(
                60deg,
                transparent 0px,
                transparent 24px,
                rgba(0, 0, 0, 0.03) 24px,
                rgba(0, 0, 0, 0.03) 27px,
                transparent 27px,
                transparent 51px
              ),
              repeating-linear-gradient(
                -60deg,
                transparent 0px,
                transparent 24px,
                rgba(0, 0, 0, 0.03) 24px,
                rgba(0, 0, 0, 0.03) 27px,
                transparent 27px,
                transparent 51px
              ),
              repeating-linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.04) 0px,
                rgba(0, 0, 0, 0.06) 2px,
                transparent 2px,
                transparent 20px
              );
          }
          
          /* Стили для серых зданий с паттернами */
          .building[data-gray="true"][data-pattern="diamond"]::before {
            background: 
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 24px,
                rgba(0, 0, 0, 0.04) 24px,
                rgba(0, 0, 0, 0.04) 27px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 24px,
                rgba(0, 0, 0, 0.04) 24px,
                rgba(0, 0, 0, 0.04) 27px
              ),
              repeating-linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.05) 0px,
                rgba(0, 0, 0, 0.07) 2px,
                transparent 2px,
                transparent 20px
              );
          }
          
          .building[data-gray="true"][data-pattern="circle"]::before {
            background: 
              radial-gradient(
                circle at 50% 50%,
                transparent 8px,
                rgba(0, 0, 0, 0.05) 8px,
                rgba(0, 0, 0, 0.05) 10px,
                transparent 10px
              ),
              radial-gradient(
                circle at 50% 50%,
                transparent 8px,
                rgba(0, 0, 0, 0.05) 8px,
                rgba(0, 0, 0, 0.05) 10px,
                transparent 10px
              );
            background-size: 24px 24px;
            background-position: 0 0, 12px 12px;
          }
          
          .building[data-gray="true"][data-pattern="square"]::before {
            background: 
              repeating-linear-gradient(
                to right,
                rgba(0, 0, 0, 0.04) 0px,
                rgba(0, 0, 0, 0.04) 1.5px,
                transparent 1.5px,
                transparent 36px
              ),
              repeating-linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.04) 0px,
                rgba(0, 0, 0, 0.04) 1.5px,
                transparent 1.5px,
                transparent 36px
              ),
              repeating-linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.05) 0px,
                rgba(0, 0, 0, 0.07) 2px,
                transparent 2px,
                transparent 20px
              );
          }
          
          .building[data-gray="true"][data-pattern="octagon"]::before {
            background: 
              repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 18px,
                rgba(0, 0, 0, 0.04) 18px,
                rgba(0, 0, 0, 0.04) 21px,
                transparent 21px,
                transparent 39px
              ),
              repeating-linear-gradient(
                45deg,
                transparent 0px,
                transparent 18px,
                rgba(0, 0, 0, 0.035) 18px,
                rgba(0, 0, 0, 0.035) 21px,
                transparent 21px,
                transparent 39px
              ),
              repeating-linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.05) 0px,
                rgba(0, 0, 0, 0.07) 2px,
                transparent 2px,
                transparent 20px
              );
          }
          
          .building[data-gray="true"][data-pattern="hexagon"]::before {
            background: 
              repeating-linear-gradient(
                60deg,
                transparent 0px,
                transparent 24px,
                rgba(0, 0, 0, 0.04) 24px,
                rgba(0, 0, 0, 0.04) 27px,
                transparent 27px,
                transparent 51px
              ),
              repeating-linear-gradient(
                -60deg,
                transparent 0px,
                transparent 24px,
                rgba(0, 0, 0, 0.04) 24px,
                rgba(0, 0, 0, 0.04) 27px,
                transparent 27px,
                transparent 51px
              ),
              repeating-linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.05) 0px,
                rgba(0, 0, 0, 0.07) 2px,
                transparent 2px,
                transparent 20px
              );
          }
          
          /* Вариации форм зданий */
          
          /* Трапеция: левый край прямой, правый под углом */
          .building[data-shape="trapezoid-left"] {
            clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);
          }
          
          /* Трапеция: правый край прямой, левый под углом */
          .building[data-shape="trapezoid-right"] {
            clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%);
          }
          
          /* Выпирающая часть слева (эркер) */
          .building[data-shape="protrusion-left"]::after {
            content: '';
            position: absolute;
            left: -8%;
            top: 20%;
            width: 12%;
            height: 40%;
            clip-path: polygon(0 0, 100% 15%, 100% 85%, 0 100%);
            z-index: -1;
            background: 
              repeating-linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.04) 0px,
                rgba(0, 0, 0, 0.06) 2px,
                transparent 2px,
                transparent 20px
              ),
              linear-gradient(to top,
                rgba(0, 0, 0, 0.02) 0%,
                transparent 40%,
                transparent 60%,
                rgba(0, 0, 0, 0.01) 100%
              );
            background-color: inherit;
          }
          
          /* Выпирающая часть справа (эркер) */
          .building[data-shape="protrusion-right"]::after {
            content: '';
            position: absolute;
            right: -8%;
            top: 25%;
            width: 12%;
            height: 35%;
            clip-path: polygon(0 15%, 100% 0, 100% 100%, 0 85%);
            z-index: -1;
            background: 
              repeating-linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.04) 0px,
                rgba(0, 0, 0, 0.06) 2px,
                transparent 2px,
                transparent 20px
              ),
              linear-gradient(to top,
                rgba(0, 0, 0, 0.02) 0%,
                transparent 40%,
                transparent 60%,
                rgba(0, 0, 0, 0.01) 100%
              );
            background-color: inherit;
          }
          
          /* Ступенчатое здание (уменьшается к верху) */
          .building[data-shape="stepped"] {
            clip-path: polygon(
              0 0,
              100% 0,
              100% 30%,
              90% 30%,
              90% 60%,
              80% 60%,
              80% 100%,
              0 100%
            );
          }
          
          /* Башня (узкое вверху, широкое внизу) */
          .building[data-shape="tower"] {
            clip-path: polygon(
              20% 0,
              80% 0,
              100% 40%,
              100% 100%,
              0 100%,
              0 40%
            );
          }
        `}</style>
        {buildings.map((b, i) => (
          <div
            key={i}
            className="building"
            data-foreground={b.zIndex >= 3 ? 'true' : undefined}
            data-gray={(b as any).isGray ? 'true' : undefined}
            data-pattern={(b as any).pattern || undefined}
            data-shape={(b as any).shape || undefined}
            style={{
              width: b.width,
              height: b.height,
              left: b.left,
              backgroundColor: b.color,
              animationDelay: `${b.delay}s`,
              opacity: b.opacity,
              zIndex: b.zIndex,
              ['--building-scale' as string]: b.scale.toString(),
            } as CSSProperties}
          />
        ))}
      </div>
    )
  }

export default CityscapeBackground;