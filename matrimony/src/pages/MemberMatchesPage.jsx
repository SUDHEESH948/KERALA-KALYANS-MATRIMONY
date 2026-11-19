import { useState, useEffect, useMemo } from 'react'
import {
  Heart,
  ShieldCheck,
  Search,
  Filter,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  User,
  Star,
  Check,
  LogOut,
  Home,
  SlidersHorizontal,
  Sparkles,
  X,
  ChevronDown,
  Eye,
  Send,
  MessageCircle
} from 'lucide-react'
import { API_BASE } from '../config/api'

export default function MemberMatchesPage({ currentMember, onLogout, onNavigateHome, onViewProfile }) {
  const [profiles, setProfiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [strictSameReligion, setStrictSameReligion] = useState(true)
  const [strictSameCaste, setStrictSameCaste] = useState(false)
  const [selectedCaste, setSelectedCaste] = useState('all')
  const [selectedMarriageType, setSelectedMarriageType] = useState('all')
  const [minAge, setMinAge] = useState(18)
  const [maxAge, setMaxAge] = useState(40)

  // Interactive user actions
  const [interestsSent, setInterestsSent] = useState(() => {
    try {
      const saved = localStorage.getItem(`apremiya_interests_${currentMember?.id}`)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [shortlisted, setShortlisted] = useState(() => {
    try {
      const saved = localStorage.getItem(`apremiya_shortlist_${currentMember?.id}`)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [viewingProfile, setViewingProfile] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Determine user's gender and the opposite gender to match
  const memberGender = (currentMember?.gender || 'Groom').toLowerCase()
  const isMemberMale = memberGender === 'groom' || memberGender === 'man' || memberGender === 'male'
  const targetGender = isMemberMale ? 'Bride' : 'Groom'
  const targetGenderLabel = isMemberMale ? 'Brides (Women)' : 'Grooms (Men)'

  const memberReligion = currentMember?.religion || 'Hindu'
  const memberCaste = (currentMember?.caste || '').trim()

  // Fetch approved active profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`${API_BASE}/profiles?status=approved`)
        if (res.ok) {
          const data = await res.json()
          setProfiles(Array.isArray(data) ? data : [])
        } else {
          setError('Failed to fetch matched profiles')
        }
      } catch {
        setError('Network error connecting to profiles service')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfiles()
  }, [])

  // Core Filtering Algorithm:
  // 1. OPPOSITE GENDER (Female -> Male, Male -> Female)
  // 2. SAME RELIGION (Strict by default as requested)
  // 3. SAME CATEGORY / CASTE (Strict option or selected filter)
  // 4. Exclude self
  const matchedProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // 1. Exclude logged in user's own profile
      if (p.id === currentMember?.id || (currentMember?.email && p.email === currentMember.email)) {
        return false
      }

      // 2. OPPOSITE GENDER MATCHING
      const pGender = (p.gender || '').toLowerCase()
      const isTargetMale = !isMemberMale
      const matchesTargetGender = isTargetMale
        ? (pGender === 'groom' || pGender === 'man' || pGender === 'male')
        : (pGender === 'bride' || pGender === 'woman' || pGender === 'female')

      if (!matchesTargetGender) return false

      // 3. SAME RELIGION MATCHING
      if (strictSameReligion) {
        const pReligion = (p.religion || '').trim().toLowerCase()
        const mReligion = memberReligion.trim().toLowerCase()
        if (pReligion !== mReligion) {
          return false
        }
      }

      // 4. SAME CASTE / CATEGORY MATCHING
      if (strictSameCaste && memberCaste) {
        const pCaste = (p.caste || '').trim().toLowerCase()
        const mCaste = memberCaste.toLowerCase()
        if (pCaste !== mCaste) {
          return false
        }
      } else if (selectedCaste !== 'all') {
        const pCaste = (p.caste || '').trim().toLowerCase()
        const sCaste = selectedCaste.trim().toLowerCase()
        if (pCaste !== sCaste) {
          return false
        }
      }

      // 5. Marriage Type filter
      if (selectedMarriageType !== 'all') {
        const pType = (p.marriageType || p.maritalStatus || 'Never Married').toLowerCase()
        if (pType !== selectedMarriageType.toLowerCase()) {
          return false
        }
      }

      // 6. Search Query matching
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const matchesQ =
          p.name?.toLowerCase().includes(q) ||
          p.caste?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.profession?.toLowerCase().includes(q) ||
          p.education?.toLowerCase().includes(q)
        if (!matchesQ) return false
      }

      // 6. Age range filter
      if (p.age && (p.age < minAge || p.age > maxAge)) {
        return false
      }

      return true
    })
  }, [profiles, isMemberMale, memberReligion, strictSameReligion, memberCaste, strictSameCaste, selectedCaste, selectedMarriageType, searchQuery, minAge, maxAge, currentMember])

  // Extract unique castes available among matched religion profiles for filter dropdown
  const availableCastes = useMemo(() => {
    const map = new Map()
    profiles.forEach((p) => {
      // When strict same religion is active, only show castes of that religion!
      if (strictSameReligion) {
        const pRel = (p.religion || '').trim().toLowerCase()
        const mRel = memberReligion.trim().toLowerCase()
        if (pRel !== mRel) return
      }

      if (p.caste && p.caste.trim()) {
        const raw = p.caste.trim()
        const lower = raw.toLowerCase()
        if (!map.has(lower)) {
          // Normalize formatting: 'obc' -> 'OBC', otherwise Capitalized
          const display = lower === 'obc' ? 'OBC' : raw.charAt(0).toUpperCase() + raw.slice(1)
          map.set(lower, display)
        }
      }
    })

    // Also guarantee current member's caste is present
    if (memberCaste) {
      const lower = memberCaste.toLowerCase()
      if (!map.has(lower)) {
        const display = lower === 'obc' ? 'OBC' : memberCaste.charAt(0).toUpperCase() + memberCaste.slice(1)
        map.set(lower, display)
      }
    }

    return Array.from(map.values()).sort()
  }, [profiles, strictSameReligion, memberReligion, memberCaste])

  // Send Interest handler
  const handleSendInterest = (p) => {
    const isAlreadySent = interestsSent.includes(p.id)
    let updated
    if (isAlreadySent) {
      updated = interestsSent.filter((id) => id !== p.id)
      showToast(`Interest removed for ${p.name}`)
    } else {
      updated = [...interestsSent, p.id]
      showToast(`💖 Expressed interest in ${p.name}! Notification sent.`)
    }
    setInterestsSent(updated)
    localStorage.setItem(`apremiya_interests_${currentMember?.id}`, JSON.stringify(updated))
  }

  // Shortlist handler
  const handleToggleShortlist = (p) => {
    const isAlready = shortlisted.includes(p.id)
    let updated
    if (isAlready) {
      updated = shortlisted.filter((id) => id !== p.id)
      showToast(`Removed ${p.name} from your shortlist`)
    } else {
      updated = [...shortlisted, p.id]
      showToast(`⭐ Added ${p.name} to your shortlist!`)
    }
    setShortlisted(updated)
    localStorage.setItem(`apremiya_shortlist_${currentMember?.id}`, JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-gray-800 flex flex-col selection:bg-[#701C35] selection:text-white">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#FAF7F1]/95 backdrop-blur-md border-b border-[#eadfce] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <img
                src="/kerala-kalyan-logo.png"
                alt="Kerala Kalyans Matrimony"
                className="h-10 sm:h-12 w-auto object-contain mix-blend-multiply group-hover:scale-105 transition"
              />
              <div className="hidden sm:block">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-[#701C35] block leading-tight">
                  Kerala Kalyans
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[2px] font-semibold text-[#B28D53] uppercase block">
                  Matrimony
                </span>
              </div>
            </button>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/70 border border-[#eadfce] p-1 rounded-full text-xs font-semibold text-gray-600">
            <button
              onClick={onNavigateHome}
              className="px-4 py-1.5 rounded-full hover:text-[#701C35] hover:bg-white transition cursor-pointer flex items-center gap-1.5"
            >
              <Home size={14} />
              <span>Home</span>
            </button>
            <div className="px-4 py-1.5 rounded-full bg-[#701C35] text-white shadow-xs flex items-center gap-1.5 cursor-default">
              <Sparkles size={14} />
              <span>My Matches ({matchedProfiles.length})</span>
            </div>
          </nav>

          {/* Logged in Member Profile & View My Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                if (currentMember?.id) {
                  window.location.hash = `#profile/${currentMember.id}`
                }
              }}
              className="flex items-center gap-2.5 bg-white hover:bg-[#FAF7F1] pl-2 pr-3.5 py-1.5 rounded-full border border-[#eadfce] hover:border-[#701C35]/50 shadow-xs cursor-pointer transition text-left group"
              title="Click to view your own complete profile"
            >
              <img
                src={
                  currentMember?.photo ||
                  (isMemberMale
                    ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'
                    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200')
                }
                alt={currentMember?.name || 'Member'}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-[#701C35]/30 group-hover:scale-105 transition"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-gray-900 leading-tight max-w-[120px] truncate group-hover:text-[#701C35]">
                  {currentMember?.name || 'Member'}
                </div>
                <div className="text-[10px] font-semibold text-[#701C35] flex items-center gap-1">
                  <Eye size={10} />
                  <span>View My Profile</span>
                </div>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-full sm:rounded-lg border border-[#eadfce] bg-white text-gray-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50/50 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Sign Out"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MATCH CRITERIA HERO BANNER */}
      <section className="bg-gradient-to-r from-[#701C35] via-[#5C1429] to-[#3E0A1A] text-white py-8 sm:py-10 px-4 sm:px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold text-[#E8CA91]">
              <Sparkles size={13} />
              <span>AUTOMATIC COMPATIBILITY FILTER</span>
            </div>
            <h1 className="text-2xl sm:text-4xl tracking-tight text-white leading-tight">
              Curated Matches for {currentMember?.name || 'You'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 max-w-2xl leading-relaxed">
              Listing verified <b>{targetGenderLabel}</b> matching your religion:{' '}
              <span className="text-[#E8CA91] font-bold underline decoration-[#E8CA91]/50 underline-offset-4">
                {memberReligion}
              </span>
              . Connect with genuine matrimonial profiles seeking life partners.
            </p>
          </div>

          {/* Quick Context Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center gap-4 flex-shrink-0 self-start md:self-auto">
            <div className="h-12 w-12 rounded-xl bg-[#E8CA91] text-[#701C35] flex items-center justify-center font-bold text-lg shadow-inner">
              {matchedProfiles.length}
            </div>
            <div className="text-left">
              <span className="text-xs text-white/80 block uppercase tracking-wider font-semibold">
                Available Matches
              </span>
              <span className="text-base sm:text-lg font-bold text-white block">
                {targetGender}s in {memberReligion}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full space-y-6">
        {/* FILTER & SEARCH TOOLBAR */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#eadfce] shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search matches by name, caste, job, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#701C35] focus:ring-1 focus:ring-[#701C35] transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Same Religion & Same Category Toggles & Quick Filters */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              {/* Strict Religion Toggle Button */}
              <button
                type="button"
                onClick={() => setStrictSameReligion(!strictSameReligion)}
                className={`px-3.5 py-2.5 rounded-xl border font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  strictSameReligion
                    ? 'bg-[#701C35] text-white border-[#701C35]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-[#FAF7F1]'
                }`}
                title="Toggle between Same Religion and All Religions"
              >
                <Check size={14} className={strictSameReligion ? 'opacity-100' : 'opacity-0'} />
                <span>Same Religion ({memberReligion})</span>
              </button>

              {/* Strict Same Category / Caste Toggle Button */}
              {memberCaste && (
                <button
                  type="button"
                  onClick={() => {
                    const next = !strictSameCaste
                    setStrictSameCaste(next)
                    if (next) setSelectedCaste('all')
                  }}
                  className={`px-3.5 py-2.5 rounded-xl border font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                    strictSameCaste
                      ? 'bg-[#701C35] text-white border-[#701C35]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-[#FAF7F1]'
                  }`}
                  title={`Filter profiles strictly for your category (${memberCaste.toUpperCase()})`}
                >
                  <Check size={14} className={strictSameCaste ? 'opacity-100' : 'opacity-0'} />
                  <span>Same Category ({memberCaste.toUpperCase()})</span>
                </button>
              )}

              {/* Caste Filter Dropdown (Filtered to religion & deduplicated) */}
              {availableCastes.length > 0 && (
                <div className="relative">
                  <select
                    value={strictSameCaste ? (availableCastes.find(c => c.toLowerCase() === memberCaste.toLowerCase()) || 'all') : selectedCaste}
                    onChange={(e) => {
                      const val = e.target.value
                      setSelectedCaste(val)
                      if (val === 'all') {
                        setStrictSameCaste(false)
                      } else if (memberCaste && val.toLowerCase() === memberCaste.toLowerCase()) {
                        setStrictSameCaste(true)
                      } else {
                        setStrictSameCaste(false)
                      }
                    }}
                    className="appearance-none bg-white border border-gray-200 px-3.5 py-2.5 pr-8 rounded-xl font-medium text-gray-700 focus:outline-none focus:border-[#701C35] text-xs cursor-pointer shadow-xs"
                  >
                    <option value="all">All {strictSameReligion ? `${memberReligion} ` : ''}Castes</option>
                    {availableCastes.map((c) => {
                      const isMyCategory = memberCaste && c.toLowerCase() === memberCaste.toLowerCase()
                      return (
                        <option key={c} value={c}>
                          {c} {isMyCategory ? '★ (Same Category)' : ''}
                        </option>
                      )
                    })}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              )}

              {/* Marriage Type Filter Dropdown */}
              <div className="relative">
                <select
                  value={selectedMarriageType}
                  onChange={(e) => setSelectedMarriageType(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 px-3.5 py-2.5 pr-8 rounded-xl font-medium text-gray-700 focus:outline-none focus:border-[#701C35] text-xs cursor-pointer shadow-xs"
                >
                  <option value="all">All Marriage Types</option>
                  <option value="Never Married">Never Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Awaiting Divorce">Awaiting Divorce</option>
                  <option value="Separated">Separated</option>
                  <option value="Second Marriage">Second Marriage</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {/* Clear all filters */}
              {(searchQuery || !strictSameReligion || strictSameCaste || selectedCaste !== 'all' || selectedMarriageType !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setStrictSameReligion(true)
                    setStrictSameCaste(false)
                    setSelectedCaste('all')
                    setSelectedMarriageType('all')
                  }}
                  className="px-3 py-2 text-xs font-semibold text-[#701C35] hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Pills Bar */}
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100 flex-wrap">
            <span className="font-semibold text-gray-400 text-[11px] uppercase tracking-wider">Active Filters:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
              Looking for: {targetGenderLabel}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
              Religion: {strictSameReligion ? `${memberReligion} Only` : 'All Religions'}
            </span>
            {strictSameCaste && memberCaste ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold">
                Category: {memberCaste.toUpperCase()} Only
              </span>
            ) : selectedCaste !== 'all' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold">
                Caste: {selectedCaste}
              </span>
            ) : null}
            {selectedMarriageType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-semibold">
                Status: {selectedMarriageType}
              </span>
            )}
            <span className="text-gray-400 text-[11px] ml-auto">
              Found <b>{matchedProfiles.length}</b> verified matches
            </span>
          </div>
        </div>

        {/* 4. PROFILES GRID OR LOADING / EMPTY STATE */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#701C35] border-t-transparent mb-4" />
            <p className="text-sm font-semibold text-gray-600">Finding your perfect {memberReligion} matches...</p>
          </div>
        ) : matchedProfiles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#eadfce] p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Heart size={30} />
            </div>
            <h3 className="text-xl text-gray-900">
              No Matches Found Under Current Filters
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We couldn't find any other verified <b>{targetGender}s</b> in <b>{memberReligion}</b> matching your search criteria.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCaste('all')
                  setStrictSameReligion(false)
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#701C35] hover:bg-[#8B2342] text-white text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                Expand Search to All Religions
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {matchedProfiles.map((p) => {
              const isInterestSent = interestsSent.includes(p.id)
              const isSaved = shortlisted.includes(p.id)

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-[#eadfce] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Photo Container */}
                  <div
                    onClick={() => {
                      if (onViewProfile) onViewProfile(p.id)
                      else window.location.hash = `#profile/${p.id}`
                    }}
                    className="relative h-64 sm:h-72 w-full overflow-hidden bg-gray-100 cursor-pointer"
                    title="Click to view full separate profile page"
                  >
                    <img
                      src={p.photo}
                      alt={p.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                    {/* Hover "View Profile" Pill Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <span className="px-4 py-2 rounded-full bg-white/95 backdrop-blur-md text-[#701C35] font-bold text-xs shadow-xl flex items-center gap-1.5 border border-[#eadfce] transform group-hover:scale-105 transition-transform">
                        <Eye size={15} />
                        <span>View Profile</span>
                      </span>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white tracking-wide border border-white/20">
                          {p.gender}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-[#701C35] shadow-xs border border-[#eadfce]">
                          {p.marriageType || p.maritalStatus || 'Never Married'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleShortlist(p)
                        }}
                        className={`p-2 rounded-full backdrop-blur-md transition cursor-pointer pointer-events-auto ${
                          isSaved
                            ? 'bg-amber-400 text-white shadow-md'
                            : 'bg-black/40 text-white hover:bg-black/60'
                        }`}
                        title={isSaved ? 'Shortlisted' : 'Shortlist Profile'}
                      >
                        <Star size={14} fill={isSaved ? 'white' : 'none'} />
                      </button>
                    </div>

                    {/* Bottom overlay inside photo */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-1.5">
                        <h3 className="card-title text-lg sm:text-xl drop-shadow truncate">
                          {p.name}
                        </h3>
                        {(p.isApproved || p.verified) && (
                          <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0 drop-shadow" title="Verified Member" />
                        )}
                      </div>
                      <p className="text-xs text-amber-200 font-medium drop-shadow mt-0.5">
                        {p.age} yrs · {p.height}
                      </p>
                    </div>
                  </div>

                  {/* Profile Details Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5 text-xs">
                    <div className="space-y-2.5">
                      {/* Community / Religion & Caste & Marriage Type */}
                      <div className="flex items-center gap-1.5 flex-wrap text-gray-700">
                        <span className="font-bold text-[#701C35] bg-[#FAF7F1] px-2 py-0.5 rounded border border-[#eadfce]">
                          {p.religion}
                        </span>
                        <span className="text-gray-600 truncate">
                          {p.caste ? `${p.caste}` : p.motherTongue}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-500 font-medium">
                          {p.marriageType || p.maritalStatus || 'Never Married'}
                        </span>
                      </div>

                      {/* Profession */}
                      <div className="flex items-start gap-2 text-gray-700">
                        <Briefcase size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="font-semibold text-gray-900 truncate">{p.profession}</span>
                      </div>

                      {/* Education */}
                      <div className="flex items-start gap-2 text-gray-600">
                        <GraduationCap size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="truncate">{p.education}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="truncate">{p.location}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-[#eadfce] grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onViewProfile) onViewProfile(p.id)
                          else window.location.hash = `#profile/${p.id}`
                        }}
                        className="w-full py-2.5 px-2 rounded-xl border border-[#701C35] bg-white hover:bg-[#701C35] text-[#701C35] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                        title="View Full Profile Details"
                      >
                        <Eye size={14} />
                        <span>View Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendInterest(p)}
                        className={`w-full py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition duration-200 cursor-pointer shadow-xs active:scale-95 ${
                          isInterestSent
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#701C35] hover:bg-[#5C1429] text-white'
                        }`}
                      >
                        <Heart size={14} fill={isInterestSent ? 'white' : 'none'} />
                        <span>{isInterestSent ? 'Connected' : 'Connect'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* 5. VIEW FULL PROFILE MODAL */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-[#eadfce] profile-view-modal my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Image Cover */}
            <div className="relative h-48 sm:h-56 bg-gray-900 overflow-hidden">
              <img
                src={viewingProfile.photo}
                alt={viewingProfile.name}
                className="h-full w-full object-cover object-center filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <button
                type="button"
                onClick={() => setViewingProfile(null)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl">{viewingProfile.name}</h3>
                  <ShieldCheck size={18} className="text-emerald-400" />
                </div>
                <p className="text-xs text-amber-200 font-medium">
                  {viewingProfile.age} yrs · {viewingProfile.height} · {viewingProfile.location}
                </p>
              </div>
            </div>

            {/* Profile Detail Fields */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              {/* Community & Religion Box */}
              <div className="bg-[#FAF7F1] p-4 rounded-xl border border-[#eadfce] space-y-2">
                <h4 className="font-bold text-sm text-[#701C35] border-b border-[#eadfce] pb-1.5">
                  Religious & Social Background
                </h4>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Religion:</span>
                    <span className="font-bold text-gray-900">{viewingProfile.religion}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Caste / Sub-caste:</span>
                    <span className="font-bold text-gray-900">{viewingProfile.caste || 'Open / Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Mother Tongue:</span>
                    <span className="font-bold text-gray-900">{viewingProfile.motherTongue}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Profile ID:</span>
                    <span className="text-gray-900 font-bold">{viewingProfile.id}</span>
                  </div>
                </div>
              </div>

              {/* Education & Career Box */}
              <div className="bg-[#FAF7F1] p-4 rounded-xl border border-[#eadfce] space-y-2">
                <h4 className="font-bold text-sm text-[#701C35] border-b border-[#eadfce] pb-1.5">
                  Education & Career
                </h4>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Education:</span>
                    <span className="font-semibold text-gray-900">{viewingProfile.education}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Profession:</span>
                    <span className="font-semibold text-gray-900">{viewingProfile.profession}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Location / Base:</span>
                    <span className="font-semibold text-gray-900">{viewingProfile.location}</span>
                  </div>
                </div>
              </div>

              {/* Verified Contact Card */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-950">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                  <ShieldCheck size={16} className="text-emerald-700" />
                  <span>Verified Contact Information</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-1 text-xs">
                  <span className="flex items-center gap-1 font-medium">
                    <Mail size={13} className="text-emerald-700" /> {viewingProfile.email || 'Contact through Kerala Kalyans Support'}
                  </span>
                  {viewingProfile.phone && (
                    <span className="flex items-center gap-1 font-medium">
                      <Phone size={13} className="text-emerald-700" /> +91 {viewingProfile.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-[#FAF7F1] border-t border-[#eadfce] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewingProfile(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold text-xs hover:bg-gray-50 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSendInterest(viewingProfile)
                }}
                className="px-5 py-2 rounded-xl bg-[#701C35] hover:bg-[#8B2342] text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Heart size={14} fill={interestsSent.includes(viewingProfile.id) ? 'white' : 'none'} />
                <span>{interestsSent.includes(viewingProfile.id) ? 'Interest Sent' : 'Send Interest'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. TOAST NOTIFICATION POPUP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#701C35] text-white px-5 py-3 rounded-xl shadow-xl border border-[#E8CA91]/40 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles size={16} className="text-[#E8CA91]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
