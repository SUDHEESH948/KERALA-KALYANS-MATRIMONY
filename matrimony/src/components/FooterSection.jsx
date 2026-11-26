import { Camera, ChevronDown, Clock3, FileText, Globe2, Mail, Phone, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { emailLink, phoneLink, whatsappLink } from '../config/contact'

const policies = ['One-Time Fee Policy', 'Voluntary Registration']

function WhatsAppIcon({ size = 16, className = '' }) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path fill="currentColor" d="M12.04 2a9.95 9.95 0 0 0-8.58 15.02L2 22l5.11-1.4A9.96 9.96 0 1 0 12.04 2Zm0 18.12a8.13 8.13 0 0 1-4.14-1.13l-.3-.18-3.04.83.81-2.96-.2-.31a8.14 8.14 0 1 1 6.87 3.75Z" />
    <path fill="currentColor" d="M16.5 14.28c-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.54.12-.16.23-.62.76-.76.92-.14.16-.28.18-.52.06a6.51 6.51 0 0 1-1.91-1.18 7.13 7.13 0 0 1-1.32-1.65c-.14-.24-.01-.37.1-.49.1-.1.24-.27.36-.4.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.7 2.6 4.12 3.65.58.25 1.03.4 1.38.5.58.19 1.1.16 1.52.1.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z" />
  </svg>
}

function FooterLink({ icon: Icon, children, href = '#' }) {
  return <a href={href} className="group flex items-center gap-2.5 text-xs text-white/60 transition hover:text-[#E8CA91]">
    <Icon size={14} className="shrink-0 text-[#c79c18] transition group-hover:scale-110" />
    <span className="min-w-0 wrap-anywhere">{children}</span>
  </a>
}

function ContactForm({ contact }) {
  const [details, setDetails] = useState({ name: '', phone: '', email: '', enquiry: 'Profile registration', time: 'Any time', message: '' })

  const submit = (event) => {
    event.preventDefault()
    const message = `Hello Kerala Kalyans Matrimony,\n\nName: ${details.name}\nPhone: ${details.phone}\nEmail: ${details.email || 'Not provided'}\nEnquiry: ${details.enquiry}\nPreferred contact time: ${details.time}\nMessage: ${details.message || 'I would like to know more about your matrimonial services.'}`
    window.location.assign(`${whatsappLink(contact.whatsapp)}?text=${encodeURIComponent(message)}`)
  }

  const fieldClass = 'mt-2 h-12 w-full rounded-xl border border-[#ded5c3] bg-white/70 px-4 text-base font-normal text-[#343a3d] outline-none transition placeholder:text-[#a1a7aa] focus:border-[#701C35] focus:bg-white focus:ring-4 focus:ring-[#701C35]/10'

  return <section className="relative overflow-hidden bg-[#FAF7F1] px-5 py-20 sm:px-6 sm:py-28">
    <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-[#d8bd7b]/55" />
    <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
      <div className="relative pl-6 sm:pl-8 lg:py-3">
        <span className="absolute bottom-auto left-0 top-1 h-28 w-0.5 bg-[#c79c18]" />
        <div className="flex items-center gap-3"><p className="font-sans text-xs font-bold tracking-[.2em] text-[#bc8b37]">GET IN TOUCH</p><span className="h-px w-10 bg-[#c79c18]/60" /></div>
        <h2 className="font-serif mt-5 max-w-md text-4xl font-semibold leading-[1.04] text-[#293130] sm:text-5xl">Let&apos;s find the right beginning.</h2>
        <p className="mt-6 max-w-sm text-base leading-7 text-[#697277]">Tell us a little about what you need. Our support team will receive every detail directly on WhatsApp.</p>
        <p className="mt-5 font-sans text-[length:calc(0.68rem+2px)] font-bold tracking-[.14em] text-[#9b8050]">PRIVATE, RESPECTFUL SUPPORT</p>
        <div className="mt-10 space-y-0 border-t border-[#d9d0bf] text-sm">
          <a href={whatsappLink(contact.whatsapp)} className="flex items-center gap-4 border-b border-[#d9d0bf] py-5 text-[#4d585a] transition hover:text-[#a87815]"><WhatsAppIcon size={25} className="shrink-0 text-[#1c8c58]" /><span><span className="block font-sans text-[length:calc(0.68rem+2px)] font-bold tracking-[.13em] text-[#788084]">WHATSAPP SUPPORT</span><span className="mt-1 block text-lg font-semibold">{contact.whatsapp}</span></span></a>
          <a href={phoneLink(contact.phone)} className="flex items-center gap-4 border-b border-[#d9d0bf] py-5 text-[#4d585a] transition hover:text-[#a87815]"><Phone size={22} strokeWidth={1.7} className="shrink-0 text-[#c79c18]" /><span><span className="block font-sans text-[length:calc(0.68rem+2px)] font-bold tracking-[.13em] text-[#788084]">CUSTOMER CARE</span><span className="mt-1 block text-lg font-semibold">{contact.phone}</span></span></a>
        </div>
      </div>
      <form onSubmit={submit} className="border-t border-[#d9d0bf] pt-7 lg:border-t-0 lg:border-l lg:pl-12 lg:pt-3">
        <div className="mb-8"><div className="flex items-center gap-3"><p className="font-sans text-[length:calc(0.68rem+2px)] font-bold tracking-[.18em] text-[#bc8b37]">PERSONAL CONCIERGE</p><span className="h-px w-9 bg-[#c79c18]/60" /></div><h3 className="font-serif mt-3 text-3xl font-semibold text-[#293130]">Share your details.</h3><p className="mt-2 text-sm leading-6 text-[#788084]">We will open WhatsApp with your enquiry already prepared.</p></div>
        <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
          <label className="font-sans text-xs font-bold tracking-wide text-[#3f4748]">FULL NAME<input required value={details.name} onChange={event => setDetails({ ...details, name: event.target.value })} placeholder="Enter your name" className={fieldClass} /></label>
          <label className="font-sans text-xs font-bold tracking-wide text-[#3f4748]">PHONE NUMBER<input required type="tel" value={details.phone} onChange={event => setDetails({ ...details, phone: event.target.value })} placeholder="Enter phone number" className={fieldClass} /></label>
          <label className="font-sans text-xs font-bold tracking-wide text-[#3f4748]">EMAIL ADDRESS<input type="email" value={details.email} onChange={event => setDetails({ ...details, email: event.target.value })} placeholder="you@example.com" className={fieldClass} /></label>
          <label className="font-sans text-xs font-bold tracking-wide text-[#3f4748]">I NEED HELP WITH<span className="relative block"><select value={details.enquiry} onChange={event => setDetails({ ...details, enquiry: event.target.value })} className={`${fieldClass} appearance-none pr-12`}><option>Profile registration</option><option>Finding matches</option><option>Membership details</option><option>Existing account support</option><option>Other enquiry</option></select><ChevronDown size={18} strokeWidth={1.8} className="pointer-events-none absolute right-4 top-[calc(50%+0.25rem)] -translate-y-1/2 text-[#66736b]" /></span></label>
          <label className="font-sans text-xs font-bold tracking-wide text-[#3f4748] sm:col-span-2">PREFERRED CONTACT TIME<span className="relative block"><select value={details.time} onChange={event => setDetails({ ...details, time: event.target.value })} className={`${fieldClass} appearance-none pr-12`}><option>Any time</option><option>10:00 AM – 1:00 PM</option><option>1:00 PM – 3:00 PM</option><option>3:00 PM – 5:00 PM</option></select><ChevronDown size={18} strokeWidth={1.8} className="pointer-events-none absolute right-4 top-[calc(50%+0.25rem)] -translate-y-1/2 text-[#66736b]" /></span></label>
        </div>
        <label className="mt-5 block font-sans text-xs font-bold tracking-wide text-[#3f4748]">MESSAGE<textarea value={details.message} onChange={event => setDetails({ ...details, message: event.target.value })} rows="4" placeholder="Tell us what you are looking for" className="mt-2 w-full resize-none rounded-xl border border-[#ded5c3] bg-white/70 px-4 py-3 text-base font-normal text-[#343a3d] outline-none transition placeholder:text-[#a1a7aa] focus:border-[#701C35] focus:bg-white focus:ring-4 focus:ring-[#701C35]/10" /></label>
        <button type="submit" className="mt-7 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#701C35] px-6 text-sm font-bold tracking-wide text-white shadow-[0_12px_24px_rgba(41,49,48,0.16)] transition hover:-translate-y-0.5 hover:bg-[#511327] hover:text-white"><WhatsAppIcon size={19} />Continue on WhatsApp</button>
      </form>
    </div>
  </section>
}

export default function FooterSection({ onOpenRegister, onOpenTerms, contact }) {
  return (
    <>
    <ContactForm contact={contact} />
    <footer className="bg-[#701C35] px-4 py-10 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-9 border-b border-white/10 pb-9 sm:gap-10 lg:grid-cols-[1.25fr_.9fr_.9fr]">
          <section>
            <img src="/kerala-kalyan-logo.png" alt="Kerala Kalyans Matrimony" className="h-12 w-auto rounded-lg bg-white p-1.5 mix-blend-normal" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/60">Meaningful matrimonial connections built with trust, care, and transparency.</p>
            <div className="mt-5 flex items-center gap-2.5">
              <a href="#" aria-label="Facebook" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/55 transition hover:border-[#c79c18] hover:text-[#E8CA91]"><Globe2 size={15} /></a>
              <a href="#" aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/55 transition hover:border-[#c79c18] hover:text-[#E8CA91]"><Camera size={15} /></a>
              <a href={whatsappLink(contact.whatsapp)} aria-label="WhatsApp" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/55 transition hover:border-[#c79c18] hover:text-[#E8CA91]"><WhatsAppIcon size={16} /></a>
            </div>
          </section>

          <section>
            <h3 className="font-sans text-xs font-bold tracking-[.16em] text-[#E8CA91] uppercase">Support</h3>
            <div className="mt-5 space-y-3.5">
              <FooterLink icon={Phone} href={phoneLink(contact.phone)}>{contact.phone}</FooterLink>
              <FooterLink icon={WhatsAppIcon} href={whatsappLink(contact.whatsapp)}>{contact.whatsapp}</FooterLink>
              <FooterLink icon={Mail} href={emailLink(contact.email)}>{contact.email}</FooterLink>
              <div className="flex items-center gap-2.5 text-xs text-white/60"><Clock3 size={14} className="shrink-0 text-[#c79c18]" />10:00 AM – 5:00 PM</div>
            </div>
          </section>

          <section>
            <h3 className="font-sans text-xs font-bold tracking-[.16em] text-[#E8CA91] uppercase">Information</h3>
            <div className="mt-5 space-y-3.5">
              {policies.map(policy => (
                <button key={policy} type="button" onClick={onOpenTerms} className="group flex items-center gap-2.5 text-left text-xs text-white/60 transition hover:text-[#E8CA91]">
                  <FileText size={14} className="shrink-0 text-[#c79c18] transition group-hover:scale-110" />
                  {policy}
                </button>
              ))}
              <FooterLink icon={ShieldCheck} href="#legal-notice">Privacy &amp; Legal Notice</FooterLink>
            </div>
            <button onClick={onOpenRegister} className="mt-6 rounded-full border border-[#c79c18]/70 px-4 py-2 text-xs font-semibold text-[#E8CA91] transition hover:bg-[#511327] hover:text-white">Create your profile</button>
          </section>
        </div>

        <div id="legal-notice" className="border-b border-white/10 py-5 text-[13px] leading-5 text-white/40">
          <span className="font-semibold text-white/60">Privacy notice:</span> Profiles and details are for personal matrimonial use only. Registration is voluntary; Kerala Kalyans Matrimony does not guarantee marriage outcomes.
        </div>

        <div className="flex flex-col gap-2 pt-5 text-[13px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Kerala Kalyans Matrimony. All rights reserved.</span>
          <span className="tracking-wide text-white">Developed by <span className="font-semibold">Winshine Infotech</span></span>
        </div>
      </div>
    </footer>
    </>
  )
}
