import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ShieldAlert, EyeOff, AlertTriangle, ArrowLeft } from 'lucide-react'
import { API_BASE } from '../config/api'

export default function ScreenshotPrivacyShield({
  enabled = true,
  label = 'Member Profile',
  currentMember = null,
  targetProfile = null
}) {
  const [isBlackout, setIsBlackout] = useState(false)
  const [blackoutReason, setBlackoutReason] = useState('')
  const [capturedAt, setCapturedAt] = useState('')
  const blackoutStartRef = useRef(0)
  const restoreTimerRef = useRef(null)

  // Resolve active viewer details
  const viewer = useMemo(() => {
    let user = currentMember
    if (!user) {
      try {
        user = JSON.parse(localStorage.getItem('apremiya_member_user') || 'null')
      } catch {}
    }
    const id = user?.id || user?._id || 'GUEST-' + Math.floor(1000 + Math.random() * 9000)
    const name = user?.name || user?.email?.split('@')[0] || 'Member Visitor'
    const email = user?.email || ''
    const phone = user?.phone || ''
    return { id, name, email, phone }
  }, [currentMember])

  const viewerRef = useRef(viewer)
  viewerRef.current = viewer

  const targetProfileRef = useRef(targetProfile)
  targetProfileRef.current = targetProfile

  const labelRef = useRef(label)
  labelRef.current = label

  const dismissBlackout = () => {
    if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current)
    document.documentElement.classList.remove('privacy-blackout-active')
    document.body.classList.remove('privacy-blackout-active')
    const shieldEl = document.getElementById('kerala-kalyans-blackout-shield')
    if (shieldEl) {
      shieldEl.style.display = 'none'
    }
    setIsBlackout(false)
  }

  useEffect(() => {
    if (!enabled) return

    const reportAndBlackout = (reason, minLockDuration = 5000) => {
      // 1. Immediately apply synchronous CSS blackout to root DOM (0ms response time)
      document.documentElement.classList.add('privacy-blackout-active')
      document.body.classList.add('privacy-blackout-active')

      const shieldEl = document.getElementById('kerala-kalyans-blackout-shield')
      if (shieldEl) {
        shieldEl.style.display = 'flex'
        shieldEl.style.visibility = 'visible'
        shieldEl.style.opacity = '1'
      }

      blackoutStartRef.current = Date.now()
      const nowStr = new Date().toLocaleString()
      setCapturedAt(nowStr)
      setBlackoutReason(reason || 'Screenshot attempt detected. Screen blacked out.')
      setIsBlackout(true)

      // 2. Clear system clipboard
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('')
        }
      } catch {}

      // 3. Dispatch real-time security alert to Backend API
      const currentViewer = viewerRef.current
      const currentTarget = targetProfileRef.current
      const targetId = currentTarget?.id || currentTarget?._id || labelRef.current
      const targetName = currentTarget?.name || labelRef.current

      const timestamp = new Date().toISOString()
      const alertPayload = {
        viewerId: currentViewer.id,
        viewerName: currentViewer.name,
        viewerEmail: currentViewer.email,
        viewerPhone: currentViewer.phone,
        targetProfileId: targetId,
        targetProfileName: targetName,
        reason,
        timestamp
      }

      try {
        fetch(`${API_BASE}/photos/screenshot-alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertPayload)
        }).catch(() => {})
      } catch {}

      // 4. Dispatch instant storage notification for Admin Dashboard
      try {
        const notifId = `sec-alert-${Date.now()}`
        const newNotif = {
          id: notifId,
          targetId: targetId,
          title: `🚨 Screenshot Attempt Blocked (ID: ${currentViewer.id})`,
          message: `Viewer ${currentViewer.name} (ID: ${currentViewer.id}${currentViewer.phone ? `, Phone: ${currentViewer.phone}` : ''}) attempted to take a screenshot of ${targetName}'s photo at ${new Date().toLocaleTimeString()}. Blackout triggered.`,
          type: 'security_alert',
          timestamp,
          isRead: false,
          action: { tab: 'profiles', search: targetName }
        }

        const saved = localStorage.getItem('apremiya_notifications')
        const currentList = saved ? JSON.parse(saved) : []
        const updated = [newNotif, ...(Array.isArray(currentList) ? currentList.slice(0, 49) : [])]
        localStorage.setItem('apremiya_notifications', JSON.stringify(updated))
        window.dispatchEvent(new Event('storage'))
      } catch {}

      // 5. Maintain locked blackout for minLockDuration before allowing auto-dismiss
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current)
      restoreTimerRef.current = setTimeout(() => {
        if (!document.hidden && document.visibilityState === 'visible') {
          dismissBlackout()
        }
      }, minLockDuration)
    }

    // 1. Keyboard event listeners (PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5, Ctrl+P, Ctrl+S)
    const handleKeyDown = (e) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        e.preventDefault()
        reportAndBlackout('PrintScreen key pressed. Screen blacked out.', 5000)
        return
      }

      // Windows Snipping (Win+Shift+S) / Mac Screenshot (Cmd+Shift+3/4/5)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['s', 'S', '3', '4', '5'].includes(e.key)) {
        e.preventDefault()
        reportAndBlackout('Screen capture shortcut triggered. Screen blacked out.', 5000)
        return
      }

      // Ctrl + P (Print / Save PDF)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault()
        reportAndBlackout('Printing disabled for profile privacy protection.', 5000)
        return
      }

      // Ctrl + S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        reportAndBlackout('Saving profiles is strictly disabled.', 5000)
        return
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        reportAndBlackout('PrintScreen screenshot blocked. Screen blacked out.', 5000)
      }
    }

    // 2. Window Blur / Loss of focus (triggers when Windows Snipping Tool, Mac Screen Grab, or recording overlay opens)
    const handleWindowBlur = () => {
      reportAndBlackout('Screen capture tool or window focus lost. Screen blacked out.', 5000)
    }

    const handleWindowFocus = () => {
      const elapsed = Date.now() - blackoutStartRef.current
      if (elapsed < 4500) {
        // Snipping tool may steal and jitter focus during rectangle drag: Keep blacked out!
        return
      }
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current)
      restoreTimerRef.current = setTimeout(() => {
        dismissBlackout()
      }, 1500)
    }

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        reportAndBlackout('Window hidden / background screen capture attempt. Screen blacked out.', 5000)
      } else {
        handleWindowFocus()
      }
    }

    // 3. Mouse Leave window (e.g. moving cursor to Snipping Tool bar or outside browser)
    const handleMouseLeave = (e) => {
      if (!e.relatedTarget && !e.toElement) {
        reportAndBlackout('Cursor left browser window during protected profile view.', 4000)
      }
    }

    // Disable right-click context menu on images
    const handleContextMenu = (e) => {
      if (e.target && (e.target.tagName === 'IMG' || e.target.closest('.protected-profile-view'))) {
        e.preventDefault()
      }
    }

    // Prevent clipboard copying
    const handleCopy = (e) => {
      if (e.target && e.target.closest('.protected-profile-view')) {
        e.preventDefault()
        reportAndBlackout('Copying profile content is strictly prohibited.', 4000)
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('focus', handleWindowFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('copy', handleCopy)

    return () => {
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current)
      document.documentElement.classList.remove('privacy-blackout-active')
      document.body.classList.remove('privacy-blackout-active')
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('focus', handleWindowFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('copy', handleCopy)
    }
  }, [enabled])

  if (!enabled || typeof document === 'undefined') return null

  const currentViewer = viewerRef.current || viewer
  const currentTarget = targetProfileRef.current || targetProfile
  const targetId = currentTarget?.id || currentTarget?._id || label
  const targetName = currentTarget?.name || label

  return createPortal(
    <div
      id="kerala-kalyans-blackout-shield"
      className={`fixed inset-0 bg-black flex-col items-center justify-center text-center p-6 select-none pointer-events-auto overflow-hidden ${
        isBlackout ? 'flex' : 'hidden'
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        zIndex: 2147483647,
        display: isBlackout ? 'flex' : 'none',
        visibility: isBlackout ? 'visible' : 'hidden',
        opacity: isBlackout ? 1 : 0
      }}
      aria-live="assertive"
    >
      {/* Repeating Diagonal Watermark Grid across the Blackout screen */}
      <div className="absolute inset-0 flex flex-col justify-around opacity-30 rotate-[-22deg] scale-125 pointer-events-none select-none">
        {[...Array(9)].map((_, rIdx) => (
          <div
            key={rIdx}
            className="flex justify-around whitespace-nowrap text-xs sm:text-sm font-black tracking-widest text-red-500/80 drop-shadow"
          >
            <span>KERALA KALYANS · VIEWER ID: {currentViewer.id} · {currentViewer.name}</span>
            <span className="hidden sm:inline">KERALA KALYANS · VIEWER ID: {currentViewer.id} · {currentViewer.name}</span>
          </div>
        ))}
      </div>

      <div className="max-w-lg mx-auto space-y-4 relative z-10">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-500 shadow-2xl shadow-red-900/60 animate-pulse">
            <ShieldAlert size={42} />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wider">
          SCREENSHOT BLOCKED
        </h2>

        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md mx-auto">
          {blackoutReason || 'To safeguard member privacy, screenshot taking and screen recording of profiles are strictly prohibited.'}
        </p>

        {/* Forensic Watermark Identification Display */}
        <div className="bg-red-950/60 border border-red-500/40 rounded-xl p-4 text-left text-xs space-y-1.5 text-gray-200 backdrop-blur-md">
          <div className="flex items-center gap-1.5 font-bold text-red-400 text-xs uppercase tracking-wider pb-1.5 border-b border-red-500/30">
            <AlertTriangle size={15} />
            <span>Forensic Identification &amp; Viewer Tracking</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-gray-400">Viewer Member ID:</span>
            <span className="font-bold text-white tracking-wider text-sm">{currentViewer.id}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-gray-400">Viewer Name:</span>
            <span className="font-semibold text-white">{currentViewer.name}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-gray-400">Target Candidate:</span>
            <span className="font-semibold text-amber-300">{targetName} ({targetId})</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-gray-400">Incident Timestamp:</span>
            <span className="text-gray-300">{capturedAt || new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* Real-Time Admin Notification Badge */}
        <div className="flex items-center justify-center gap-2 text-[12px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 py-2 px-4 rounded-lg">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Real-time security alert dispatched to Admin Dashboard</span>
        </div>

        {/* Dismiss / Return Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={dismissBlackout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer border border-white/20 transition backdrop-blur-sm"
          >
            <ArrowLeft size={14} />
            <span>Return to Profile</span>
          </button>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 text-[#E8CA91] text-[11px] font-semibold tracking-wide border border-white/10">
            <EyeOff size={13} />
            <span>KERALA KALYANS PRIVACY SHIELD</span>
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}
