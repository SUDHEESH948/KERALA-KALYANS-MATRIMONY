import { Menu, X, ShieldCheck, LogIn, LogOut, UserCheck, Sparkles, Home, Users, Crown, UserPlus } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'
import SafeAvatar from './SafeAvatar'

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
    <nav className="sticky top-0 z-50 bg-white/95 shadow-[0_8px_28px_rgba(36,42,45,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-3 sm:px-5 py-3 sm:py-4 lg:px-12">
        <a href="#" className="flex shrink-0 items-center" aria-label="Kerala Kalyans home">
          <img
            src="/kerala-kalyan-logo.png"
            alt="Kerala Kalyans Matrimony"
            className="h-12 w-auto object-contain contrast-[1.12] saturate-[1.2] drop-shadow-[0_1px_0_rgba(180,135,35,0.12)] sm:h-14 md:h-16"
          />
        </a>

        <div className="hidden items-center gap-8 text-sm font-semibold font-sans text-[#545b5f] lg:flex">
          <a href="#" className="text-[#701C35] transition hover:text-[#c79c18]">Home</a>
          <a href="#membership" className="transition hover:text-[#c79c18]">Membership</a>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={onOpenAdmin}
            className="relative rounded-full p-2 text-[#687074] transition hover:bg-[#e9ecec] hover:text-[#701C35] cursor-pointer"
            title="Admin Management"
          >
            <ShieldCheck size={16} />
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white shadow-xs animate-pulse">
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
                <Sparkles size={13} className="text-[#e0b629]" />
                <span>My Matches</span>
              </button>
              <div
                onClick={onOpenMatches}
                className="flex items-center gap-2.5 bg-white hover:bg-[#f1f3f3] px-3 py-1.5 rounded-full border border-[#eadfce] shadow-xs cursor-pointer transition"
                title="View your compatible matches"
              >
                <SafeAvatar
                  src={currentMember.photo}
                  name={currentMember.name}
                  className="h-7 w-7 rounded-full object-cover border border-[#c79c18]/40"
                />
                <div className="text-left font-sans">
                  <p className="text-xs font-bold text-gray-800 leading-tight max-w-[110px] truncate">
                    {currentMember.name}
                  </p>
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <UserCheck size={10} /> Active
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onLogoutMember()
                  }}
                  className="ml-1 text-[13px] font-semibold text-gray-400 hover:text-red-600 transition cursor-pointer p-1"
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
                className="font-sans px-4 py-2 text-sm font-semibold text-[#701C35] hover:text-[#511327] transition cursor-pointer flex items-center gap-1.5 border border-[#701C35]/30 rounded-full hover:bg-[#701C35]/5"
              >
                <LogIn size={15} />
                <span>Login</span>
              </button>

              <button
                onClick={onOpenRegister}
                className="font-sans rounded-full border border-[#b58a20] bg-white px-6 py-2.5 text-sm font-bold text-[#332500] shadow-sm transition-colors hover:bg-[#e2b82f] focus-visible:bg-[#e2b82f] cursor-pointer"
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
              <SafeAvatar
                src={currentMember.photo}
                name={currentMember.name}
                className="h-5 w-5 rounded-full object-cover border border-white/40"
                fallbackClassName="bg-white/20 text-white text-[10px]"
              />
              <span className="text-[13px] font-bold max-w-[75px] truncate">
                {currentMember.name}
              </span>
              <Sparkles size={11} className="text-[#e0b629]" />
            </button>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#eadfce] bg-white text-[#363b3e] shadow-sm transition hover:border-[#d3a825] hover:bg-[#f7f1dc]"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-[#eadfce] bg-[#FAF7F1] px-4 py-5 lg:hidden font-sans text-sm text-[#545b5f] shadow-[0_18px_30px_rgba(36,42,45,0.08)]">
          {currentMember && (
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#eadfce] bg-white p-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <SafeAvatar
                  src={currentMember.photo}
                  name={currentMember.name}
                  className="h-9 w-9 rounded-full object-cover border border-[#c79c18]/40"
                />
                <div className="min-w-0">
                  <p className="font-bold text-xs text-gray-900 truncate">{currentMember.name}</p>
                  <p className="text-[12px] text-emerald-600 font-semibold flex items-center gap-1">
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
              className="mb-4 w-full rounded-xl bg-[#3a4144] px-4 py-2.5 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Sparkles size={14} className="text-[#e0b629]" />
              <span>Explore My Matches</span>
            </button>
          )}

          <div className="grid grid-cols-3 gap-2">
            <a href="#" onClick={() => setMenuOpen(false)} className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border border-[#eadfce] bg-white px-1 text-center text-[12px] font-bold text-[#343a3d] shadow-xs transition active:scale-95">
              <Home size={18} className="text-[#d3a825]" />
              <span>Home</span>
            </a>
            <a href="#community" onClick={() => setMenuOpen(false)} className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border border-[#eadfce] bg-white px-1 text-center text-[12px] font-bold text-[#343a3d] shadow-xs transition active:scale-95">
              <Users size={18} className="text-[#d3a825]" />
              <span>Community</span>
            </a>
            <a href="#membership" onClick={() => setMenuOpen(false)} className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border border-[#eadfce] bg-white px-1 text-center text-[12px] font-bold text-[#343a3d] shadow-xs transition active:scale-95">
              <Crown size={18} className="text-[#d3a825]" />
              <span>Membership</span>
            </a>
          </div>

          <button
            onClick={() => {
              setMenuOpen(false)
              onOpenAdmin?.()
            }}
            className="mt-3 flex w-full items-center justify-between rounded-xl border border-[#eadfce] bg-white px-3 py-3 text-left font-sans text-xs font-semibold text-[#3a4144] shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} />
              <span>Admin Portal</span>
            </div>
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-4 px-1.5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {!currentMember && (
            <div className="grid grid-cols-2 gap-2 pt-3">
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onOpenLogin?.()
                }}
                className="text-center rounded-full border border-[#aeb4b6] py-2.5 text-[#3a4144] text-xs font-semibold font-sans shadow-xs cursor-pointer flex items-center justify-center gap-1"
              >
                <LogIn size={14} />
                <span>Login</span>
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  onOpenRegister?.()
                }}
                className="flex items-center justify-center gap-1 rounded-full border border-[#b58a20] bg-white py-2.5 text-center text-xs font-bold text-[#332500] font-sans shadow-sm transition-colors hover:bg-[#e2b82f] focus-visible:bg-[#e2b82f] cursor-pointer"
              >
                <UserPlus size={14} />
                Register
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
