import { useState } from 'react'

/** A compact, touch-friendly footer dock with an intentional desktop hover state. */
export default function Dock({ items }) {
  const [hovered, setHovered] = useState(null)

  return (
    <nav aria-label="Footer navigation" className="mx-auto flex w-fit max-w-full items-end gap-1.5 overflow-x-auto rounded-[22px] border border-white/15 bg-white/10 p-2.5 shadow-2xl backdrop-blur-md sm:gap-2 sm:p-3">
      {items.map((item, index) => {
        if (item.separator) {
          return <span key={`separator-${index}`} className="mx-0.5 h-8 w-px shrink-0 bg-white/20" aria-hidden="true" />
        }

        const active = hovered === index
        const content = (
          <>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl border text-white transition duration-200 sm:h-11 sm:w-11 ${active ? 'border-[#e2b82f] bg-[#701C35] text-white shadow-lg shadow-black/30' : 'border-white/10 bg-white/10 hover:border-white/25 hover:bg-white/20'}`}>
              {item.icon}
            </span>
            <span className={`pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#511327] px-2 py-1 text-[12px] font-semibold text-white opacity-0 shadow-lg transition ${active ? 'opacity-100' : ''}`}>
              {item.label}
            </span>
          </>
        )

        const classes = `relative shrink-0 transition duration-200 ${active ? '-translate-y-2 scale-110' : ''}`
        const events = {
          onMouseEnter: () => setHovered(index),
          onMouseLeave: () => setHovered(null),
          onFocus: () => setHovered(index),
          onBlur: () => setHovered(null)
        }

        return item.href ? (
          <a key={item.label} href={item.href} className={classes} aria-label={item.label} {...events}>{content}</a>
        ) : (
          <button key={item.label} type="button" onClick={item.onClick} className={classes} aria-label={item.label} {...events}>{content}</button>
        )
      })}
    </nav>
  )
}
