import { useState, useEffect } from 'react'
import { ShieldAlert, Clock, EyeOff, X, Lock } from 'lucide-react'
import SecureWatermarkedCanvas from './SecureWatermarkedCanvas'
import { API_BASE } from '../config/api'

export default function EphemeralPhotoModal({
  isOpen,
  onClose,
  targetProfile,
  currentViewer,
  viewDurationSeconds = 15
}) {
  const [timeLeft, setTimeLeft] = useState(viewDurationSeconds)
  const [imageBlobUrl, setImageBlobUrl] = useState('')
  const [watermarkInfo, setWatermarkInfo] = useState(null)
  const [isBlurredDueToLossOfFocus, setIsBlurredDueToLossOfFocus] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 1. Fetch Secure Ephemeral Token & Stream Binary
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(viewDurationSeconds)
      if (imageBlobUrl) {
        URL.revokeObjectURL(imageBlobUrl)
      }
      setImageBlobUrl('')
      setWatermarkInfo(null)
      setError('')
      setIsBlurredDueToLossOfFocus(false)
      return
    }

    let isMounted = true
    setIsLoading(true)
    setError('')

    async function loadSecurePhoto() {
      try {
        const memberToken = localStorage.getItem('apremiya_member_token') || localStorage.getItem('apremiya_admin_token')
        const tokenRes = await fetch(`${API_BASE}/photos/ephemeral-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${memberToken}`
          },
          body: JSON.stringify({ targetProfileId: targetProfile.id })
        })

        const tokenData = await tokenRes.json()
        if (!tokenRes.ok) {
          throw new Error(tokenData.error || 'Photo access not authorized by profile owner')
        }

        if (isMounted) {
          setWatermarkInfo(tokenData.viewerWatermarkInfo || {
            id: currentViewer?.id || 'MEM',
            name: currentViewer?.name || 'Member',
            phone: currentViewer?.phone || ''
          })
        }

        // Fetch raw binary buffer via short-lived HMAC token
        const streamRes = await fetch(
          `${API_BASE}/photos/stream?token=${encodeURIComponent(tokenData.token)}`
        )
        if (!streamRes.ok) {
          throw new Error('Unable to decrypt protected photo stream')
        }

        const blob = await streamRes.blob()
        if (isMounted) {
          const blobUrl = URL.createObjectURL(blob)
          setImageBlobUrl(blobUrl)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Could not load protected photo')
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadSecurePhoto()

    return () => {
      isMounted = false
    }
  }, [isOpen, targetProfile, currentViewer, viewDurationSeconds])

  // 2. Countdown Timer (15s Self-Destruct / Re-blur)
  useEffect(() => {
    if (!isOpen || !imageBlobUrl || isBlurredDueToLossOfFocus) return

    if (timeLeft <= 0) {
      if (imageBlobUrl) URL.revokeObjectURL(imageBlobUrl)
      onClose()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, timeLeft, imageBlobUrl, isBlurredDueToLossOfFocus, onClose])

  // 3. Ephemeral Viewport Keyboard & Focus Defense
  useEffect(() => {
    if (!isOpen) return

    const handleBlur = () => setIsBlurredDueToLossOfFocus(true)
    const handleFocus = () => setIsBlurredDueToLossOfFocus(false)
    const handleVisibility = () => {
      if (document.hidden) setIsBlurredDueToLossOfFocus(true)
    }

    const handleKeyDown = (e) => {
      // PrintScreen, DevTools (F12, Ctrl+Shift+I/J/C), Save (Ctrl+S, Ctrl+P)
      if (
        e.key === 'PrintScreen' ||
        e.keyCode === 44 ||
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C', 'S'].includes(e.key.toUpperCase())) ||
        ((e.ctrlKey || e.metaKey) && ['S', 'P'].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault()
        setIsBlurredDueToLossOfFocus(true)
      }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('keydown', handleKeyDown, true)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-4 backdrop-blur-md select-none overflow-y-auto"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-[#140b0f] border border-[#eadfce]/20 p-4 sm:p-5 shadow-2xl text-white my-auto">
        {/* Header with Countdown Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Clock size={15} className="animate-spin" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Protected Ephemeral View
              </p>
              <p className="text-[11px] font-semibold text-emerald-400">
                Self-destructs in: <span className="font-mono text-xs font-bold">{timeLeft}s</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative mt-3.5 aspect-3/4 w-full overflow-hidden rounded-xl bg-black border border-white/10">
          {error ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-xs text-red-400 space-y-2">
              <ShieldAlert size={36} className="text-red-500" />
              <p className="font-bold text-sm text-white">Access Prohibited</p>
              <p className="text-gray-300 max-w-xs">{error}</p>
            </div>
          ) : isLoading || !imageBlobUrl ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-xs text-gray-400 space-y-2">
              <Lock size={32} className="text-[#E8CA91] animate-pulse" />
              <p className="font-semibold text-white">Authorizing Stream...</p>
              <p className="text-[11px] text-gray-400">Generating dynamic forensic watermark</p>
            </div>
          ) : (
            <>
              <SecureWatermarkedCanvas
                imageSrc={imageBlobUrl}
                watermarkData={watermarkInfo || {
                  id: currentViewer?.id,
                  name: currentViewer?.name,
                  phone: currentViewer?.phone
                }}
                className={`h-full w-full transition duration-200 ${
                  isBlurredDueToLossOfFocus ? 'filter blur-2xl grayscale' : ''
                }`}
                onTamperDetected={onClose}
              />

              {isBlurredDueToLossOfFocus && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center">
                  <EyeOff size={40} className="text-amber-400 mb-2 animate-bounce" />
                  <p className="text-sm font-bold text-white">Screen Shield Active</p>
                  <p className="text-xs text-gray-300 mt-1 max-w-xs leading-relaxed">
                    Browser focus was interrupted. Click inside this window to resume your 15-second view.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Forensic Advisory Footer */}
        <div className="mt-3.5 pt-2.5 border-t border-white/10 text-center space-y-1 text-[11px] text-gray-400">
          <p className="flex items-center justify-center gap-1.5 text-gray-300 font-semibold">
            <span>🛡️ Dynamic Forensic Watermark Burned to Screen</span>
          </p>
          <p className="text-[10px] text-gray-500 leading-tight">
            Any phone photo or capture contains your Account ID ({currentViewer?.id || 'MEMBER'}) &amp; mobile timestamp.
          </p>
        </div>
      </div>
    </div>
  )
}
