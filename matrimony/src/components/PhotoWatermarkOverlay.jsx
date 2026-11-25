import { useMemo } from 'react'

/**
 * PhotoWatermarkOverlay
 * Overlays semi-transparent diagonal forensic watermarking directly over profile photos
 * displaying the Viewer's User ID, Name, and current date.
 * Also renders a persistent tracking badge at the bottom of the photo container:
 * "ആരാണ് എടുത്തത് അയാളുടെ ഐഡി താഴെ കാണിക്കണം"
 */
export default function PhotoWatermarkOverlay({ viewer, targetProfile, compact = false }) {
  const viewerInfo = useMemo(() => {
    let user = viewer
    if (!user) {
      try {
        user = JSON.parse(localStorage.getItem('apremiya_member_user') || 'null')
      } catch {}
    }

    const viewerId = user?.id || user?._id || 'GUEST-' + Math.abs((user?.email || 'anon').split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) % 10000)
    const viewerName = user?.name || user?.email?.split('@')[0] || 'Registered Visitor'
    const now = new Date()
    const formattedDate = `${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`

    return {
      viewerId,
      viewerName,
      formattedDate,
      fullLabel: `KERALA KALYANS · ID: ${viewerId} · ${viewerName} · ${formattedDate}`
    }
  }, [viewer])

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden flex flex-col justify-between">
      {/* 1. Diagonal Semi-Transparent Repeating Forensic Watermark Grid */}
      <div className="absolute inset-0 flex flex-col justify-around opacity-25 rotate-[-25deg] scale-125 pointer-events-none">
        {[...Array(compact ? 3 : 5)].map((_, rIdx) => (
          <div
            key={rIdx}
            className="flex justify-around whitespace-nowrap text-[10px] sm:text-xs font-bold tracking-widest text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
          >
            <span>{viewerInfo.fullLabel}</span>
            <span className="hidden sm:inline">{viewerInfo.fullLabel}</span>
          </div>
        ))}
      </div>

      {/* 2. Top corner subtle brand stamp */}
      <div className="relative p-2 flex justify-end">
        <span className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-xs text-[10px] font-semibold text-white/80 border border-white/10 tracking-wider">
          KKM PROTECTED
        </span>
      </div>

      {/* 3. Bottom Viewer ID Watermark Bar ("ആരാണ് എടുത്തത് അയാളുടെ ഐഡി താഴെ കാണിക്കണം") */}
      <div className="relative p-2.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-[10px] sm:text-[11px] font-medium tracking-wide">
        <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/20 text-amber-200 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>VIEWER ID: {viewerInfo.viewerId}</span>
        </span>
        <span className="text-white/70 hidden sm:inline text-[10px]">
          {viewerInfo.formattedDate}
        </span>
      </div>
    </div>
  )
}
