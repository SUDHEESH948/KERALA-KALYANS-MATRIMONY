import ChangePasswordModal from '../components/ChangePasswordModal'
import { PhoneCall, ArrowLeft } from 'lucide-react'

export default function ChangePasswordPage({ onPasswordChanged }) {
  const currentMember = (() => {
    try {
      return JSON.parse(localStorage.getItem('apremiya_member_user') || 'null')
    } catch {
      return null
    }
  })()

  const token = localStorage.getItem('apremiya_member_token')

  const handleClose = () => {
    localStorage.removeItem('apremiya_member_user')
    localStorage.removeItem('apremiya_member_token')
    window.location.hash = ''
    window.location.pathname = '/'
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#FAF7F1] flex flex-col items-center justify-center p-4 relative">
      {/* Top Header Bar with Calling Button and Back Button */}
      <div className="fixed top-3 left-3 right-3 sm:top-5 sm:left-6 sm:right-6 max-w-2xl mx-auto z-40 flex items-center justify-between">
        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur shadow-md border border-[#eadfce] text-gray-700 hover:text-[#701C35] text-xs font-semibold cursor-pointer transition hover:scale-105"
        >
          <ArrowLeft size={15} />
          <span>Back to Home</span>
        </button>

        <a
          href="tel:+918075588406"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md text-xs font-semibold cursor-pointer transition hover:scale-105"
        >
          <PhoneCall size={14} />
          <span>Call: (+91) 80755 88406</span>
        </a>
      </div>

      <ChangePasswordModal
        isOpen={true}
        userEmail={currentMember?.email}
        token={token}
        onClose={handleClose}
        onPasswordChanged={(member, fullToken) => {
          if (onPasswordChanged) {
            onPasswordChanged(member, fullToken)
          } else {
            window.location.hash = ''
            window.location.reload()
          }
        }}
        isMandatory={true}
      />
    </div>
  )
}
