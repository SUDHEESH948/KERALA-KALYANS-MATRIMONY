import { Heart, Menu, X, ShieldCheck, LogIn, LogOut, UserCheck, Sparkles } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'

export default function Navbar({
  onOpenAdmin,
  onOpenRegister,
  onOpenLogin,
  currentMember,
  onLogoutMember,
  onOpenMatches,
  menuOpen,
  setMenuOpen
}) {
  const { unreadCount = 0 } = useNotification() || {}

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e9dfd2] bg-[#FAF7F1]/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-3 sm:px-5 py-3 sm:py-4 lg:px-12">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-[#701C35] text-white flex-shrink-0">
            <Heart size={18} className="sm:hidden" fill="white" />
            <Heart size={22} className="hidden sm:block" fill="white" />
          </div>
          <div>
            <h2 className="serif font-serif text-xl sm:text-2xl font-bold text-[#701C35] leading-tight">
              Apremiya
            </h2>
            <p className="font-montserrat text-[8px] sm:text-[9px] font-semibold tracking-[2px] sm:tracking-[3px] text-[#9C8158]">
              YOUR FOREVER BEGINS
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-7 text-sm font-semibold font-montserrat text-[#51464a] lg:flex">
          <a href="#" className="text-[#701C35] hover:text-[#511327] transition">Home</a>
          <a href="#how-it-works" className="hover:text-[#701C35] transition">How It Works</a>
          <a href="#community" className="hover:text-[#701C35] transition">Community</a>
          <a href="#stories" className="hover:text-[#701C35] transition">Success Stories</a>
          <a href="#membership" className="hover:text-[#701C35] transition">Membership</a>
          <a href="#about" className="hover:text-[#701C35] transition">About Us</a>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={onOpenAdmin}
            className="relative font-montserrat px-3 py-2 text-sm font-semibold text-[#701C35] hover:text-[#511327] transition cursor-pointer flex items-center gap-1.5"
            title="Admin Management"
          >
            <ShieldCheck size={16} />
            <span>Admin Portal</span>
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {currentMember ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenMatches}
                className="px-3.5 py-1.5 rounded-full bg-[#701C35] hover:bg-[#511327] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="View your compatible matches"
              >
                <Sparkles size={13} className="text-[#E8CA91]" />
                <span>My Matches</span>
              </button>
              <div
                onClick={onOpenMatches}
                className="flex items-center gap-2.5 bg-white hover:bg-[#701C35]/5 px-3 py-1.5 rounded-full border border-[#eadfce] shadow-xs cursor-pointer transition"
                title="View your compatible matches"
              >
                <img
                  src={currentMember.photo}
                  alt={currentMember.name}
                  className="h-7 w-7 rounded-full object-cover border border-[#701C35]/30"
                />
                <div className="text-left font-montserrat">
                  <p className="text-xs font-bold text-gray-800 leading-tight max-w-[110px] truncate">
                    {currentMember.name}
                  </p>
                  <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <UserCheck size={10} /> Active
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onLogoutMember()
                  }}
                  className="ml-1 text-[11px] font-semibold text-gray-400 hover:text-red-600 transition cursor-pointer p-1"
                  title="Log out of account"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Automatically added Login button */}
              <button
                onClick={onOpenLogin}
                className="font-montserrat px-4 py-2 text-sm font-semibold text-[#701C35] hover:text-[#511327] transition cursor-pointer flex items-center gap-1.5 border border-[#701C35]/30 rounded-full hover:bg-[#701C35]/5"
              >
                <LogIn size={15} />
                <span>Login</span>
              </button>

              <button
                onClick={onOpenRegister}
                className="font-montserrat rounded-full bg-[#701C35] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#701C35]/15 transition hover:bg-[#511327] cursor-pointer"
              >
                Register
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {currentMember && (
            <button
              onClick={onOpenMatches}
              className="flex items-center gap-1.5 bg-[#701C35] hover:bg-[#511327] px-3 py-1.5 rounded-full text-white shadow-xs active:scale-95 transition cursor-pointer"
              title="Click to view your Matches"
            >
              <img
                src={currentMember.photo}
                alt={currentMember.name}
                className="h-5 w-5 rounded-full object-cover border border-white/40"
              />
              <span className="text-[11px] font-bold max-w-[75px] truncate">
                {currentMember.name}
              </span>
              <Sparkles size={11} className="text-[#E8CA91]" />
            </button>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#701C35] p-1.5"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-3.5 border-t border-[#e9dfd2] bg-[#FAF7F1] px-4 py-5 lg:hidden font-montserrat font-medium text-sm">
          {currentMember && (
            <div className="p-3 bg-white rounded-xl border border-[#eadfce] flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={currentMember.photo}
                  alt={currentMember.name}
                  className="h-9 w-9 rounded-full object-cover border border-[#701C35]/30"
                />
                <div className="min-w-0">
                  <p className="font-bold text-xs text-gray-900 truncate">{currentMember.name}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <UserCheck size={11} /> Verified Member
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onLogoutMember()
                }}
                className="text-xs font-semibold text-red-600 px-2 py-1 rounded border border-red-200"
              >
                Logout
              </button>
            </div>
          )}

          {currentMember && (
            <button
              onClick={() => {
                setMenuOpen(false)
                onOpenMatches?.()
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#701C35] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Sparkles size={14} className="text-[#E8CA91]" />
              <span>Explore My Matches</span>
            </button>
          )}

          <a href="#" onClick={() => setMenuOpen(false)} className="text-[#701C35] font-semibold">Home</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="hover:text-[#701C35] transition">How It Works</a>
          <a href="#community" onClick={() => setMenuOpen(false)} className="hover:text-[#701C35] transition">Community</a>
          <a href="#stories" onClick={() => setMenuOpen(false)} className="hover:text-[#701C35] transition">Success Stories</a>
          <a href="#membership" onClick={() => setMenuOpen(false)} className="hover:text-[#701C35] transition">Membership</a>
          <a href="#about" onClick={() => setMenuOpen(false)} className="hover:text-[#701C35] transition">About Us</a>

          <button
            onClick={() => {
              setMenuOpen(false)
              onOpenAdmin?.()
            }}
            className="text-left font-montserrat text-sm font-semibold text-[#701C35] flex items-center justify-between py-1 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} />
              <span>Admin Portal</span>
            </div>
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-4 px-1.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {!currentMember && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onOpenLogin?.()
                }}
                className="text-center rounded-full border border-[#701C35] py-2.5 text-[#701C35] text-xs font-semibold font-montserrat shadow-xs cursor-pointer flex items-center justify-center gap-1"
              >
                <LogIn size={14} />
                <span>Login</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onOpenRegister?.()
                }}
                className="text-center rounded-full bg-[#701C35] py-2.5 text-white text-xs font-semibold font-montserrat shadow-md cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
