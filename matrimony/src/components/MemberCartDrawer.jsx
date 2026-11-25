import { useState, useMemo } from 'react'
import {
  X,
  ShoppingCart,
  Trash2,
  Eye,
  Heart,
  MessageCircle,
  ShieldCheck,
  MapPin,
  Briefcase,
  Sparkles,
  ArrowRight
} from 'lucide-react'

export default function MemberCartDrawer({
  isOpen,
  onClose,
  cartProfileIds,
  allProfiles,
  onRemoveFromCart,
  onClearCart,
  onViewProfile,
  currentMember
}) {
  const [filterGender, setFilterGender] = useState('all')

  // Resolve full profile objects from IDs
  const cartProfiles = useMemo(() => {
    if (!Array.isArray(cartProfileIds)) return []
    return cartProfileIds
      .map((id) => allProfiles.find((p) => p.id === id))
      .filter(Boolean)
  }, [cartProfileIds, allProfiles])

  const filteredCartProfiles = useMemo(() => {
    if (filterGender === 'all') return cartProfiles
    return cartProfiles.filter((p) => {
      const g = (p.gender || '').toLowerCase()
      if (filterGender === 'Bride') return g === 'bride' || g === 'female' || g === 'woman'
      if (filterGender === 'Groom') return g === 'groom' || g === 'male' || g === 'man'
      return true
    })
  }, [cartProfiles, filterGender])

  const brideCount = useMemo(
    () => cartProfiles.filter((p) => /bride|female|woman/i.test(p.gender || '')).length,
    [cartProfiles]
  )
  const groomCount = useMemo(
    () => cartProfiles.filter((p) => /groom|male|man/i.test(p.gender || '')).length,
    [cartProfiles]
  )

  if (!isOpen) return null

  const handleWhatsAppCartInquiry = () => {
    if (cartProfiles.length === 0) return
    const idsText = cartProfiles.map((p) => `${p.name} (ID: ${p.id})`).join(', ')
    const message = `Hello Kerala Kalyans, I have selected ${cartProfiles.length} profiles in my cart: ${idsText}. I would like more details and mediated introduction.`
    const url = `https://wa.me/917907348468?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-[#FAF7F1] w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-[#eadfce] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#eadfce] bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-[#701C35] text-white flex items-center justify-center shadow-xs">
              <ShoppingCart size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                  Selected Profiles Cart
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#701C35] text-white text-[11px] font-bold">
                  {cartProfiles.length}
                </span>
              </div>
              <p className="text-[12px] text-gray-500">
                Shortlisted candidate profiles for comparison &amp; introduction
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            title="Close Cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Gender Filter Toggles (Male & Female) */}
        {cartProfiles.length > 0 && (brideCount > 0 && groomCount > 0) && (
          <div className="flex items-center gap-1.5 px-5 py-2.5 bg-white border-b border-[#eadfce] text-xs">
            <span className="text-gray-500 font-semibold mr-1">Filter:</span>
            <button
              onClick={() => setFilterGender('all')}
              className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                filterGender === 'all'
                  ? 'bg-[#701C35] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({cartProfiles.length})
            </button>
            <button
              onClick={() => setFilterGender('Bride')}
              className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                filterGender === 'Bride'
                  ? 'bg-pink-700 text-white'
                  : 'bg-pink-50 text-pink-800 hover:bg-pink-100 border border-pink-200'
              }`}
            >
              Brides ({brideCount})
            </button>
            <button
              onClick={() => setFilterGender('Groom')}
              className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                filterGender === 'Groom'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              Grooms ({groomCount})
            </button>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredCartProfiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="h-16 w-16 rounded-full bg-amber-50 border border-amber-200 text-[#B28D53] flex items-center justify-center">
                <ShoppingCart size={32} />
              </div>
              <h3 className="text-base font-bold text-gray-800">
                Your cart is empty
              </h3>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                Browse Male (Groom) and Female (Bride) profiles and click the <b>&quot;Add to Cart&quot;</b> button to collect candidates here.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#701C35] hover:bg-[#5C1429] text-white text-xs font-bold transition cursor-pointer shadow-sm"
              >
                Browse Profiles
              </button>
            </div>
          ) : (
            filteredCartProfiles.map((p) => {
              const isGroom = /groom|male|man/i.test(p.gender || '')
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-[#eadfce] p-3.5 shadow-xs hover:shadow-md transition flex gap-3 group"
                >
                  {/* Photo */}
                  <div
                    onClick={() => {
                      onViewProfile(p.id)
                      onClose()
                    }}
                    className="relative h-24 w-20 sm:h-28 sm:w-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 cursor-pointer"
                    title="Click to view full protected profile"
                  >
                    <img
                      src={p.photo}
                      alt={p.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
                    />
                    <div className="absolute top-1 left-1">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isGroom ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'
                        }`}
                      >
                        {p.gender}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4
                            onClick={() => {
                              onViewProfile(p.id)
                              onClose()
                            }}
                            className="font-bold text-sm text-gray-900 hover:text-[#701C35] cursor-pointer truncate"
                          >
                            {p.name}
                          </h4>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {p.id}
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveFromCart(p.id)}
                          className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Remove from Cart"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <p className="text-gray-600 mt-1 font-medium truncate">
                        {p.age} yrs · {p.height} · {p.religion} {p.caste ? `· ${p.caste}` : ''}
                      </p>

                      <p className="text-gray-500 truncate flex items-center gap-1 mt-0.5">
                        <Briefcase size={12} className="shrink-0 text-gray-400" />
                        <span className="truncate">{p.profession}</span>
                      </p>

                      <p className="text-gray-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="shrink-0 text-gray-400" />
                        <span className="truncate">{p.location}</span>
                      </p>
                    </div>

                    {/* Action Links */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          onViewProfile(p.id)
                          onClose()
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg border border-[#701C35] text-[#701C35] hover:bg-[#701C35] hover:text-white font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>View Profile</span>
                      </button>

                      <button
                        onClick={() => onRemoveFromCart(p.id)}
                        className="py-1.5 px-2 rounded-lg text-gray-500 hover:text-red-700 hover:bg-red-50 text-[11px] font-semibold transition cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Actions */}
        {cartProfiles.length > 0 && (
          <div className="p-4 bg-white border-t border-[#eadfce] space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-semibold">
                Total Candidates in Cart:
              </span>
              <span className="font-bold text-[#701C35] text-sm">
                {cartProfiles.length} Profiles
              </span>
            </div>

            <button
              onClick={handleWhatsAppCartInquiry}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
            >
              <MessageCircle size={15} />
              <span>Inquire All Cart Profiles on WhatsApp</span>
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={onClearCart}
                className="text-[11px] text-gray-400 hover:text-red-600 font-semibold cursor-pointer transition"
              >
                Clear Entire Cart
              </button>

              <span className="text-[11px] text-[#B28D53] font-semibold flex items-center gap-1">
                <Sparkles size={12} />
                <span>Protected Profile View Rules Apply</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
