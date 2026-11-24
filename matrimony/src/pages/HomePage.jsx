import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import TrustSection from '../components/TrustSection'
import CommunitySection from '../components/CommunitySection'
import StoriesSection from '../components/StoriesSection'
import MembershipSection from '../components/MembershipSection'
import FooterSection from '../components/FooterSection'
import RegisterModal from '../components/RegisterModal'
import MemberLoginModal from '../components/MemberLoginModal'
import TermsPolicyDialog from '../components/TermsPolicyDialog'
import { API_BASE } from '../config/api'

export default function HomePage({ onOpenAdmin, onOpenMatches, contact }) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [currentMember, setCurrentMember] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('apremiya_member_user') || 'null')
    } catch {
      return null
    }
  })

  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [lookingFor, setLookingFor] = useState('Woman')
  const [ageFrom, setAgeFrom] = useState('22')
  const [ageTo, setAgeTo] = useState('27')
  const [religion, setReligion] = useState('Select')
  const [motherTongue, setMotherTongue] = useState('Select')

  const [platformStats, setPlatformStats] = useState({
    verifiedProfiles: 100,
    happyConnections: 500,
    registeredMembers: 10,
    trustedExperience: 10
  })

  // Automatically open Member Login if approval email link is clicked (#login or ?login=true)
  useEffect(() => {
    const checkLoginHash = () => {
      if (window.location.hash.startsWith('#login') || window.location.search.includes('login=true')) {
        setIsLoginOpen(true)
      }
    }
    checkLoginHash()
    window.addEventListener('hashchange', checkLoginHash)
    return () => window.removeEventListener('hashchange', checkLoginHash)
  }, [])

  const handleLogoutMember = () => {
    localStorage.removeItem('apremiya_member_user')
    localStorage.removeItem('apremiya_member_token')
    setCurrentMember(null)
  }

  // Fetch live stats from backend and auto-refresh on any update / interval
  useEffect(() => {
    const fetchStats = () => {
      fetch(`${API_BASE}/stats`)
        .then(r => r.json())
        .then(d => {
          if (d.platform) {
            setPlatformStats(prev => {
              if (
                prev.verifiedProfiles !== d.platform.verifiedProfiles ||
                prev.happyConnections !== d.platform.happyConnections ||
                prev.registeredMembers !== d.platform.registeredMembers ||
                prev.trustedExperience !== d.platform.trustedExperience
              ) {
                return d.platform
              }
              return prev
            })
          }
        })
        .catch(() => {})
    }

    fetchStats()
    const interval = setInterval(fetchStats, 3500)
    window.addEventListener('focus', fetchStats)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', fetchStats)
    }
  }, [])

  // Handle Search Submission & Open Registration Form or Matches
  const searchProfiles = (e) => {
    e?.preventDefault?.()
    if (currentMember) {
      onOpenMatches?.(currentMember)
      return
    }
    setIsRegisterOpen(true)
  }

  return (
    <div className="overflow-hidden bg-[#FAF7F1] font-sans text-slate-800">
      {/* 1. Navbar */}
      <Navbar
        onOpenAdmin={onOpenAdmin}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        currentMember={currentMember}
        onLogoutMember={handleLogoutMember}
        onOpenMatches={onOpenMatches}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* 2. Hero Section */}
      <HeroSection
        lookingFor={lookingFor}
        setLookingFor={setLookingFor}
        ageFrom={ageFrom}
        setAgeFrom={setAgeFrom}
        ageTo={ageTo}
        setAgeTo={setAgeTo}
        religion={religion}
        setReligion={setReligion}
        motherTongue={motherTongue}
        setMotherTongue={setMotherTongue}
        mobileSearchOpen={mobileSearchOpen}
        setMobileSearchOpen={setMobileSearchOpen}
        searchProfiles={searchProfiles}
        currentMember={currentMember}
        onOpenMatches={onOpenMatches}
      />

      {/* 3. Trust & Statistics Section */}
      <TrustSection platformStats={platformStats} />

      {/* 5. Matrimony By Community Section */}
      <CommunitySection />

      {/* 6. Success Stories Section */}
      <StoriesSection />

      {/* 7. Membership & Policy Section */}
      <MembershipSection
        onOpenRegister={() => setIsRegisterOpen(true)}
      />

      {/* 8. Footer Section */}
      <FooterSection
        contact={contact}
        onOpenRegister={() => setIsRegisterOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
      />

      {/* 9. Interactive Luxury Registration Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        initialPreferences={{
          lookingFor,
          ageFrom,
          ageTo,
          religion,
          motherTongue
        }}
      />

      {/* 10. Member Login Modal (Opened via Login Button or Email Link) */}
      <MemberLoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false)
          if (window.location.hash.startsWith('#login')) {
            window.location.hash = ''
          }
        }}
        onLoginSuccess={(member) => {
          setCurrentMember(member)
          if (onOpenMatches) {
            onOpenMatches(member)
          } else {
            window.location.hash = '#matches'
          }
        }}
        onRequireChangePassword={({ token, email, member }) => {
          setIsLoginOpen(false)
          window.location.hash = '#change-password'
        }}
        onOpenRegister={() => {
          setIsLoginOpen(false)
          setIsRegisterOpen(true)
        }}
      />

      {/* 11. Terms, Policy & Legal Disclaimer Modal */}
      <TermsPolicyDialog
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  )
}
