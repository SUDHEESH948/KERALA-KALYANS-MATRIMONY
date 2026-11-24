import { useEffect, useRef, useState } from 'react'
import { API_BASE } from '../config/api'

export default function MembershipWarning({ memberId }) {
  const dialogRef = useRef(null)
  const [warning, setWarning] = useState(null)

  useEffect(() => {
    let request
    const checkMembership = async () => {
      const token = localStorage.getItem('apremiya_member_token')
      if (!token) return setWarning(null)

      request?.abort()
      const controller = new AbortController()
      request = controller
      try {
        const response = await fetch(`${API_BASE}/profiles/membership-status`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        })
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) setWarning(null)
          return
        }
        const status = await response.json()
        if (controller.signal.aborted) return
        const key = `apremiya_membership_warning_${memberId}_${status.activatedAt}`
        const profileWarning = status.profileWarning && !sessionStorage.getItem(`${key}_profiles`)
        const expiryWarning = status.expiryWarning && !sessionStorage.getItem(`${key}_expiry`)
        setWarning(profileWarning || expiryWarning ? { ...status, profileWarning, expiryWarning, key } : null)
      } catch {
        // A temporary connection failure can be retried at the next check.
      }
    }

    checkMembership()
    const interval = window.setInterval(checkMembership, 60_000)
    window.addEventListener('focus', checkMembership)
    window.addEventListener('apremiya-profile-opened', checkMembership)
    return () => {
      request?.abort()
      window.clearInterval(interval)
      window.removeEventListener('focus', checkMembership)
      window.removeEventListener('apremiya-profile-opened', checkMembership)
    }
  }, [memberId])

  const hasWarning = Boolean(warning)
  useEffect(() => {
    if (hasWarning) dialogRef.current?.showModal()
  }, [hasWarning])

  if (!warning) return null

  const dismiss = () => {
    if (warning.profileWarning) sessionStorage.setItem(`${warning.key}_profiles`, 'seen')
    if (warning.expiryWarning) sessionStorage.setItem(`${warning.key}_expiry`, 'seen')
    setWarning(null)
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={dismiss}
      aria-labelledby="membership-warning-title"
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[#eadfce] bg-[#FAF7F1] p-6 text-[#293130] shadow-xl backdrop:bg-black/50"
    >
      <h2 id="membership-warning-title" className="font-serif text-2xl font-semibold text-[#701C35]">
        Your membership is nearing its limit
      </h2>
      {warning.profileWarning && (
        <p className="mt-3 text-sm leading-6">
          You can open {warning.profilesRemaining} more distinct {warning.profilesRemaining === 1 ? 'profile' : 'profiles'} before your full profile access ends.
        </p>
      )}
      {warning.expiryWarning && (
        <p className="mt-3 text-sm leading-6">
          Your membership expires {warning.daysRemaining === 1 ? 'within 24 hours' : `in ${warning.daysRemaining} days`}.
        </p>
      )}
      <form method="dialog" className="mt-5 flex justify-end">
        <button className="rounded-full bg-[#701C35] px-5 py-2.5 text-sm font-semibold text-white">
          Got it
        </button>
      </form>
    </dialog>
  )
}
