import { useState, useEffect, useMemo } from 'react'

/**
 * ScreenForensicWatermark
 *
 * Ensures zero disturbance to genuine customers during normal browsing:
 * - In normal browsing state: Completely hidden / NOT rendered (0% disturbance).
 * - The moment a screenshot or screen capture is initiated (PrintScreen, Win+Shift+S,
 *   Cmd+Shift+3/4/5, Ctrl+P): Instantly triggers and blankets the entire screen with the
 *   forensic watermark grid showing the Viewer's Member ID and timestamp.
 * - Automatically disappears after the capture event.
 */
export default function ScreenForensicWatermark({ currentMember }) {
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
    const timeStr = now.toLocaleTimeString('en-IN')

    return {
      viewerId,
      viewerName,
      dateStr,
      timeStr,
      stampText: `KERALA KALYANS · VIEWER ID: ${viewerId} · ${viewerName} · ${dateStr} ${timeStr}`
    }
  }, [currentMember])

  // Listen for screenshot capture keys and snipping shortcuts
  useEffect(() => {
    let restoreTimer = null

    const activateWatermark = () => {
      setIsCapturing(true)
      if (restoreTimer) clearTimeout(restoreTimer)
      restoreTimer = setTimeout(() => {
        setIsCapturing(false)
      }, 2600)
    }

    const handleKeyDown = (e) => {
      // 1. PrintScreen key (any code / keycode)
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        activateWatermark()
        return
      }

      // 2. Windows Snipping (Win+Shift+S) or Mac Screenshot (Cmd+Shift+3/4/5)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['s', 'S', '3', '4', '5'].includes(e.key)) {
        activateWatermark()
        return
      }

      // 3. Ctrl+P (Print / PDF)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        activateWatermark()
        return
      }

      // 4. Ctrl+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        activateWatermark()
        return
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        activateWatermark()
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

  // Generate high-visibility SVG pattern when screenshot is triggered
  const watermarkSvgUri = useMemo(() => {
    const text = viewerInfo.stampText
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="360" height="180" viewBox="0 0 360 180">
        <style>
          .wm-bold {
            font-family: system-ui, -apple-system, sans-serif;
            font-weight: 800;
            font-size: 13px;
            letter-spacing: 1px;
            fill: #701C35;
            fill-opacity: 0.35;
          }
          .wm-id-bold {
            font-family: system-ui, -apple-system, sans-serif;
            font-weight: 900;
            font-size: 14px;
            letter-spacing: 1.5px;
            fill: #b91c1c;
            fill-opacity: 0.45;
          }
        </style>
        <g transform="rotate(-22 180 90)">
          <text x="10" y="45" class="wm-bold">${text}</text>
          <text x="10" y="135" class="wm-id-bold">CONFIDENTIAL · VIEWER ID: ${viewerInfo.viewerId}</text>
        </g>
      </svg>
    `.trim()

    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
  }, [viewerInfo])

  // Normal browsing: 100% clean and undisturbed
  if (!isCapturing) return null

  // Capture mode: Watermark blankets full viewport
  return (
    <div
      id="forensic-screen-watermark-overlay"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-[999999] animate-in fade-in duration-75"
      style={{
        backgroundImage: watermarkSvgUri,
        backgroundRepeat: 'repeat',
        backgroundPosition: '0 0',
        backgroundSize: '360px 180px',
        backgroundColor: 'rgba(255, 255, 255, 0.12)'
      }}
    />
  )
}
