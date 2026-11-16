import { Crown, ArrowRight, Check } from 'lucide-react'

export default function MembershipSection({ onOpenRegister }) {
  const benefits = [
    'View contact details',
    'Unlimited profile interests',
    'Priority profile visibility',
    'Direct messaging',
    'Personalized matchmaking assistance'
  ]

  return (
    <section id="membership" className="bg-[#701C35] px-2.5 sm:px-6 py-10 sm:py-24 text-white">
      <div className="mx-auto grid max-w-[1200px] items-center gap-6 sm:gap-12 lg:grid-cols-2">
        <div>
          <Crown size={28} className="mb-3 sm:mb-6 text-[#E8CA91] sm:size-10"/>
          <p className="font-montserrat text-xs font-bold tracking-[3px] text-[#E8CA91]">A LITTLE MORE SPECIAL</p>
          <h2 className="serif mt-2 sm:mt-5 text-xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Your Perfect Match Deserves a Premium Experience
          </h2>
          <p className="font-sans mt-3 sm:mt-6 text-xs sm:text-base leading-6 sm:leading-8 text-white/75">
            Enjoy a more personal matchmaking experience with premium membership benefits.
          </p>
          <button
            onClick={onOpenRegister}
            className="font-montserrat mt-5 sm:mt-9 w-full sm:w-auto rounded-full bg-[#C8A96B] px-5 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold text-[#321b1e] transition hover:bg-[#e0c58e] tracking-wide cursor-pointer shadow-lg text-center"
          >
            Explore Membership Plans <ArrowRight size={14} className="ml-1.5 sm:ml-2 inline"/>
          </button>
        </div>

        <div className="rounded-xl sm:rounded-3xl border border-white/20 bg-white/10 p-4 sm:p-8 backdrop-blur">
          {benefits.map(item => (
            <div key={item} className="flex items-center gap-3 sm:gap-4 border-b border-white/10 py-3.5 sm:py-5 last:border-0 text-xs sm:text-base">
              <div className="rounded-full bg-[#C8A96B] p-1.5 sm:p-2 text-[#701C35] flex-shrink-0">
                <Check size={14} className="sm:size-4"/>
              </div>
              <p className="font-sans font-medium">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
