import ChangePasswordModal from '../components/ChangePasswordModal'

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
    <div className="min-h-screen bg-[#FAF7F1] flex items-center justify-center p-4">
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
