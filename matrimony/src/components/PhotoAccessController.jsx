import { useState, useMemo } from 'react'
import { Lock, Clock, Eye, ShieldCheck, CheckCircle2 } from 'lucide-react'
import EphemeralPhotoModal from './EphemeralPhotoModal'
import { API_BASE } from '../config/api'

export default function PhotoAccessController({
  targetProfile,
  currentMember,
  className = '',
  onViewRawClick
}) {
  const viewerId = currentMember?.id || 'guest'
  const isSelf = currentMember && targetProfile && currentMember.id === targetProfile.id
  const isAdmin = currentMember && (currentMember.isAdmin || currentMember.role === 'admin')
  const isPublic = targetProfile.photoPrivacy === 'public'

  // Access status: 'none' | 'pending' | 'approved' | 'rejected'
  const initialStatus = useMemo(() => {
    if (isSelf || isAdmin || isPublic) return 'approved'
    const req = targetProfile.photoAccessRequests?.find(
      (r) => r.requesterId === viewerId
    )
    return req ? req.status : 'none'
  }, [targetProfile, viewerId, isSelf, isAdmin, isPublic])

  const [status, setStatus] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState('')

  const handleRequestAccess = async (e) => {
    e.stopPropagation()
    if (!currentMember) {
      alert('Please log in as a member to request photo access.')
      return
    }

    setIsLoading(true)
    setFeedbackMsg('')

    try {
      const token = localStorage.getItem('apremiya_member_token')
      const res = await fetch(`${API_BASE}/photos/request-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetProfileId: targetProfile.id })
      })

      const data = await res.json()
      if (res.ok) {
        setStatus(data.status || 'pending')
        setFeedbackMsg(data.message || 'Request submitted!')
      } else {
        alert(data.error || 'Failed to submit request')
      }
    } catch {
      alert('Could not connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const isUnlocked = isSelf || isAdmin || isPublic || status === 'approved'

  return (
    <div className={`relative overflow-hidden group select-none ${className}`}>
      {/* Photo element: Blurred if not unlocked */}
      <img
        src={targetProfile.photoBlurredPlaceholder || targetProfile.photo}
        alt={targetProfile.name}
        className={`h-full w-full object-cover object-center transition-all duration-300 ${
          isUnlocked ? '' : 'filter blur-xl scale-110'
        }`}
        onContextMenu={(e) => e.preventDefault()}
        style={{ pointerEvents: 'none' }}
      />

      {/* Lock Overlay if photo access is restricted */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-black/45 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white">
          <div className="h-11 w-11 rounded-2xl bg-black/60 border border-white/20 text-[#E8CA91] flex items-center justify-center shadow-lg mb-2">
            <Lock size={20} />
          </div>

          <p className="text-xs font-bold text-white tracking-wide">
            Photo Protected
          </p>
          <p className="text-[11px] text-gray-200 mt-0.5 max-w-[210px] leading-relaxed">
            {targetProfile.name}&apos;s photo requires authorized approval to prevent unauthorized distribution.
          </p>

          <div className="mt-3">
            {status === 'pending' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 text-white text-[11px] font-bold shadow-md">
                <Clock size={13} />
                <span>Request Pending Approval</span>
              </div>
            ) : status === 'rejected' ? (
              <span className="inline-block px-3 py-1 rounded-full bg-red-800/90 text-white text-[11px] font-bold">
                Access Request Declined
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestAccess}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#701C35] hover:bg-[#8B2342] text-white text-xs font-bold shadow-lg transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Lock size={13} />
                <span>{isLoading ? 'Requesting...' : 'Request Photo Access'}</span>
              </button>
            )}
          </div>

          {feedbackMsg && (
            <p className="text-[10px] text-emerald-300 mt-2 font-medium">
              {feedbackMsg}
            </p>
          )}
        </div>
      )}

      {/* Unlocked Trigger: Click to open 15-second secure forensic view */}
      {isUnlocked && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setIsViewerOpen(true)
          }}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black text-[#E8CA91] hover:text-white border border-white/20 text-xs font-semibold backdrop-blur-md shadow-lg transition cursor-pointer active:scale-95 z-20"
          title="Open secure 15-second watermarked viewer"
        >
          <Eye size={13} />
          <span>Secure View</span>
        </button>
      )}

      {/* Ephemeral 15-Second Watermarked Modal */}
      <EphemeralPhotoModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        targetProfile={targetProfile}
        currentViewer={currentMember}
        viewDurationSeconds={15}
      />
    </div>
  )
}
