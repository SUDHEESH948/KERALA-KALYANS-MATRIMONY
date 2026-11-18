import { Sparkles, ArrowRight, ShieldCheck, FileText, Lock, ShieldAlert } from 'lucide-react'

export default function FooterSection({ onOpenAdmin, onOpenRegister, onOpenTerms }) {
  return (
    <>
      {/* FINAL CTA */}
      <section className="relative px-2.5 sm:px-6 py-12 sm:py-28 text-center font-inter">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#2a111b]/80" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <Sparkles className="mx-auto mb-3 sm:mb-6 text-[#E8CA91]" size={26} />
          <h2 className="serif text-xl sm:text-4xl font-bold text-white sm:text-6xl leading-tight">
            Your Forever Story Starts Today.
          </h2>
          <p className="mt-3 sm:mt-6 text-xs sm:text-lg text-white/80">
            Take the first step towards finding someone truly special. Free registration for girls &amp; verified matchmaking.
          </p>
          <button
            onClick={onOpenRegister}
            className="mt-5 sm:mt-9 w-full sm:w-auto rounded-full bg-[#C8A96B] px-5 sm:px-10 py-3 sm:py-4 text-xs sm:text-base font-bold text-[#321b1e] hover:bg-[#e0c58e] tracking-wide cursor-pointer transition shadow-lg text-center"
          >
            Create Your Profile <ArrowRight className="ml-1.5 sm:ml-2 inline" size={15} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#24151A] px-3 sm:px-6 py-10 sm:py-16 text-white font-inter">
        <div className="mx-auto grid grid-cols-1 md:grid-cols-12 max-w-[1300px] gap-8 sm:gap-10">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/kerala-kalyan-logo.png"
                alt="Kerala Kalyans Matrimony"
                className="h-11 w-auto object-contain bg-white rounded-lg p-1.5 shadow-md"
              />
              <div>
                <h2 className="serif text-xl sm:text-2xl font-bold text-[#E8CA91]">
                  Kerala Kalyans
                </h2>
                <p className="text-[9px] tracking-[2px] text-white/70 font-semibold uppercase">
                  Matrimony
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm leading-6 text-white/60">
              Bringing hearts together through meaningful connections, trust,
              and transparent beginnings across Kerala and worldwide.
            </p>
            <div className="pt-1 text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
              <span>✓ 100% Free Registration for Girls</span>
              <span className="text-white/40">·</span>
              <span>Zero Post-Marriage Commission</span>
            </div>
          </div>

          {/* Quick Legal & Terms Links */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-[#E8CA91] tracking-wide">
              Terms &amp; Policies
            </h3>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="hover:text-[#E8CA91] transition cursor-pointer text-left flex items-center gap-1.5"
                >
                  <FileText size={13} className="text-[#E8CA91]" />
                  <span>One-Time Fee &amp; Non-Refundable Policy</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="hover:text-[#E8CA91] transition cursor-pointer text-left flex items-center gap-1.5"
                >
                  <FileText size={13} className="text-[#E8CA91]" />
                  <span>6 Profiles Every Saturday (3-Month Service)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="hover:text-[#E8CA91] transition cursor-pointer text-left flex items-center gap-1.5"
                >
                  <FileText size={13} className="text-[#E8CA91]" />
                  <span>No 100% Guarantee &amp; Voluntary Registration</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="hover:text-red-300 transition cursor-pointer text-left flex items-center gap-1.5 text-red-200/90 font-medium"
                >
                  <ShieldAlert size={13} className="text-red-400" />
                  <span>Privacy, Liability &amp; Legal Disclaimer</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Registration Action */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-sm sm:text-base font-bold text-[#E8CA91] tracking-wide">
              Get Started
            </h3>
            <p className="text-xs sm:text-sm leading-6 text-white/60">
              Register voluntarily and start receiving verified compatible matches.
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={onOpenRegister}
                className="w-full rounded-full bg-[#701C35] px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wide cursor-pointer hover:bg-[#5a1429] transition shadow-md border border-[#701C35]/50 text-center block"
              >
                Join Kerala Kalyans
              </button>
              <button
                onClick={onOpenTerms}
                className="w-full rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-2 text-xs font-medium text-white/80 transition cursor-pointer text-center block"
              >
                View Full Terms
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer summary paragraph */}
        <div className="mx-auto mt-8 max-w-[1300px] rounded-xl bg-black/40 border border-white/10 p-4 text-[11px] text-white/60 leading-relaxed space-y-1">
          <p>
            <b className="text-white/90">Privacy Notice &amp; Legal Disclaimer:</b> Profiles and details provided by Kerala Kalyans Matrimony are strictly for your personal matrimonial use only. You are strictly not allowed to forward, share, or reuse them. We are not liable for any issues arising from misuse. Strict legal action will be taken against violators. Registration is voluntary; no 100% guarantee of marriage is provided.
          </p>
        </div>

        {/* Copyright Bar */}
        <div className="mx-auto mt-6 max-w-[1300px] border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-xs text-white/40">
          <span>© 2026 Kerala Kalyans Matrimony. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenTerms}
              className="hover:text-[#E8CA91] transition cursor-pointer"
            >
              Terms &amp; Disclaimer
            </button>
            <span>•</span>
            <button
              onClick={onOpenAdmin}
              className="text-white/50 hover:text-[#E8CA91] transition flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <ShieldCheck size={13} className="text-[#E8CA91]" />
              <span>Admin Control Panel</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  )
}
