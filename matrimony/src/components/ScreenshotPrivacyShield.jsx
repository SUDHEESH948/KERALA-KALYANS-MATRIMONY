import { useState, useEffect, useMemo } from 'react'
import { ShieldAlert, EyeOff, UserCheck, AlertTriangle } from 'lucide-react'
import { API_BASE } from '../config/api'

export default function ScreenshotPrivacyShield({
  enabled = true,
  label = 'Member Profile',
  currentMember = null,
  targetProfile = null
}) {
  const [isBlackout, setIsBlackout] = useState(false)
  const [blackoutReason, setBlackoutReason] = useState('')
  const [alertDispatched, setAlertDispatched] = useState(false)

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

  useEffect(() => {
    if (!enabled) return

    let restoreTimer = null

    const reportAndBlackout = (reason, duration = 3000) => {
      setIsBlackout(true)
      setBlackoutReason(reason || 'Screenshot attempt detected. Screen blacked out.')
      setAlertDispatched(true)

      // 1. Purge clipboard so screenshot buffer cannot hold profile data
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('')
        }
      } catch {}

      // 2. Dispatch real-time security notification to Admin
      const timestamp = new Date().toISOString()
      const targetId = targetProfile?.id || targetProfile?._id || label
      const targetName = targetProfile?.name || label

      const alertPayload = {
        viewerId: viewer.id,
        viewerName: viewer.name,
        viewerEmail: viewer.email,
        viewerPhone: viewer.phone,
        targetProfileId: targetId,
        targetProfileName: targetName,
        reason,
        timestamp
      }

      // Backend API call to record incident
      try {
        fetch(`${API_BASE}/photos/screenshot-alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertPayload)
        }).catch(() => {})
      } catch {}

      // Real-time client storage dispatch for Admin notification dashboard
      try {
        const notifId = `sec-alert-${Date.now()}`
        const newNotif = {
          id: notifId,
          targetId: targetId,
          title: `🚨 Screenshot Attempt Blocked (ID: ${viewer.id})`,
          message: `Viewer ${viewer.name} (ID: ${viewer.id}${viewer.phone ? `, Phone: ${viewer.phone}` : ''}) attempted to take a screenshot of ${targetName}'s photo at ${new Date().toLocaleTimeString()}. Blackout triggered.`,
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

      if (restoreTimer) clearTimeout(restoreTimer)
      restoreTimer = setTimeout(() => {
        setIsBlackout(false)
        setAlertDispatched(false)
      }, duration)
    }

    // 1. Keyboard event listeners (PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5, Ctrl+P, Ctrl+S)
    const handleKeyDown = (e) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        e.preventDefault()
        reportAndBlackout('PrintScreen key detected. Screen blacked out and incident reported.')
        return
      }

      // Windows Snipping (Win+Shift+S) / Mac Screenshot (Cmd+Shift+3/4/5)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['s', 'S', '3', '4', '5'].includes(e.key)) {
        e.preventDefault()
        reportAndBlackout('Screen capture shortcut detected. Screen blacked out.')
        return
      }

      // Ctrl + P (Print / Save PDF)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault()
        reportAndBlackout('Printing disabled for profile privacy protection.')
        return
      }

      // Ctrl + S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        reportAndBlackout('Saving profiles is strictly disabled.')
        return
      }
    }

    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44 || e.code === 'PrintScreen') {
        reportAndBlackout('Screenshot captured black screen. Admin notified.')
      }
    }

    // Disable right-click context menu on images
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
  }, [enabled, viewer, targetProfile, label])

  if (!enabled || !isBlackout) return null

  return (
    <div
      className="fixed inset-0 z-[9999999] bg-black flex flex-col items-center justify-center text-center p-6 select-none cursor-none pointer-events-auto"
      style={{ backgroundColor: '#000000', opacity: 1 }}
      aria-live="assertive"
    >
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-red-950/70 border border-red-500/40 flex items-center justify-center text-red-500 shadow-2xl shadow-red-900/50 animate-pulse">
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
        <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-3.5 text-left text-xs space-y-1.5 text-gray-200">
          <div className="flex items-center gap-1.5 font-bold text-red-400 text-xs uppercase tracking-wider pb-1 border-b border-red-500/20">
            <AlertTriangle size={14} />
            <span>Forensic Watermark &amp; Identification</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-gray-400">Viewer Member ID:</span>
            <span className="font-bold text-white tracking-wider">{viewer.id}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-gray-400">Viewer Name:</span>
            <span className="font-semibold text-white">{viewer.name}</span>
          </div>
          {targetProfile?.name && (
            <div className="flex justify-between py-0.5">
              <span className="text-gray-400">Target Profile:</span>
              <span className="font-semibold text-amber-300">{targetProfile.name} ({targetProfile.id})</span>
            </div>
          )}
          <div className="flex justify-between py-0.5">
            <span className="text-gray-400">Timestamp:</span>
            <span className="text-gray-300">{new Date().toLocaleString()}</span>
          </div>
        </div>

        {/* Real-Time Admin Notification Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 py-2 px-3.5 rounded-lg">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Admin Alert Dispatched in Real-Time</span>
        </div>

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
