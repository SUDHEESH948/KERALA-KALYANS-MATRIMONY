import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { API_BASE } from '../config/api'

function CoupleCard({ couple, index, className = '', animateEntry = true }) {
  const hasDetails = Boolean(couple.coupleName || couple.location || couple.caption)

  return (
    <motion.article
      initial={animateEntry ? { opacity: 0, y: 20 } : false}
      whileInView={animateEntry ? { opacity: 1, y: 0 } : undefined}
      viewport={animateEntry ? { once: true, amount: 0.15 } : undefined}
      transition={animateEntry ? { duration: 0.45, delay: Math.min(index * 0.08, 0.32) } : undefined}
      className={`group relative overflow-hidden rounded-[22px] border border-[#eadfce] bg-white shadow-[0_14px_30px_rgba(44,54,56,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#c79c18]/70 hover:shadow-[0_20px_36px_rgba(44,54,56,0.14)] ${className}`}
    >
      <div className="relative h-[360px] sm:h-[400px] lg:h-[430px] w-full overflow-hidden bg-[#f3ece0]">
        <img
          src={couple.image}
          alt={couple.coupleName ? `${couple.coupleName} — Happy Couple` : 'Happy Couple'}
          className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute right-3.5 top-3.5 grid size-9 place-items-center rounded-full border border-white/40 bg-black/25 text-[#E8CA91] backdrop-blur-xs">
          <Heart size={16} fill="currentColor" strokeWidth={1.6} />
        </span>
      </div>

      {hasDetails && (
        <div className="p-5">
          {couple.coupleName && (
            <h3 className="font-serif text-xl font-semibold text-[#701C35]">
              {couple.coupleName}
            </h3>
          )}
          {couple.location && (
            <p className="mt-0.5 font-sans text-xs font-semibold tracking-wider text-[#b98231] uppercase">
              {couple.location}
            </p>
          )}
          {couple.caption && (
            <p className="mt-2 text-sm leading-6 text-[#5d666b]">
              {couple.caption}
            </p>
          )}
        </div>
      )}
    </motion.article>
  )
}

export default function HappyCouplesSection() {
  const [couples, setCouples] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadCouples = () => {
      fetch(`${API_BASE}/happy-couples`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (active && Array.isArray(data)) {
            setCouples(data)
          }
        })
        .catch(() => {})
        .finally(() => {
          if (active) setLoading(false)
        })
    }

    loadCouples()
    const interval = setInterval(loadCouples, 10000)
    window.addEventListener('focus', loadCouples)

    return () => {
      active = false
      clearInterval(interval)
      window.removeEventListener('focus', loadCouples)
    }
  }, [])

  if (loading || couples.length === 0) {
    return null
  }

  const isMarquee = couples.length > 3
  const marqueeDuration = `${Math.max(couples.length * 6, 20)}s`

  return (
    <section
      id="happy-couples"
      className="relative overflow-hidden bg-[#FAF7F1] px-5 py-16 sm:px-6 sm:py-20"
    >
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-[#d8bd7b]/50" />
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-9 flex flex-col gap-4 border-b border-[#ded4c2] pb-7 sm:mb-11 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-sans text-[length:calc(0.7rem+2px)] font-bold tracking-[0.22em] text-[#b98231]">
              CELEBRATING TOGETHER
            </p>
            <h2 className="font-serif mt-2 text-3xl font-semibold text-[#293130] sm:text-4xl">
              Happy Couples
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#697277]">
            Cherished moments from families brought together through trusted matchmaking.
          </p>
        </div>

        {isMarquee ? (
          <div className="group/marquee relative overflow-hidden py-2">
            <style>{`
              @keyframes happyCouplesLeftToRight {
                0% { transform: translateX(-50%); }
                100% { transform: translateX(0%); }
              }
            `}</style>

            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#FAF7F1] to-transparent sm:w-14" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#FAF7F1] to-transparent sm:w-14" />

            <div
              className="flex w-max gap-5 lg:gap-6 group-hover/marquee:[animation-play-state:paused]"
              style={{
                animation: `happyCouplesLeftToRight ${marqueeDuration} linear infinite`,
              }}
            >
              {[0, 1].map((dup) => (
                <div key={dup} className="flex shrink-0 gap-5 lg:gap-6">
                  {couples.map((couple, index) => (
                    <CoupleCard
                      key={`${dup}-${couple._id || index}`}
                      couple={couple}
                      index={index}
                      animateEntry={false}
                      className="w-[290px] shrink-0 sm:w-[340px] lg:w-[390px]"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {couples.map((couple, index) => (
              <CoupleCard
                key={couple._id || index}
                couple={couple}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
