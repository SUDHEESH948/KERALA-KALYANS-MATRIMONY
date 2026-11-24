import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileText,
  UserCheck,
  Lock,
  HeartHandshake
} from 'lucide-react'

export default function TermsPolicyDialog({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-[#eadfce] overflow-hidden my-4 text-gray-800"
        >
          {/* Header Banner */}
          <div className="bg-[#e2b82f] px-5 sm:px-6 py-4 text-[#332500] flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/kerala-kalyan-logo.png"
                alt="Kerala Kalyans Matrimony"
                className="h-9 w-auto object-contain bg-white rounded-lg p-1 flex-shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl leading-tight truncate">
                  Terms, Policy &amp; Legal Disclaimer
                </h3>
                <p className="text-[12px] text-[#573b0b] font-semibold tracking-wide uppercase truncate">
                  Kerala Kalyans Matrimony · Official Guidelines
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-[#332500] transition cursor-pointer flex-shrink-0"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto space-y-5 text-xs sm:text-sm">
            {/* 1. Registration Fee & Free for Girls */}
            <div className="rounded-xl border border-[#e6cd8d] bg-[#fff9e9] p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#573b0b] font-bold text-sm sm:text-base">
                <CheckCircle2 size={18} className="text-[#795705] flex-shrink-0" />
                <span>Registration Fee &amp; Free Registration for Girls</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-700 leading-relaxed pl-1">
                <li>
                  <b>One-Time Registration Fee:</b> Only a one-time registration fee is charged. The registration fee is strictly non-refundable.
                </li>
                <li>
                  <b>Free Registration for Girls:</b> Registration is completely free for girls&apos; profiles. No registration or renewal fees apply to women candidates.
                </li>
              </ul>
            </div>

            {/* 2. Profile Services & Zero Extra Fees */}
            <div className="rounded-xl border border-[#e6cd8d] bg-[#fff9e9] p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#573b0b] font-bold text-sm sm:text-base">
                <Calendar size={18} className="text-[#795705] flex-shrink-0" />
                <span>Profile Services &amp; No Hidden Commission</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-700 leading-relaxed pl-1">
                <li>
                  <b>Profile Services:</b> During the 3-month registration period, <b>6 verified profiles will be sent every Saturday</b>.
                </li>
                <li>
                  <b>No Extra Fees / Zero Commission:</b> Once the marriage is fixed, you do <b>not</b> need to pay any extra payments like ₹25,000 or ₹50,000, or any hidden charges. We do not demand any success commission.
                </li>
              </ul>
            </div>

            {/* 3. Voluntary Registration & No 100% Guarantee */}
            <div className="rounded-xl border border-[#e6cd8d] bg-[#fff9e9] p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#573b0b] font-bold text-sm sm:text-base">
                <HeartHandshake size={18} className="text-[#573b0b] flex-shrink-0" />
                <span>Voluntary Registration &amp; Realistic Expectations</span>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-700 leading-relaxed pl-1">
                <li>
                  <b>No 100% Guarantee:</b> We do not give any 100% guarantee that we will conduct the marriage. Matchmaking decisions and outcomes depend entirely upon mutual compatibility, personal consent, and family decisions.
                </li>
                <li>
                  <b>Registration Method:</b> Customers register here voluntarily after seeing our advertisement and contacting us. We never force anyone to register here. Only those who are genuinely interested may register.
                </li>
              </ul>
              <section aria-label="Membership rules" className="space-y-2.5 border-t border-[#e6cd8d] pt-3 text-xs leading-relaxed text-gray-700">
                <h3 className="text-sm font-bold text-[#573b0b]">Membership Rules</h3>
                <p>
                  Access expires at the first limit. The server applies both limits to each active membership:
                  <strong> 6 months from activation</strong> or <strong>145 distinct profile detail openings</strong>,
                  whichever comes first.
                </p>
                <ul className="space-y-2">
                  <li><strong>Browse or search.</strong> You can view search results without using your allowance.</li>
                  <li><strong>Open or reopen.</strong> Only the first full-detail opening of each profile counts.</li>
                  <li><strong>Open the 145th profile.</strong> The final profile opens, then all further profile access ends.</li>
                  <li><strong>Reach 6 months first.</strong> Access ends automatically even if profile views remain.</li>
                </ul>
                <p>Your view count and expiry date carry over when you change devices or sign in again.</p>
              </section>
            </div>

            {/* 4. PRIVACY, LIABILITY & LEGAL DISCLAIMER */}
            <div className="rounded-xl border border-[#e6cd8d] bg-[#fff9e9] p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-[#573b0b] font-bold text-sm sm:text-base">
                <ShieldAlert size={18} className="text-[#795705] flex-shrink-0" />
                <span>PRIVACY, LIABILITY &amp; LEGAL DISCLAIMER</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-700 leading-relaxed pl-1">
                <li className="flex items-start gap-2">
                  <Lock size={14} className="text-[#795705] flex-shrink-0 mt-0.5" />
                  <span>
                    <b>No Profile Sharing:</b> The profiles and details sent to you are strictly for your personal matrimonial use only. You are strictly not allowed to forward, share, publish, screenshot, or reuse them with anyone else.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-[#795705] flex-shrink-0 mt-0.5" />
                  <span>
                    <b>No Liability:</b> We are not responsible or liable for any consequences, issues, misunderstandings, or disputes arising from the misuse or unauthorized sharing of profile details provided by us. The user takes complete responsibility.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldAlert size={14} className="text-[#795705] flex-shrink-0 mt-0.5" />
                  <span>
                    <b>Strict Legal Action:</b> Strict legal action will be taken against those who misuse the profile information or violate these privacy and data protection terms.
                  </span>
                </li>
              </ul>
            </div>

            {/* Bottom confirmation message */}
            <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 text-center text-xs text-gray-500 font-medium">
              By proceeding with registration on Kerala Kalyans Matrimony, you acknowledge that you have read, understood, and agreed to all the terms stated above.
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-[#FAF7F1] border-t border-[#eadfce] px-5 sm:px-6 py-3.5 flex items-center justify-between">
            <span className="text-[13px] text-gray-500 font-medium hidden sm:inline">
              Kerala Kalyans Matrimony · Transparent &amp; Secure
            </span>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 rounded-xl bg-[#e2b82f] hover:bg-[#d4aa25] text-[#332500] font-semibold text-xs transition cursor-pointer shadow-sm ml-auto"
            >
              I Understand &amp; Agree
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
