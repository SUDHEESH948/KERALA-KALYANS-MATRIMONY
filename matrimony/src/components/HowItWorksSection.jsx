import { Users, Search, Heart } from 'lucide-react'

export default function HowItWorksSection() {
  const steps = [
    [Users, '01', 'Create Your Profile', 'Share your details, interests, and dreams to introduce yourself.'],
    [Search, '02', 'Discover Matches', 'Explore compatible profiles and find someone special.'],
    [Heart, '03', 'Connect & Begin', 'Express interest, start conversations, and build your future.']
  ]

  return (
    <section id="how-it-works" className="font-raleway px-3 sm:px-6 py-14 sm:py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 sm:mb-16 text-center">
          <p className="font-raleway text-xs font-bold tracking-[3px] text-[#c79c18] uppercase">SIMPLE & MEANINGFUL</p>
          <h2 className="font-raleway mt-3 sm:mt-4 text-2xl sm:text-4xl font-bold text-[#343a3d] tracking-tight">How It Works</h2>
          <p className="font-raleway mt-2 sm:mt-4 text-xs sm:text-base text-gray-500 font-medium">Three simple steps to your forever story.</p>
        </div>

        <div className="grid gap-6 sm:gap-10 md:grid-cols-3">
          {steps.map(([Icon, number, title, description]) => (
            <div key={number} className="relative rounded-xl sm:rounded-2xl bg-white p-6 sm:p-10 text-center shadow-xs hover:shadow-lg transition duration-300 border border-[#dce0e1]">
              <span className="font-raleway absolute right-4 top-4 sm:right-6 sm:top-5 text-3xl sm:text-4xl font-extrabold text-[#e7e9e9]">{number}</span>
              <div className="mx-auto mb-4 sm:mb-6 flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#f7f1dc] text-[#b78b12] shadow-xs">
                <Icon size={26} className="sm:hidden" />
                <Icon size={32} className="hidden sm:block" />
              </div>
              <h3 className="font-raleway text-xl sm:text-2xl font-bold text-[#343a3d] tracking-tight">{title}</h3>
              <p className="font-raleway mt-3 sm:mt-4 text-xs sm:text-base leading-6 sm:leading-7 text-gray-600 font-normal">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
