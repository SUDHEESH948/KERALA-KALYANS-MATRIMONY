import { useState, useEffect, useMemo, useRef } from 'react'
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
  MessageCircle,
  ShoppingCart,
  Square,
  CheckSquare
} from 'lucide-react'
import { API_BASE } from '../config/api'
import ScreenshotPrivacyShield from '../components/ScreenshotPrivacyShield'
import MemberCartDrawer from '../components/MemberCartDrawer'
import SafeAvatar from '../components/SafeAvatar'

export default function MemberMatchesPage({ currentMember, onLogout, onNavigateHome, onViewProfile }) {
  const [profiles, setProfiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const memberGender = (currentMember?.gender || 'Groom').trim().toLowerCase()
  const isMemberMale = ['groom', 'man', 'male'].includes(memberGender)

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

  // Cart state: Selected profiles moved into Cart
  const [cartProfileIds, setCartProfileIds] = useState(() => {
    try {
      const saved = localStorage.getItem(`apremiya_cart_${currentMember?.id}`)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [selectedCheckboxIds, setSelectedCheckboxIds] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const [viewingProfile, setViewingProfile] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const toastTimer = useRef(null)

  const showToast = (message) => {
    clearTimeout(toastTimer.current)
    setToastMessage(message)
    toastTimer.current = setTimeout(() => setToastMessage(null), 3000)
  }

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const memberName = (currentMember?.name?.trim() || 'You').replace(
    /\p{L}+/gu,
    (word, offset, fullName) => {
      if (word !== word.toLocaleLowerCase()) return word
      const isTrailingInitials = offset + word.length === fullName.length
        && /\s$/.test(fullName.slice(0, offset))
        && /^[b-df-hj-np-tv-z]{2}$/i.test(word)
      if (isTrailingInitials) {
        return word.toLocaleUpperCase()
      }
      return word[0].toLocaleUpperCase() + word.slice(1)
    },
  )
  const memberReligion = currentMember?.religion || 'Hindu'
  const memberCaste = (currentMember?.caste || '').trim()

  const hasRefinements = Boolean(searchQuery || !strictSameReligion || strictSameCaste
    || selectedCaste !== 'all' || selectedMarriageType !== 'all')
  const activeGenderLabel = isMemberMale ? 'Brides (Women)' : 'Grooms (Men)'
  const activeGenderShort = isMemberMale ? 'Brides' : 'Grooms'
  const matchingGenders = useMemo(
    () => isMemberMale ? ['bride', 'woman', 'female'] : ['groom', 'man', 'male'],
    [isMemberMale],
  )

  // Fetch approved active profiles
  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    const fetchProfiles = async () => {
      try {
        const res = await fetch(`${API_BASE}/profiles?status=approved`, { signal })
        if (!res.ok) {
          if (!signal.aborted) setError('Failed to fetch matched profiles')
          return
        }
        const data = await res.json()
        if (!signal.aborted) setProfiles(Array.isArray(data) ? data : [])
      } catch {
        if (!signal.aborted) setError('Network error connecting to profiles service')
      } finally {
        if (!signal.aborted) setIsLoading(false)
      }
    }

    fetchProfiles()
    return () => controller.abort()
  }, [])

  const matchedProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (p.id === currentMember?.id || (currentMember?.email && p.email === currentMember.email)) {
        return false
      }

      const gender = (p.gender || '').trim().toLowerCase()
      if (!matchingGenders.includes(gender)) return false

      // SAME RELIGION MATCHING
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
  }, [profiles, matchingGenders, memberReligion, strictSameReligion, memberCaste, strictSameCaste, selectedCaste, selectedMarriageType, searchQuery, minAge, maxAge, currentMember])

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

  // Cart Handlers: Add to Cart, Select Checkboxes, Batch Move to Cart
  const handleToggleCart = (p) => {
    const isAlready = cartProfileIds.includes(p.id)
    let updated
    if (isAlready) {
      updated = cartProfileIds.filter((id) => id !== p.id)
      showToast(`Removed ${p.name} from Cart`)
    } else {
      updated = [...cartProfileIds, p.id]
      showToast(`🛒 Added ${p.name} to Cart!`)
    }
    setCartProfileIds(updated)
    localStorage.setItem(`apremiya_cart_${currentMember?.id}`, JSON.stringify(updated))
  }

  const handleToggleSelectCheckbox = (pId) => {
    setSelectedCheckboxIds((prev) =>
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId]
    )
  }

  const handleBatchMoveToCart = () => {
    if (selectedCheckboxIds.length === 0) return
    const combined = Array.from(new Set([...cartProfileIds, ...selectedCheckboxIds]))
    setCartProfileIds(combined)
    localStorage.setItem(`apremiya_cart_${currentMember?.id}`, JSON.stringify(combined))
    showToast(`🛒 Moved ${selectedCheckboxIds.length} profiles to Cart!`)
    setSelectedCheckboxIds([])
    setIsCartOpen(true)
  }

  const handleRemoveFromCart = (pId) => {
    const updated = cartProfileIds.filter((id) => id !== pId)
    setCartProfileIds(updated)
    localStorage.setItem(`apremiya_cart_${currentMember?.id}`, JSON.stringify(updated))
    showToast('Removed profile from Cart')
  }

  const handleClearCart = () => {
    setCartProfileIds([])
    localStorage.setItem(`apremiya_cart_${currentMember?.id}`, JSON.stringify([]))
    showToast('Cart cleared')
  }

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-gray-800 flex flex-col selection:bg-[#701C35] selection:text-white protected-profile-view">
      {/* Anti-Screenshot Privacy Shield with Instant Admin Notification */}
      <ScreenshotPrivacyShield
        label="Member Matches"
        currentMember={currentMember}
        targetProfile={viewingProfile}
      />

      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#FAF7F1] border-b border-[#eadfce] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Tagline */}
          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <img
                src="/kerala-kalyan-logo.png"
                alt="Kerala Kalyans Matrimony"
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain mix-blend-multiply"
              />
              <div className="hidden whitespace-nowrap xl:block">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-[#701C35] block leading-tight">
                  Kerala Kalyans
                </span>
                <span className="text-[11px] sm:text-[12px] tracking-[2px] font-semibold text-[#B28D53] uppercase block">
                  Matrimony
                </span>
              </div>
            </button>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap bg-white/70 md:flex border border-[#eadfce] p-1 rounded-full text-xs font-semibold text-gray-600">
            <button
              onClick={onNavigateHome}
              className="px-4 py-1.5 rounded-full hover:text-[#701C35] hover:bg-white cursor-pointer flex items-center gap-1.5"
            >
              <Home size={14} />
              <span>Home</span>
            </button>
            <div aria-current="page" className="px-4 py-1.5 rounded-full bg-[#701C35] text-white shadow-xs flex items-center gap-1.5 cursor-default">
              <Sparkles size={14} />
              <span>My Matches ({matchedProfiles.length})</span>
            </div>
          </nav>

          {/* Cart, Logged in Member Profile & Actions */}
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap sm:gap-3">
            {/* Selected Profiles Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#eadfce] bg-white text-gray-750 hover:text-[#701C35] hover:border-[#701C35] shadow-xs text-xs font-bold cursor-pointer group"
              title="View Selected Profiles Cart"
            >
              <ShoppingCart size={15} className="shrink-0 text-[#701C35]" />
              <span className="hidden lg:inline">Cart</span>
              <span className={`flex size-5 shrink-0 items-center justify-center rounded-full bg-[#701C35] text-[10px] font-bold tabular-nums text-white ${cartProfileIds.length ? '' : 'invisible'}`}>
                {cartProfileIds.length > 99 ? '99+' : cartProfileIds.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentMember?.id) {
                  window.location.hash = `#profile/${currentMember.id}`
                }
              }}
              className="flex items-center gap-2.5 bg-white hover:bg-[#FAF7F1] p-1.5 lg:pl-2 lg:pr-3.5 rounded-full border border-[#eadfce] hover:border-[#701C35]/50 shadow-xs cursor-pointer text-left group"
              title="Click to view your own complete profile"
            >
              <SafeAvatar
                src={currentMember?.photo}
                name={currentMember?.name || 'Member'}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-[#701C35]/30 shrink-0"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-gray-900 leading-tight max-w-[120px] truncate group-hover:text-[#701C35]">
                  {currentMember?.name || 'Member'}
                </div>
                <div className="text-[12px] font-semibold text-[#701C35] flex items-center gap-1">
                  <Eye size={10} />
                  <span>View My Profile</span>
                </div>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-full sm:rounded-lg border border-[#eadfce] bg-white text-gray-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50/50 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Sign Out"
            >
              <LogOut size={16} />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MATCH CRITERIA HERO BANNER */}
      <section className="bg-gradient-to-r from-[#701C35] via-[#5C1429] to-[#3E0A1A] text-white px-4 py-5 shadow-md sm:px-6 lg:px-8 lg:py-7">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-[1_1_28rem] space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold text-[#E8CA91]">
              <Sparkles size={13} />
              <span>AUTOMATIC COMPATIBILITY FILTER</span>
            </div>
            <h1 className="text-2xl sm:text-4xl tracking-tight text-white leading-tight">
              Curated Matches for{' '}<span className="inline-block max-w-full [overflow-wrap:anywhere]">{memberName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-200 max-w-2xl leading-relaxed">
              Listing verified <b>{activeGenderLabel}</b> from{' '}
              <span className="text-[#E8CA91] font-bold underline decoration-[#E8CA91]/50 underline-offset-4">
                {strictSameReligion ? memberReligion : 'all religions'}
              </span>
              . Connect with genuine matrimonial profiles seeking life partners.
            </p>
          </div>

          {/* Quick Context Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex max-w-full items-center gap-3 px-3 py-2.5 sm:px-4">
            <div className="h-10 w-14 shrink-0 rounded-xl tabular-nums bg-[#E8CA91] text-[#701C35] flex items-center justify-center font-bold text-lg shadow-inner">
              {matchedProfiles.length}
            </div>
            <div className="text-left">
              <span className="text-xs text-white/80 block uppercase tracking-wider font-semibold">
                Available Matches
              </span>
              <span className="text-base sm:text-lg font-bold text-white block">
                {activeGenderShort} ? {strictSameReligion ? memberReligion : 'All religions'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 flex-1 w-full space-y-4 sm:space-y-5">
        {/* FILTER & SEARCH TOOLBAR */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#eadfce] shadow-xs space-y-2.5">
          {/* Top Row: Search Input & Gender Segmented Switch */}
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
            {/* Search Input */}
            <div className="relative min-w-0 flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                aria-label="Search matches"
                placeholder="Search matches by name, caste, job, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#701C35] focus:ring-1 focus:ring-[#701C35] bg-gray-50/40 hover:bg-white focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="inline-flex self-start items-center gap-1.5 rounded-lg bg-[#701C35] px-3 py-1.5 text-xs font-semibold text-white shadow-xs lg:self-center">
              <span>{activeGenderLabel}</span>
              <span className="w-[6ch] rounded-full bg-white/20 px-1 text-center text-[11px] font-bold tabular-nums">
                {matchedProfiles.length}
              </span>
            </div>
          </div>

          {/* Row 2: Secondary Refinement Filters */}
          <div className="grid grid-cols-2 items-stretch gap-2 border-t border-gray-100 pt-2 text-xs xl:grid-cols-4">
            {/* Strict Religion Toggle Button */}
            <button
              type="button"
              onClick={() => setStrictSameReligion(!strictSameReligion)}
              className={`min-w-0 px-2.5 py-2 rounded-xl border font-semibold cursor-pointer flex items-center justify-center gap-1.5 shadow-xs [overflow-wrap:anywhere] ${
                strictSameReligion
                  ? 'bg-[#701C35] text-white border-[#701C35]'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-[#FAF7F1]'
              }`}
              title="Toggle between Same Religion and All Religions"
            >
              <Check size={14} aria-hidden="true" className={`shrink-0 ${strictSameReligion ? "" : "invisible"}`} />
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
                className={`min-w-0 px-2.5 py-2 rounded-xl border font-semibold cursor-pointer flex items-center justify-center gap-1.5 shadow-xs [overflow-wrap:anywhere] ${
                  strictSameCaste
                    ? 'bg-[#701C35] text-white border-[#701C35]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-[#FAF7F1]'
                }`}
                title={`Filter profiles strictly for your category (${memberCaste.toUpperCase()})`}
              >
                <Check size={14} aria-hidden="true" className={`shrink-0 ${strictSameCaste ? "" : "invisible"}`} />
                <span>Same Category ({memberCaste.toUpperCase()})</span>
              </button>
            )}

            {/* Caste Filter Dropdown */}
            <div className="relative min-w-0">
              <select
                aria-label="Caste"
                disabled={availableCastes.length === 0}
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
                className="w-full min-w-0 truncate appearance-none rounded-xl border border-gray-200 bg-white px-2.5 py-2 pr-7 text-xs font-medium text-gray-700 shadow-xs focus:border-[#701C35] focus:outline-none enabled:cursor-pointer disabled:opacity-50"
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

            {/* Marriage Type Filter Dropdown */}
            <div className="relative">
              <select
                aria-label="Marriage type"
                value={selectedMarriageType}
                onChange={(e) => setSelectedMarriageType(e.target.value)}
                className="w-full min-w-0 truncate appearance-none bg-white border border-gray-200 px-2.5 py-2 pr-7 rounded-xl font-medium text-gray-700 focus:outline-none focus:border-[#701C35] text-xs cursor-pointer shadow-xs"
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
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStrictSameReligion(true)
                setStrictSameCaste(false)
                setSelectedCaste('all')
                setSelectedMarriageType('all')
              }}
              disabled={!hasRefinements}
              className="col-span-full justify-self-end px-3 py-1 text-xs font-semibold text-[#701C35] enabled:cursor-pointer enabled:hover:underline disabled:opacity-50"
            >
              Reset Filters
            </button>
          </div>

          {/* Active Filter Pills Bar */}
          <div className="flex h-11 items-start gap-2 overflow-x-auto whitespace-nowrap border-t border-gray-100 pt-2 text-xs text-gray-500 [scrollbar-width:thin]"
            role="region"
            aria-label="Active filters"
            tabIndex={0}>
            <span className="font-semibold text-gray-400 text-[13px] uppercase tracking-wider">Active Filters:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[13px] font-semibold">
              Looking for: {activeGenderLabel}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[13px] font-semibold">
              Religion: {strictSameReligion ? `${memberReligion} Only` : 'All Religions'}
            </span>
            {strictSameCaste && memberCaste ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[13px] font-semibold">
                Category: {memberCaste.toUpperCase()} Only
              </span>
            ) : selectedCaste !== 'all' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[13px] font-semibold">
                Caste: {selectedCaste}
              </span>
            ) : null}
            {selectedMarriageType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[13px] font-semibold">
                Status: {selectedMarriageType}
              </span>
            )}
            <span className="text-gray-400 text-[13px] ml-auto">
              Found <b>{matchedProfiles.length}</b> verified matches
            </span>
          </div>
        </div>

        {/* 4. PROFILES GRID OR LOADING / EMPTY STATE */}
        {isLoading ? (
          <div role="status" className="grid min-h-[29rem] content-center justify-items-center text-center sm:min-h-[30rem] lg:min-h-[32rem]">
            <div className="inline-block motion-safe:animate-spin rounded-full h-10 w-10 border-4 border-[#701C35] border-t-transparent mb-4" />
            <p className="text-sm font-semibold text-gray-600">Finding your matches...</p>
          </div>
        ) : error ? (
          <div role="alert" className="mx-auto max-w-md rounded-2xl border border-[#eadfce] bg-white p-6 text-center text-sm">
            {error}. Refresh the page to try again.
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
              No verified profiles match your selected gender, search, and filters.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCaste('all')
                  setStrictSameCaste(false)
                  setSelectedMarriageType('all')
                  setStrictSameReligion(false)
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#701C35] hover:bg-[#8B2342] text-white text-xs font-semibold cursor-pointer shadow-sm"
              >
                Expand Search to All Religions
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {matchedProfiles.map((p) => {
              const isInCart = cartProfileIds.includes(p.id)
              const isSaved = shortlisted.includes(p.id)

              return (
                <div
                  key={p.id}
                  className="flex min-h-[29rem] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-xs sm:min-h-[30rem] lg:min-h-[32rem]"
                >
                  {/* Photo Container */}
                  <div
                    onClick={() => {
                      if (onViewProfile) onViewProfile(p.id)
                      else window.location.hash = `#profile/${p.id}`
                    }}
                    className="group/photo relative h-52 w-full shrink-0 cursor-pointer overflow-hidden bg-gray-100 sm:h-56 lg:h-64"
                    title="Click to view full separate profile page"
                  >
                    <img
                      src={p.photo || '/kerala-hero-couple.jpg'}
                      alt={p.name}
                      onError={(e) => {
                        const fallback = '/kerala-hero-couple.jpg'
                        if (e.currentTarget.getAttribute('src') !== fallback) {
                          e.currentTarget.src = fallback
                        }
                      }}
                      className="h-full w-full object-cover object-top motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover/photo:scale-105 select-none pointer-events-none"
                      loading="lazy"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />

                    {/* Hover "View Profile" Pill Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 motion-safe:transition-opacity motion-safe:duration-200 pointer-events-none">
                      <span className="px-4 py-2 rounded-full bg-white/95 backdrop-blur-md text-[#701C35] font-bold text-xs shadow-xl flex items-center gap-1.5 border border-[#eadfce]">
                        <Eye size={15} />
                        <span>View Profile</span>
                      </span>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute inset-x-4 top-4 sm:inset-x-5 sm:top-5 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-1.5">
                        {/* Checkbox to select profile for moving to Cart */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleSelectCheckbox(p.id)
                          }}
                          className="pointer-events-auto cursor-pointer"
                          title="Select profile to move to Cart"
                        >
                          {selectedCheckboxIds.includes(p.id) ? (
                            <div className="h-6 w-6 rounded-md bg-[#701C35] text-white flex items-center justify-center shadow-md">
                              <Check size={14} />
                            </div>
                          ) : (
                            <div className="h-6 w-6 rounded-md bg-black/50 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center border border-white/40">
                              <Square size={14} />
                            </div>
                          )}
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full backdrop-blur-md text-[11px] font-bold text-white tracking-wide border border-white/20 shadow-xs ${
                            p.gender === 'Groom' ? 'bg-blue-900/85' : 'bg-pink-900/85'
                          }`}
                        >
                          {p.gender}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 pointer-events-auto">
                        {/* Quick Add to Cart button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleCart(p)
                          }}
                          className={`p-2 rounded-full backdrop-blur-md cursor-pointer ${
                            isInCart
                              ? 'bg-[#701C35] text-white shadow-md'
                              : 'bg-black/40 text-white hover:bg-black/60'
                          }`}
                          title={isInCart ? 'Remove from Cart' : 'Add to Cart'}
                        >
                          <ShoppingCart size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleShortlist(p)
                          }}
                          className={`p-2 rounded-full backdrop-blur-md cursor-pointer ${
                            isSaved
                              ? 'bg-amber-400 text-white shadow-md'
                              : 'bg-black/40 text-white hover:bg-black/60'
                          }`}
                          title={isSaved ? 'Shortlisted' : 'Shortlist Profile'}
                        >
                          <Star size={14} fill={isSaved ? 'white' : 'none'} />
                        </button>
                      </div>
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
                        {(p.star || p.nakshatra) && (
                          <span className="font-bold text-[#701C35] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                            ⭐ {p.star || p.nakshatra}
                          </span>
                        )}
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
                        <span className="truncate">{p.district ? `${p.district}, ` : ''}{p.location}</span>
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
                        className="w-full py-2.5 px-2 rounded-xl border border-[#701C35] bg-white hover:bg-[#701C35] text-[#701C35] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 motion-safe:transition-transform motion-safe:duration-200 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                        title="View Full Profile Details"
                      >
                        <Eye size={14} />
                        <span>View Profile</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isInCart) setIsCartOpen(true)
                          else handleToggleCart(p)
                        }}
                        className={`w-full py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 motion-safe:transition-transform motion-safe:duration-200 cursor-pointer shadow-xs active:scale-95 ${
                          isInCart
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#701C35] hover:bg-[#5C1429] text-white'
                        }`}
                      >
                        <ShoppingCart size={14} className="shrink-0" aria-hidden="true" />
                        <span>{isInCart ? 'View Cart' : 'Add to Cart'}</span>
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
                src={viewingProfile.photo || '/kerala-hero-couple.jpg'}
                alt={viewingProfile.name}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/kerala-hero-couple.jpg'
                }}
                className="h-full w-full object-cover object-top filter brightness-90 select-none pointer-events-none"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

              <button
                type="button"
                onClick={() => setViewingProfile(null)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 cursor-pointer"
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
                    <span className="text-gray-400 block text-[12px] uppercase font-semibold">Religion:</span>
                    <span className="font-bold text-gray-900">{viewingProfile.religion}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[12px] uppercase font-semibold">Caste / Sub-caste:</span>
                    <span className="font-bold text-gray-900">{viewingProfile.caste || 'Open / Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[12px] uppercase font-semibold">Mother Tongue:</span>
                    <span className="font-bold text-gray-900">{viewingProfile.motherTongue}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[12px] uppercase font-semibold">Profile ID:</span>
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
                    <span className="text-gray-400 block text-[12px] uppercase font-semibold">Education:</span>
                    <span className="font-semibold text-gray-900">{viewingProfile.education}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[12px] uppercase font-semibold">Profession:</span>
                    <span className="font-semibold text-gray-900">{viewingProfile.profession}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-[12px] uppercase font-semibold">Location / Base:</span>
                    <span className="font-semibold text-gray-900">{viewingProfile.location}</span>
                  </div>
                </div>
              </div>

              {/* Mediated Contact Card via Kerala Kalyans */}
              <div className="p-4 bg-[#FAF7F1] border border-[#eadfce] rounded-xl space-y-2 text-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#701C35]">
                    <ShieldCheck size={16} className="text-[#701C35]" />
                    <span>Contact via Kerala Kalyans Matrimony</span>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border border-[#eadfce]">
                    ID: {viewingProfile.id}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  To protect member privacy, contact <b className="text-gray-900">{viewingProfile.name}</b> through Kerala Kalyans office.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1 text-xs">
                  <a
                    href="tel:+918075588406"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#701C35] hover:bg-[#511327] text-white font-semibold"
                  >
                    <Phone size={13} />
                    <span>Call: (+91) 80755 88406</span>
                  </a>
                  <a
                    href={`https://wa.me/917907348468?text=Hello%20Kerala%20Kalyans,%20I%20am%20interested%20in%20Profile%20ID:%20${encodeURIComponent(viewingProfile.id || '')}%20(${encodeURIComponent(viewingProfile.name || '')})`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold"
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp: (+91) 79073 48468</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-[#FAF7F1] border-t border-[#eadfce] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewingProfile(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold text-xs hover:bg-gray-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSendInterest(viewingProfile)
                }}
                className="px-5 py-2 rounded-xl bg-[#701C35] hover:bg-[#8B2342] text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Heart size={14} fill={interestsSent.includes(viewingProfile.id) ? 'white' : 'none'} />
                <span>{interestsSent.includes(viewingProfile.id) ? 'Interest Sent' : 'Send Interest'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FLOATING BATCH SELECTION BAR (MOVE TO CART) */}
      {selectedCheckboxIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 animate-in slide-in-from-bottom-5">
          <div className="bg-[#701C35] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#E8CA91]/40 flex items-center gap-4 text-xs font-semibold backdrop-blur-md">
            <span className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-white text-[#701C35] flex items-center justify-center font-bold text-xs">
                {selectedCheckboxIds.length}
              </span>
              <span>Profiles Selected</span>
            </span>

            <button
              type="button"
              onClick={handleBatchMoveToCart}
              className="px-4 py-2 rounded-xl bg-[#E8CA91] text-[#701C35] font-bold hover:bg-[#d4b06f] cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <ShoppingCart size={14} />
              <span>Move to Cart</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCheckboxIds([])}
              className="text-gray-300 hover:text-white underline cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* 6. MEMBER CART DRAWER */}
      <MemberCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartProfileIds={cartProfileIds}
        allProfiles={profiles}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onViewProfile={(id) => {
          if (onViewProfile) onViewProfile(id)
          else window.location.hash = `#profile/${id}`
        }}
        currentMember={currentMember}
      />

      {/* 7. TOAST NOTIFICATION POPUP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#701C35] text-white px-5 py-3 rounded-xl shadow-xl border border-[#E8CA91]/40 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles size={16} className="text-[#E8CA91]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
