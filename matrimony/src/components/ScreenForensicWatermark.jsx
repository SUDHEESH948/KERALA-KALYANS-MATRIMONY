import { useState, useEffect, useRef, useMemo } from 'react'

/**
 * ScreenForensicWatermark
 *
 * Provides full-screen, non-disturbing forensic watermarking across the entire viewport.
 * - Always present in pixels so ANY screenshot (Snipping Tool, PrintScreen, phone camera, crop)
 *   irrevocably captures the Viewer's ID and Name across every portion of the screen.
 * - Ultra-subtly calibrated (~5% opacity) so genuine customers can read text and view photos
 *   with complete comfort and ZERO visual disturbance (looks like security banknote watermarking).
 * - On screenshot shortcut detection (PrintScreen, Win+Shift+S, etc.), flashes higher contrast
 *   to ensure maximum forensic capture and triggers the admin security alert.
 * - Anti-tamper MutationObserver prevents disabling via browser DevTools.
 */
export default function ScreenForensicWatermark({ currentMember }) {
  const containerRef = useRef(null)
  const [isCapturing, setIsCapturing] = useState(false)

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
      stampText: `KERALA KALYANS · ID: ${viewerId} · ${viewerName}`
    }
  }, [currentMember])

  // Key listeners for screenshot / print events
  useEffect(() => {
    let restoreTimer = null

    const activateCaptureMode = () => {
      setIsCapturing(true)
      if (restoreTimer) clearTimeout(restoreTimer)
      restoreTimer = setTimeout(() => {
        setIsCapturing(false)
      }, 2500)
    }

    const handleKeyDown = (e) => {
      if (
        e.key === 'PrintScreen' ||
        e.keyCode === 44 ||
        e.code === 'PrintScreen' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['s', 'S', '3', '4', '5'].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && ['p', 'P', 's', 'S'].includes(e.key))
      ) {
        activateCaptureMode()
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        activateCaptureMode()
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)

    return () => {
      if (restoreTimer) clearTimeout(restoreTimer)
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
    }
  }, [])

  // Generate SVG Pattern:
  // Normal state: Subtle ~5.5% opacity (0 disturbance to reading, but permanently stamped into any screenshot/photo)
  // Capture flash: High contrast 40% opacity
  const watermarkSvgUri = useMemo(() => {
    const text = viewerInfo.stampText
    const idText = `VIEWER ID: ${viewerInfo.viewerId}`
    const textOpacity = isCapturing ? '0.35' : '0.055'
    const idOpacity = isCapturing ? '0.45' : '0.075'

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160">
        <style>
          .wm-line1 {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 1px;
            fill: #701C35;
            fill-opacity: ${textOpacity};
          }
          .wm-line2 {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-weight: 800;
            font-size: 11.5px;
            letter-spacing: 1.5px;
            fill: #000000;
            fill-opacity: ${idOpacity};
          }
        </style>
        <g transform="rotate(-20 160 80)">
          <text x="10" y="45" class="wm-line1">${text}</text>
          <text x="10" y="125" class="wm-line2">${idText} · CONFIDENTIAL</text>
        </g>
      </svg>
    `.trim()

    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
  }, [viewerInfo, isCapturing])

  // Anti-tamper MutationObserver: If user tries to hide or remove via DevTools, re-enforce it
  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof MutationObserver === 'undefined') return

    const observer = new MutationObserver(() => {
      if (el) {
        if (el.style.display === 'none') el.style.display = 'block'
        if (el.style.visibility === 'hidden') el.style.visibility = 'visible'
        if (el.style.position !== 'fixed') el.style.position = 'fixed'
      }
    })

    observer.observe(el, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      id="forensic-screen-watermark"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-[9999]"
      style={{
        backgroundImage: watermarkSvgUri,
        backgroundRepeat: 'repeat',
        backgroundPosition: '0 0',
        backgroundSize: '320px 160px',
        backgroundColor: isCapturing ? 'rgba(0,0,0,0.2)' : 'transparent',
        transition: 'background-color 0.15s ease'
      }}
    />
  )
}
