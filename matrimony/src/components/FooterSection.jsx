import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'

export default function FooterSection({ onOpenAdmin, onOpenRegister }) {
  return (
    <>
      {/* FINAL CTA */}
      <section className="relative px-2.5 sm:px-6 py-12 sm:py-28 text-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600"
            alt="" className="h-full w-full object-cover"/>
          <div className="absolute inset-0 bg-[#2a111b]/80"/>
        </div>

        <div className="relative mx-auto max-w-3xl">
          <Sparkles className="mx-auto mb-3 sm:mb-6 text-[#E8CA91]" size={26}/>
          <h2 className="serif text-xl sm:text-4xl font-bold text-white sm:text-6xl leading-tight">
            Your Forever Story Starts Today.
          </h2>
          <p className="font-sans mt-3 sm:mt-6 text-xs sm:text-lg text-white/80">
            Take the first step towards finding someone truly special.
          </p>
          <button
            onClick={onOpenRegister}
            className="font-montserrat mt-5 sm:mt-9 w-full sm:w-auto rounded-full bg-[#C8A96B] px-5 sm:px-10 py-3 sm:py-4 text-xs sm:text-base font-bold text-[#321b1e] hover:bg-[#e0c58e] tracking-wide cursor-pointer transition shadow-lg text-center"
          >
            Create Your Profile <ArrowRight className="ml-1.5 sm:ml-2 inline" size={15}/>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#24151A] px-2.5 sm:px-6 py-10 sm:py-16 text-white">
        <div className="mx-auto flex flex-col md:flex-row items-start justify-between max-w-[1300px] gap-8 sm:gap-12">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/kerala-kalyan-logo.png"
                alt="Kerala Kalyans Matrimony"
                className="h-11 w-auto object-contain bg-white rounded-lg p-1.5 shadow-md"
              />
              <div>
                <h2 className="serif text-xl sm:text-2xl font-bold text-[#E8CA91]">Kerala Kalyans</h2>
                <p className="font-inter text-[9px] tracking-[2px] text-white/70 font-semibold uppercase">Matrimony</p>
              </div>
            </div>
            <p className="font-sans mt-3 sm:mt-5 text-xs sm:text-sm leading-6 sm:leading-7 text-white/60">
              Bringing hearts together through meaningful connections,
              trust, and beautiful beginnings.
            </p>
          </div>

          <div>
            <h3 className="font-montserrat mb-3 sm:mb-5 text-sm sm:text-base font-bold text-[#E8CA91] tracking-wide">Get Started</h3>
            <p className="font-sans text-xs sm:text-sm leading-6 sm:leading-7 text-white/60">
              Begin your journey and discover meaningful connections.
            </p>
            <button
              onClick={onOpenRegister}
              className="font-montserrat mt-4 sm:mt-5 rounded-full bg-[#701C35] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold tracking-wide cursor-pointer hover:bg-[#5a1429] transition shadow-md"
            >
              Join Kerala Kalyans
            </button>
          </div>
        </div>

        <div className="font-sans mx-auto mt-10 sm:mt-14 max-w-[1300px] border-t border-white/10 pt-6 sm:pt-7 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-xs text-white/40">
          <span>© 2026 Kerala Kalyans Matrimony. All rights reserved.</span>
          <button
            onClick={onOpenAdmin}
            className="text-white/50 hover:text-[#E8CA91] transition flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <ShieldCheck size={13} className="text-[#E8CA91]" />
            <span>Admin Control Panel</span>
          </button>
        </div>
      </footer>
    </>
  )
}
