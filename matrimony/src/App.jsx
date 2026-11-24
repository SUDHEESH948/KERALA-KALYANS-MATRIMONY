import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import MemberMatchesPage from './pages/MemberMatchesPage'
import ProfileDetailsPage from './pages/ProfileDetailsPage'
import { NotificationProvider } from './context/NotificationContext'
import NotificationCenterModal from './components/NotificationCenterModal'
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton'
import MembershipWarning from './components/MembershipWarning'
import { defaultContact, requestContact } from './config/contact'

export default function App() {
  const [currentMember, setCurrentMember] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('apremiya_member_user') || 'null')
    } catch {
      return null
    }
  })

  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.hash === '#admin' || window.location.pathname === '/admin'
  })
  const [contact, setContact] = useState(defaultContact)

  useEffect(() => {
    if (isAdminView) return
    const request = new AbortController()
    requestContact({ signal: request.signal }).then(setContact).catch(() => {})
    return () => request.abort()
  }, [isAdminView])

  const [isChangePasswordView, setIsChangePasswordView] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('apremiya_member_user') || 'null')
      if (savedUser && savedUser.mustChangePassword) return true
    } catch {}
    return window.location.hash === '#change-password' || window.location.pathname === '/change-password'
  })

  const [isMatchesView, setIsMatchesView] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('apremiya_member_user') || 'null')
      if (savedUser && !savedUser.mustChangePassword) {
        if (window.location.hash !== '#home' && window.location.hash !== '#admin' && !window.location.hash.startsWith('#profile/')) {
          return true
        }
      }
    } catch {}
    return window.location.hash === '#matches'
  })

  const [viewingProfileId, setViewingProfileId] = useState(() => {
    const hash = window.location.hash
    if (hash.startsWith('#profile/')) return hash.replace('#profile/', '')
    return null
  })

  // Listen to browser hash and route navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash
      const path = window.location.pathname

      // Refresh current member from storage
      let savedUser = null
      try {
        savedUser = JSON.parse(localStorage.getItem('apremiya_member_user') || 'null')
        if (savedUser) setCurrentMember(savedUser)
      } catch {}

      // If user must change password, strictly block access to other views
      if (savedUser && savedUser.mustChangePassword) {
        setViewingProfileId(null)
        setIsChangePasswordView(true)
        setIsAdminView(false)
        setIsMatchesView(false)
        return
      }

      if (hash.startsWith('#profile/')) {
        setViewingProfileId(hash.replace('#profile/', ''))
        setIsMatchesView(false)
        setIsAdminView(false)
        setIsChangePasswordView(false)
      } else if (hash === '#change-password' || path === '/change-password') {
        setViewingProfileId(null)
        setIsChangePasswordView(true)
        setIsAdminView(false)
        setIsMatchesView(false)
      } else if (hash === '#admin' || path === '/admin') {
        setViewingProfileId(null)
        setIsAdminView(true)
        setIsMatchesView(false)
        setIsChangePasswordView(false)
      } else if (hash === '#matches') {
        setViewingProfileId(null)
        setIsMatchesView(true)
        setIsAdminView(false)
        setIsChangePasswordView(false)
      } else if (hash === '#home') {
        setViewingProfileId(null)
        setIsMatchesView(false)
        setIsChangePasswordView(false)
        setIsAdminView(false)
      } else {
        setViewingProfileId(null)
        // If logged-in member accesses root URL, take them straight to matches
        if (savedUser && !savedUser.mustChangePassword) {
          setIsMatchesView(true)
        } else {
          setIsMatchesView(false)
        }
        setIsChangePasswordView(false)
        setIsAdminView(false)
      }
    }

    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const openAdmin = () => {
    setViewingProfileId(null)
    setIsAdminView(true)
    setIsMatchesView(false)
    window.location.hash = '#admin'
  }

  const exitAdmin = () => {
    setViewingProfileId(null)
    setIsAdminView(false)
    window.location.hash = ''
  }

  const openMatches = (member) => {
    if (member) setCurrentMember(member)
    setViewingProfileId(null)
    setIsMatchesView(true)
    window.location.hash = '#matches'
  }

  const navigateHome = () => {
    setViewingProfileId(null)
    setIsMatchesView(false)
    window.location.hash = '#home'
  }

  const handleLogoutMember = () => {
    localStorage.removeItem('apremiya_member_user')
    localStorage.removeItem('apremiya_member_token')
    setCurrentMember(null)
    setViewingProfileId(null)
    setIsMatchesView(false)
    window.location.hash = ''
  }

  const handlePasswordChangedSuccess = (member) => {
    setIsChangePasswordView(false)
    if (member) setCurrentMember(member)
    setViewingProfileId(null)
    setIsMatchesView(true)
    window.location.hash = '#matches'
  }

  return (
    <NotificationProvider>
      <div className="relative min-w-[320px] overflow-x-hidden">
        {viewingProfileId ? (
          <ProfileDetailsPage
            profileId={viewingProfileId}
            currentMember={currentMember}
            onBack={() => {
              if (window.history.length > 1) {
                window.history.back()
              } else {
                window.location.hash = currentMember ? '#matches' : '#admin'
              }
            }}
          />
        ) : isChangePasswordView ? (
          <ChangePasswordPage onPasswordChanged={handlePasswordChangedSuccess} />
        ) : isAdminView ? (
          <AdminPage onExit={exitAdmin} />
        ) : isMatchesView && currentMember ? (
          <MemberMatchesPage
            currentMember={currentMember}
            onLogout={handleLogoutMember}
            onNavigateHome={navigateHome}
          />
        ) : (
          <HomePage
            contact={contact}
            onOpenAdmin={openAdmin}
            onOpenMatches={openMatches}
            currentMember={currentMember}
            onLogoutMember={handleLogoutMember}
          />
        )}
        {/* Global Common Notification Pop-up Stack & Center Drawer */}
        <NotificationCenterModal onNavigateAdmin={openAdmin} />
        {currentMember && !currentMember.mustChangePassword && !isAdminView && !isChangePasswordView && (
          <MembershipWarning key={currentMember.id} memberId={currentMember.id} />
        )}
        {/* Floating WhatsApp Contact Button (Hidden on Admin Page) */}
        {!isAdminView && <FloatingWhatsAppButton number={contact.whatsapp} />}
      </div>
    </NotificationProvider>
  )
}
