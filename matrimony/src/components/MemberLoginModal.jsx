import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, Clock, ShieldX } from 'lucide-react'
import { API_BASE } from '../config/api'

export default function MemberLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenRegister,
  onRequireChangePassword
}) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isPendingApproval, setIsPendingApproval] = useState(false)
  const [isRejected, setIsRejected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Listen to URL hash or params e.g. #login?email=user@test.com
  useEffect(() => {
    if (isOpen) {
      const hash = window.location.hash
      const search = window.location.search
      let emailParam = ''
      if (hash.includes('email=')) {
        emailParam = hash.split('email=')[1]?.split('&')[0]
      } else if (search.includes('email=')) {
        const params = new URLSearchParams(search)
        emailParam = params.get('email') || ''
      }
      if (emailParam) {
        setIdentifier(decodeURIComponent(emailParam))
      }
      setErrorMessage('')
      setIsPendingApproval(false)
      setIsRejected(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setIsPendingApproval(false)
    setIsRejected(false)
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE}/auth/member-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identifier.trim(),
          password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.isPendingApproval) {
          setIsPendingApproval(true)
          setErrorMessage(
            data.error || 'Your registration has been submitted successfully. Please wait for admin approval.'
          )
        } else if (data.isRejected) {
          setIsRejected(true)
          setErrorMessage(
            data.error || 'Your account application was not approved by the administrator.'
          )
        } else {
          setErrorMessage(data.error || 'Login failed. Please verify your registered email and password.')
        }
        return
      }

      // Check for Mandatory Change Password workflow
      if (data.mustChangePassword) {
        localStorage.setItem('apremiya_member_token', data.token)
        localStorage.setItem('apremiya_member_user', JSON.stringify(data.member))

        if (onRequireChangePassword) {
          onRequireChangePassword({
            token: data.token,
            email: identifier.trim(),
            member: data.member
          })
        } else {
          window.location.hash = '#change-password'
        }
        onClose()
        return
      }

      // Standard Login Successful
      if (data.success && data.member) {
        localStorage.setItem('apremiya_member_token', data.token)
        localStorage.setItem('apremiya_member_user', JSON.stringify(data.member))
        if (onLoginSuccess) {
          onLoginSuccess(data.member)
        }
        onClose()
      }
    } catch {
      setErrorMessage('Unable to connect to the server. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-[#eadfce] overflow-hidden my-4 font-montserrat"
        >
          {/* Header Banner */}
          <div className="bg-[#701C35] px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-white/20 flex-shrink-0">
                <Heart size={18} fill="white" />
              </div>
              <div className="min-w-0">
                <h3 className="serif text-xl font-bold leading-tight truncate">
                  Member Login
                </h3>
                <p className="text-[10px] text-[#E8CA91] font-semibold tracking-wide truncate">
                  ACCESS YOUR VERIFIED ACCOUNT
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer flex-shrink-0"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-5 sm:p-6">
            {/* Pending Approval Notice Banner */}
            {isPendingApproval ? (
              <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 space-y-2">
                <div className="flex items-start gap-2 font-bold text-amber-800">
                  <Clock size={18} className="flex-shrink-0 text-amber-600 mt-0.5" />
                  <span>Awaiting Admin Approval</span>
                </div>
                <p className="leading-relaxed">
                  Your registration has been submitted successfully. Please wait for admin approval before logging in.
                </p>
                <p className="text-[11px] text-amber-700/90 pt-1 border-t border-amber-200">
                  Once approved by our administrator, an approval confirmation with your temporary password will be sent to your registered email address.
                </p>
              </div>
            ) : isRejected ? (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-red-800">
                  <ShieldX size={18} className="flex-shrink-0 text-red-600" />
                  <span>Application Status: Declined</span>
                </div>
                <p className="leading-relaxed">
                  Your registration did not meet our verification criteria at this time. Please contact support@apremiya.com for further guidance.
                </p>
              </div>
            ) : errorMessage ? (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. user@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#701C35] focus:ring-1 focus:ring-[#701C35] text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-gray-700 font-semibold">
                    Account Password *
                  </label>
                  <span className="text-[10px] text-gray-400">
                    Use temporary password from approval email
                  </span>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your temporary or private password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#701C35] focus:ring-1 focus:ring-[#701C35] text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !identifier || !password}
                className="w-full mt-2 py-3 rounded-xl bg-[#701C35] hover:bg-[#511327] text-white font-semibold text-xs sm:text-sm transition shadow-lg shadow-[#701C35]/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Account'}</span>
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 text-center sm:text-left">
              <span>Don't have an account yet?</span>
              <button
                onClick={() => {
                  onClose()
                  if (onOpenRegister) onOpenRegister()
                }}
                className="text-[#701C35] font-semibold hover:underline cursor-pointer"
              >
                Register on Apremiya
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
