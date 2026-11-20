import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const AUTO_ADVANCE_MS = 4000

export default function DepthCarousel({ items, visibleCards = 4, depth = 100, spread = 78, tilt = 12 }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const total = items.length
  const goTo = (index) => setActiveIndex((index + total) % total)

  useEffect(() => {
    if (total < 2 || isHovered || hasFocus || prefersReducedMotion) return

    const timer = window.setTimeout(() => {
      setActiveIndex(index => (index + 1) % total)
    }, AUTO_ADVANCE_MS)

    return () => window.clearTimeout(timer)
  }, [activeIndex, total, isHovered, hasFocus, prefersReducedMotion])

  const cardPosition = (index) => {
    let position = index - activeIndex
    if (position > total / 2) position -= total
    if (position < -total / 2) position += total
    return position
  }

  return (
    <div
      className="relative mx-auto w-full max-w-[1300px]"
      style={{ perspective: '1400px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setHasFocus(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false)
      }}
    >
      <div className="relative h-[370px] overflow-hidden sm:h-[470px]" aria-roledescription="carousel" aria-label="Matrimony communities">
        {items.slice(0, visibleCards).map((item, index) => {
          const position = cardPosition(index)
          const distance = Math.abs(position)
          const isActive = position === 0
          const transform = `translateX(calc(-50% + ${position * (spread + 205)}px)) translateZ(${-distance * depth}px) rotateY(${position * -tilt}deg) scale(${1 - distance * 0.06})`

          return (
            <a
              key={item.title}
              href={item.href || '#community'}
              onClick={(event) => {
                if (!isActive) {
                  event.preventDefault()
                  goTo(index)
                }
              }}
              className={`group absolute left-1/2 top-2 block h-[332px] w-[224px] overflow-hidden rounded-[24px] bg-[#252b2e] outline-none transition-[transform,opacity,filter,border-color,box-shadow] duration-700 ease-out focus-visible:ring-2 focus-visible:ring-[#d3a825] sm:top-4 sm:h-[412px] sm:w-[282px] lg:w-[306px] ${isActive ? 'border-2 border-[#701C35] shadow-[0_24px_50px_rgba(86,57,8,0.28)]' : 'border border-white/45 shadow-[0_18px_34px_rgba(38,30,18,0.2)]'}`}
              style={{
                transform,
                zIndex: 10 - distance,
                opacity: distance > 2 ? 0 : 1 - distance * 0.12,
                filter: 'none'
              }}
              aria-label={`${item.title}${isActive ? ', selected' : ''}`}
            >
              <img src={item.image} alt={item.alt || item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121718]/95 via-[#121718]/28 to-black/5" />
              <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-black/20 px-2.5 py-1 font-sans text-[0.6rem] font-bold tracking-[0.16em] text-white/90 backdrop-blur-sm sm:left-5 sm:top-5">COMMUNITY 0{index + 1}</span>
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <h3 className="font-serif text-2xl font-semibold leading-tight text-white sm:text-[1.75rem]">{item.title}</h3>
                <span className="mt-3 inline-flex border-b border-[#f1cb4d]/70 pb-1 font-sans text-xs font-bold tracking-[0.12em] text-[#E8CA91]">
                  EXPLORE COMMUNITY
                </span>
              </div>
            </a>
          )
        })}
      </div>

      <div className="mt-5 flex justify-center gap-1.5 sm:mt-7" aria-label="Carousel slides">
          {items.map((item, index) => (
            <button key={item.title} type="button" onClick={() => goTo(index)} aria-label={`Show ${item.title}`} aria-current={index === activeIndex ? 'true' : undefined} className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-6 bg-[#701C35]' : 'w-2 bg-[#b7bdbe] hover:bg-[#747d80]'}`} />
          ))}
      </div>
    </div>
  )
}
