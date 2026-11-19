import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle, ShieldAlert } from 'lucide-react'
import { API_BASE } from '../config/api'

export default function ChangePasswordModal({
  isOpen,
  userEmail,
  token,
  onPasswordChanged,
  isMandatory = true
}) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Password Strength Checklist
  const rules = useMemo(() => [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(newPassword) },
    { label: 'At least one lowercase letter (a-z)', met: /[a-z]/.test(newPassword) },
    { label: 'At least one number (0-9)', met: /[0-9]/.test(newPassword) },
    { label: 'At least one special symbol (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
    { label: 'Passwords match', met: newPassword.length > 0 && newPassword === confirmPassword }
  ], [newPassword, confirmPassword])

  const allRulesMet = rules.every(r => r.met)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!currentPassword) {
      setErrorMessage('Please enter the temporary password sent to your email.')
      return
    }

    if (!allRulesMet) {
      setErrorMessage('Please ensure your new password satisfies all security requirements.')
      return
    }

    setIsLoading(true)

    try {
      const activeToken = token || localStorage.getItem('apremiya_member_token')
      const headers = { 'Content-Type': 'application/json' }
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`
      }

      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
          email: userEmail || undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password. Please check your current password.')
      }

      // Success! Update local storage with unrestricted token & profile
      if (data.token) {
        localStorage.setItem('apremiya_member_token', data.token)
      }
      if (data.member) {
        localStorage.setItem('apremiya_member_user', JSON.stringify(data.member))
      }

      setSuccessMessage('Password changed successfully! Unlocking your dashboard...')

      setTimeout(() => {
        if (onPasswordChanged) {
          onPasswordChanged(data.member, data.token)
        }
      }, 1200)
    } catch (err) {
      setErrorMessage(err.message || 'Error changing password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-[#eadfce] overflow-hidden my-4"
        >
          {/* Header Banner */}
          <div className="bg-[#701C35] px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-[#E8CA91]">
                <KeyRound size={22} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl leading-tight">
                  Mandatory Password Change
                </h3>
                <p className="text-[11px] text-[#E8CA91] font-semibold tracking-wider uppercase">
                  FIRST-TIME LOGIN SECURITY REQUIRED
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {/* Mandatory Alert Notice */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <ShieldAlert size={18} className="text-amber-600 flex-shrink-0" />
                <span>Account Protection Requirement</span>
              </div>
              <p className="leading-relaxed">
                You signed in using a single-use temporary password. To protect your matrimonial profile, you must set a permanent private password before accessing the member dashboard.
              </p>
              {userEmail && (
                <p className="text-[11px] text-amber-800 pt-1 border-t border-amber-200">
                  Account: <b>{userEmail}</b>
                </p>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 flex items-start gap-2 font-semibold">
                <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Current / Temporary Password */}
              <div>
                <label className="block text-gray-700 mb-1">
                  Temporary / Current Password *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter the temporary password from your email"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#701C35] focus:ring-1 focus:ring-[#701C35] text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-gray-700 mb-1">
                  New Private Password *
                </label>
                <div className="relative">
                  <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a strong new password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#701C35] focus:ring-1 focus:ring-[#701C35] text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-gray-700 mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#701C35] focus:ring-1 focus:ring-[#701C35] text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Password Strength Checklist */}
              <div className="rounded-xl bg-[#FAF7F1] border border-[#eadfce] p-3.5 space-y-2">
                <p className="text-[11px] font-bold text-[#701C35] uppercase tracking-wider">
                  Password Strength Requirements
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  {rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      {rule.met ? (
                        <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                      ) : (
                        <XCircle size={13} className="text-gray-300 flex-shrink-0" />
                      )}
                      <span className={rule.met ? 'text-emerald-800 font-medium' : 'text-gray-500'}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || !allRulesMet || !currentPassword}
                className="w-full mt-2 py-3.5 rounded-xl bg-[#701C35] hover:bg-[#511327] text-white font-semibold text-xs sm:text-sm transition shadow-lg shadow-[#701C35]/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Lock size={15} />
                <span>{isLoading ? 'Updating Security Credentials...' : 'Save New Password & Continue'}</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
