import { ArrowRight } from 'lucide-react'

const categories = [
  { name: 'Hindu Matrimony', image: '/hindu-wedding.jpg' },
  { name: 'Christian Matrimony', image: '/christian-wedding.jpg' },
  { name: 'Muslim Matrimony', image: '/muslim-wedding.jpg' },
  { name: 'NRI Matrimony', image: '/nri-matrimony.jpg' }
]

export default function CommunitySection() {
  return (
    <section id="community" className="bg-white px-2.5 sm:px-6 py-10 sm:py-24">
      <div className="mx-auto max-w-[1300px]">
        <div className="mb-6 sm:mb-12 text-center">
          <p className="font-montserrat text-xs font-bold tracking-[3px] text-[#B28D53]">EXPLORE CONNECTIONS</p>
          <h2 className="serif mt-2 sm:mt-4 text-xl sm:text-4xl font-bold text-[#701C35]">Matrimony By Community</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-4">
          {categories.map(category => (
            <a href="#community" key={category.name} className="group relative h-44 sm:h-72 overflow-hidden rounded-xl sm:rounded-2xl">
              <img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"/>
              <div className="absolute bottom-3 left-2.5 right-2.5 sm:bottom-6 sm:left-5 sm:right-5">
                <h3 className="serif text-xs sm:text-xl font-bold text-white leading-tight">{category.name}</h3>
                <span className="font-montserrat mt-1 sm:mt-2 inline-flex items-center text-[10px] sm:text-sm font-semibold text-[#E8CA91]">
                  Explore <ArrowRight size={11} className="ml-1 sm:ml-2 sm:size-3.5"/>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
