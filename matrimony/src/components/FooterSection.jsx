import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  ShieldAlert,
  Phone,
  Mail,
  Clock
} from 'lucide-react'

export default function FooterSection({ onOpenAdmin, onOpenRegister, onOpenTerms }) {
  const callPhone = '(+91) 80755 88406'
  const whatsappPhone = '(+91) 79073 48468'
  const officeTiming = '10:00 AM to 5:00 PM'
  const contactEmail = 'keralakalyanmatrimonial@gmail.com'
  const whatsappLink = 'https://wa.me/917907348468?text=Hello%20Kerala%20Kalyans%20Matrimony%2C%20I%20am%20interested%20in%20registration%20and%20profile%20services.'

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
          <div className="md:col-span-4 space-y-3.5">
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
            <div className="pt-1 text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5 flex-wrap">
              <span>✓ 100% Free for Girls</span>
              <span className="text-white/40">·</span>
              <span>Zero Post-Marriage Commission</span>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <p className="text-[11px] text-[#E8CA91] font-semibold mb-2 uppercase tracking-wider">Connect With Us</p>
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-[#1877F2] text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer shadow-sm"
                  title="Facebook - Kerala Kalyans Matrimony"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-[#E4405F] text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer shadow-sm"
                  title="Instagram - Kerala Kalyans Matrimony"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-[#25D366] text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer shadow-sm"
                  title="WhatsApp - Kerala Kalyans Matrimony"
                  aria-label="WhatsApp"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Details (From Image) */}
          <div className="md:col-span-5 space-y-3.5">
            <h3 className="text-sm sm:text-base font-bold text-[#E8CA91] tracking-wide">
              Official Contact &amp; Support
            </h3>

            {/* Now on WhatsApp Badge */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#25D366]/20 border border-[#25D366]/50 hover:bg-[#25D366]/30 text-white transition group cursor-pointer"
            >
              <div className="h-7 w-7 rounded-full bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition shadow-sm">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Now we&apos;re on WhatsApp!</p>
                <p className="text-[11px] text-emerald-300 font-semibold">{whatsappPhone}</p>
              </div>
            </a>

            <ul className="space-y-2.5 text-xs text-white/80">
              {/* Call Phone */}
              <li className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-[#E8CA91] flex-shrink-0">
                  <Phone size={13} />
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block">Customer Care / Calling</span>
                  <a href="tel:+918075588406" className="font-semibold text-white hover:text-[#E8CA91] transition">
                    {callPhone}
                  </a>
                </div>
              </li>

              {/* WhatsApp Only Phone */}
              <li className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-md bg-[#25D366]/20 flex items-center justify-center text-[#25D366] flex-shrink-0">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block">WhatsApp Only Support</span>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-300 hover:underline">
                    {whatsappPhone}
                  </a>
                </div>
              </li>

              {/* Email Address */}
              <li className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-[#E8CA91] flex-shrink-0">
                  <Mail size={13} />
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block">Email Inquiries &amp; Verification</span>
                  <a href={`mailto:${contactEmail}`} className="font-semibold text-white hover:text-[#E8CA91] transition break-all">
                    {contactEmail}
                  </a>
                </div>
              </li>

              {/* Office Timing */}
              <li className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-[#E8CA91] flex-shrink-0">
                  <Clock size={13} />
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block">Office Working Hours</span>
                  <span className="font-medium text-white/90">
                    {officeTiming}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Legal & Terms Links */}
          <div className="md:col-span-3 space-y-3">
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
                  <FileText size={13} className="text-[#E8CA91] flex-shrink-0" />
                  <span>One-Time Fee Policy</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="hover:text-[#E8CA91] transition cursor-pointer text-left flex items-center gap-1.5"
                >
                  <FileText size={13} className="text-[#E8CA91] flex-shrink-0" />
                  <span>6 Profiles Every Saturday</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="hover:text-[#E8CA91] transition cursor-pointer text-left flex items-center gap-1.5"
                >
                  <FileText size={13} className="text-[#E8CA91] flex-shrink-0" />
                  <span>Voluntary Registration</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenTerms}
                  className="hover:text-red-300 transition cursor-pointer text-left flex items-center gap-1.5 text-red-200/90 font-medium"
                >
                  <ShieldAlert size={13} className="text-red-400 flex-shrink-0" />
                  <span>Privacy &amp; Legal Disclaimer</span>
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenRegister}
                className="w-full rounded-full bg-[#701C35] px-4 py-2 text-xs font-semibold tracking-wide cursor-pointer hover:bg-[#5a1429] transition shadow-md border border-[#701C35]/50 text-center block"
              >
                Join Kerala Kalyans
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
