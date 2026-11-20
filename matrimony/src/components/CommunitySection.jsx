import DepthCarousel from './DepthCarousel'

const categories = [
  { title: 'Hindu Matrimony', image: '/hindu-wedding.jpg', alt: 'Hindu wedding couple' },
  { title: 'Christian Matrimony', image: '/christian-wedding.jpg', alt: 'Christian wedding couple' },
  { title: 'Muslim Matrimony', image: '/muslim-wedding.jpg', alt: 'Muslim wedding couple' },
  { title: 'NRI Matrimony', image: '/nri-matrimony.jpg', alt: 'NRI wedding couple' }
]

export default function CommunitySection() {
  return (
    <section id="community" className="overflow-hidden bg-[#FAF7F1] px-5 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10 grid gap-6 border-b border-[#e2d7c4] pb-8 sm:mb-14 sm:grid-cols-[1fr_.7fr] sm:items-end">
          <div>
            <p className="font-sans text-[0.7rem] font-bold tracking-[0.24em] text-[#bc8b37]">EXPLORE CONNECTIONS</p>
            <h2 className="font-serif mt-3 text-4xl font-semibold leading-[1.05] text-[#303638] sm:text-5xl">Matrimony by<br className="hidden sm:block" /> community.</h2>
          </div>
          <p className="max-w-md text-base leading-7 text-[#697277] sm:justify-self-end">Find a space that reflects your traditions, values and hopes for the future.</p>
        </div>

        <DepthCarousel items={categories} depth={78} spread={52} tilt={8} visibleCards={4} />
      </div>
    </section>
  )
}
