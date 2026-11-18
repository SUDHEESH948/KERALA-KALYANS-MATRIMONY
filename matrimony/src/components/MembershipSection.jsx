import {
  Heart,
  Calendar,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Lock,
  FileText,
  BadgePercent
} from 'lucide-react'

export default function MembershipSection({ onOpenRegister, onOpenTerms }) {
  const policies = [
    {
      title: 'Free Registration for Girls',
      badge: '100% Free',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      description: 'Registration is completely free for girls\' profiles. Zero listing or renewal fees.',
      icon: Sparkles
    },
    {
      title: 'One-Time Registration Fee',
      badge: 'Non-Refundable',
      badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
      description: 'Only a one-time registration fee is charged. The registration fee is strictly non-refundable with zero hidden charges.',
      icon: CheckCircle2
    },
    {
      title: 'Weekly Profile Services',
      badge: '6 Profiles / Saturday',
      badgeColor: 'bg-sky-500/20 text-sky-200 border-sky-400/30',
      description: 'During the 3-month registration period, 6 verified compatible profiles will be sent every Saturday directly to you.',
      icon: Calendar
    },
    {
      title: 'Zero Post-Marriage Extra Fees',
      badge: 'No ₹25K / ₹50K Demands',
      badgeColor: 'bg-purple-500/20 text-purple-200 border-purple-400/30',
      description: 'Once the marriage is fixed, you do NOT need to pay any extra payments like ₹25,000 or ₹50,000, or any hidden commission.',
      icon: BadgePercent
    }
  ]

  return (
    <section id="membership" className="bg-[#701C35] px-3 sm:px-6 py-12 sm:py-24 text-white font-inter">
      <div className="mx-auto max-w-[1240px]">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-xs font-bold tracking-[3px] text-[#E8CA91] uppercase">
            TRANSPARENT &amp; ETHICAL MATCHMAKING
          </p>
          <h2 className="serif text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight mt-2 sm:mt-3">
            Registration Fee, Service Plans &amp; Policy
          </h2>
          <p className="mt-3 text-xs sm:text-base leading-6 text-white/80 max-w-2xl mx-auto">
            Honest, verified matrimonial matchmaking with absolute clarity. No hidden commission, voluntary registration, and strict privacy protection.
          </p>
        </div>

        {/* 4 Feature Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {policies.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 sm:p-6 backdrop-blur-md flex flex-col justify-between hover:bg-white/15 transition duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-[#E8CA91]">
                      <Icon size={20} />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="serif text-lg font-bold text-white mb-2 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Policy & Legal Disclaimer Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Voluntary Registration & Realistic Expectations */}
          <div className="rounded-2xl border border-[#E8CA91]/30 bg-black/25 p-5 sm:p-7 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2.5 text-[#E8CA91] font-bold text-sm sm:text-base">
              <CheckCircle2 size={18} />
              <span>Voluntary Registration &amp; Honest Disclaimer</span>
            </div>
            <p className="text-xs text-white/85 leading-relaxed">
              <b>Registration Method:</b> Customers register here voluntarily after seeing our advertisement and contacting us. We never force anyone to register here. Only those who are interested may register.
            </p>
            <p className="text-xs text-amber-200/90 leading-relaxed border-t border-white/10 pt-2.5">
              <b>No 100% Guarantee:</b> We do not give any 100% guarantee that we will conduct the marriage. Matrimonial decisions depend upon mutual consent and family compatibility.
            </p>
          </div>

          {/* Strict Privacy, Liability & Legal Disclaimer */}
          <div className="rounded-2xl border border-red-400/30 bg-red-950/40 p-5 sm:p-7 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2.5 text-red-200 font-bold text-sm sm:text-base">
              <ShieldAlert size={18} className="text-red-300" />
              <span>PRIVACY, LIABILITY &amp; LEGAL DISCLAIMER</span>
            </div>
            <p className="text-xs text-white/85 leading-relaxed">
              <b className="text-red-200">No Profile Sharing:</b> Profiles and details sent to you are strictly for your personal use only. You are strictly not allowed to forward, share, or reuse them with anyone else.
            </p>
            <p className="text-xs text-red-200/90 leading-relaxed border-t border-white/10 pt-2.5">
              <b>No Liability &amp; Strict Legal Action:</b> We are not responsible or liable for any consequences, issues, or disputes arising from misuse or unauthorized sharing of profile details. Strict legal action will be taken against violators.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center">
          <button
            onClick={onOpenRegister}
            className="w-full sm:w-auto rounded-full bg-[#C8A96B] px-8 py-3.5 text-xs sm:text-sm font-bold text-[#321b1e] hover:bg-[#e0c58e] tracking-wide cursor-pointer transition shadow-lg flex items-center justify-center gap-2"
          >
            <span>Register Now</span>
            <ArrowRight size={15} />
          </button>

          {onOpenTerms && (
            <button
              onClick={onOpenTerms}
              className="w-full sm:w-auto rounded-full border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/15 px-6 py-3.5 text-xs sm:text-sm font-semibold text-white tracking-wide cursor-pointer transition flex items-center justify-center gap-2"
            >
              <FileText size={15} className="text-[#E8CA91]" />
              <span>Read Full Legal Terms &amp; Disclaimer</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
