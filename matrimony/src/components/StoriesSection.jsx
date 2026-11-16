import { Star } from 'lucide-react'

export default function StoriesSection() {
  return (
    <section id="stories" className="px-3 sm:px-6 py-14 sm:py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 sm:mb-12 text-center">
          <p className="font-montserrat text-xs font-bold tracking-[3px] text-[#B28D53]">LOVE THAT INSPIRES</p>
          <h2 className="serif mt-3 sm:mt-4 text-2xl sm:text-4xl font-bold text-[#701C35]">Beautiful Stories, Happy Beginnings</h2>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-sm">
            <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1000" alt="Wedding celebration" className="h-48 sm:h-64 w-full object-cover"/>
            <div className="p-5 sm:p-8">
              <div className="mb-3 sm:mb-4 flex gap-1 text-[#C8A96B]">
                {[1,2,3,4,5].map(n => <Star key={n} size={15} fill="currentColor"/>)}
              </div>
              <h3 className="serif text-xl sm:text-2xl font-bold text-[#701C35]">A Beautiful New Beginning</h3>
              <p className="font-sans mt-2 sm:mt-3 text-xs sm:text-base leading-6 sm:leading-7 text-gray-500">A sample success story about two people who found a meaningful connection and started a new chapter together.</p>
              <p className="font-montserrat mt-4 sm:mt-5 text-xs sm:text-sm font-semibold text-[#9C8158]">Demo Couple · Kerala</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-sm">
            <img src="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1000" alt="Wedding couple" className="h-48 sm:h-64 w-full object-cover"/>
            <div className="p-5 sm:p-8">
              <div className="mb-3 sm:mb-4 flex gap-1 text-[#C8A96B]">
                {[1,2,3,4,5].map(n => <Star key={n} size={15} fill="currentColor"/>)}
              </div>
              <h3 className="serif text-xl sm:text-2xl font-bold text-[#701C35]">Together, Forever</h3>
              <p className="font-sans mt-2 sm:mt-3 text-xs sm:text-base leading-6 sm:leading-7 text-gray-500">A sample story celebrating trust, understanding, family values, and the joy of finding a life partner.</p>
              <p className="font-montserrat mt-4 sm:mt-5 text-xs sm:text-sm font-semibold text-[#9C8158]">Demo Couple · India</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
