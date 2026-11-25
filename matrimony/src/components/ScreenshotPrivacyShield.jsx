import { useState, useEffect } from 'react'
import { ShieldAlert, EyeOff } from 'lucide-react'

export default function ScreenshotPrivacyShield({ enabled = true, label = 'Member Profile' }) {
  const [isBlackout, setIsBlackout] = useState(false)
  const [blackoutReason, setBlackoutReason] = useState('')

  useEffect(() => {
    if (!enabled) return

    let restoreTimer = null

    const triggerBlackout = (reason, duration = 1800) => {
      setIsBlackout(true)
      setBlackoutReason(reason || 'Screen capture blocked for member privacy')

      // Purge clipboard so screenshot buffer cannot hold profile data
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('')
        }
      } catch {}

      if (restoreTimer) clearTimeout(restoreTimer)
      restoreTimer = setTimeout(() => {
        setIsBlackout(false)
      }, duration)
    }

    // 1. Keyboard event listeners (PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5, Ctrl+P, Ctrl+S)
    const handleKeyDown = (e) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        e.preventDefault()
        triggerBlackout('Screenshot key detected. Screen blacked out.')
        return
      }

      // Windows Snipping (Win+Shift+S) / Mac Screenshot (Cmd+Shift+3/4/5)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['s', 'S', '3', '4', '5'].includes(e.key)) {
        e.preventDefault()
        triggerBlackout('Screen capture tool detected. Screen blacked out.')
        return
      }

      // Ctrl + P (Print / Save PDF)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault()
        triggerBlackout('Printing disabled for profile privacy protection.')
        return
      }

      // Ctrl + S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        triggerBlackout('Saving profiles is strictly disabled.')
        return
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        triggerBlackout('Screenshot captured black screen. Profile protected.')
      }
    }

    // Disable right-click context menu on images to prevent direct image downloading
    const handleContextMenu = (e) => {
      if (e.target && (e.target.tagName === 'IMG' || e.target.closest('.protected-profile-view'))) {
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)
    window.addEventListener('contextmenu', handleContextMenu)

    return () => {
      if (restoreTimer) clearTimeout(restoreTimer)
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [enabled])

  if (!enabled || !isBlackout) return null

  return (
    <div
      className="fixed inset-0 z-[9999999] bg-black flex flex-col items-center justify-center text-center p-6 select-none cursor-none pointer-events-auto"
      style={{ backgroundColor: '#000000', opacity: 1 }}
      aria-live="assertive"
    >
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-red-950/70 border border-red-500/40 flex items-center justify-center text-red-500 shadow-2xl shadow-red-900/50 animate-pulse">
            <ShieldAlert size={42} />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wider">
          SCREENSHOT BLOCKED
        </h2>

        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
          {blackoutReason || 'To safeguard member privacy, screenshot taking and screen recording of profiles are strictly prohibited.'}
        </p>

        <div className="pt-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-[#E8CA91] text-xs font-semibold tracking-wide border border-white/10">
            <EyeOff size={13} />
            <span>KERALA KALYANS PRIVACY SHIELD</span>
          </span>
        </div>
      </div>
    </div>
  )
}
