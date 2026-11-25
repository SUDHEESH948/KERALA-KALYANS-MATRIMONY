import { useEffect, useRef, useMemo } from 'react'

/**
 * ScreenForensicWatermark
 *
 * Provides full-screen, tamper-resistant forensic watermarking covering EVERY portion of the screen.
 * Whichever PC, monitor, or device is used, and whichever portion/crop is photographed
 * (even with an external phone camera), the viewer's ID, Name, and timestamp are captured.
 *
 * - Semi-transparent repeating SVG pattern across the full viewport
 * - High-density repetition so even a small crop contains the Viewer ID
 * - MutationObserver to prevent tampering / removal via DevTools
 * - pointer-events-none so it never interferes with clicks or scrolling
 */
export default function ScreenForensicWatermark({ currentMember }) {
  const containerRef = useRef(null)

  // Resolve viewer identity
  const viewerInfo = useMemo(() => {
    let user = currentMember
    if (!user) {
      try {
        user = JSON.parse(localStorage.getItem('apremiya_member_user') || 'null')
      } catch {}
    }

    const viewerId = user?.id || user?._id || 'MEMBER-' + (user?.email ? Math.abs(user.email.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) % 10000) : 'GUEST')
    const viewerName = user?.name || user?.email?.split('@')[0] || 'Verified Member'
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

    return {
      viewerId,
      viewerName,
      dateStr,
      stampText: `KERALA KALYANS · ID: ${viewerId} · ${viewerName} · ${dateStr}`
    }
  }, [currentMember])

  // Generate SVG Data URI for crisp, infinite background pattern across any screen resolution
  const watermarkSvgUri = useMemo(() => {
    const text = viewerInfo.stampText
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="380" height="200" viewBox="0 0 380 200">
        <style>
          .wm-text {
            font-family: system-ui, -apple-system, sans-serif;
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 1.5px;
            fill: #701C35;
            fill-opacity: 0.085;
          }
          .wm-id {
            font-family: system-ui, -apple-system, sans-serif;
            font-weight: 800;
            font-size: 11.5px;
            letter-spacing: 1px;
            fill: #000000;
            fill-opacity: 0.095;
          }
        </style>
        <g transform="rotate(-22 190 100)">
          <text x="10" y="55" class="wm-text">${text}</text>
          <text x="10" y="155" class="wm-id">VIEWER ID: ${viewerInfo.viewerId} · CONFIDENTIAL</text>
        </g>
      </svg>
    `.trim()

    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
  }, [viewerInfo])

  // Anti-tamper MutationObserver: If user tries to delete, hide, or alter opacity via DevTools, re-enforce it
  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof MutationObserver === 'undefined') return

    const enforceStyles = () => {
      if (!el) return
      if (el.style.display === 'none') el.style.display = 'block'
      if (parseFloat(el.style.opacity || '1') < 0.5) el.style.opacity = '1'
      if (el.style.visibility === 'hidden') el.style.visibility = 'visible'
      if (el.style.position !== 'fixed') el.style.position = 'fixed'
      if (el.style.zIndex !== '99999') el.style.zIndex = '99999'
    }

    const observer = new MutationObserver(() => {
      enforceStyles()
    })

    observer.observe(el, {
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      id="forensic-screen-watermark"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-[99999]"
      style={{
        backgroundImage: watermarkSvgUri,
        backgroundRepeat: 'repeat',
        backgroundPosition: '0 0',
        backgroundSize: '380px 200px',
        opacity: 1
      }}
    />
  )
}
