import { Heart, Quote, Star } from 'lucide-react'

const Stars = () => (
  <div className="flex gap-1 text-[#c79c18]" aria-label="5 out of 5 stars">
    {[1, 2, 3, 4, 5].map(star => <Star key={star} size={15} fill="currentColor" strokeWidth={1.5} />)}
  </div>
)

export default function StoriesSection() {
  return (
    <section id="stories" className="bg-[#FAF7F1] px-3 py-14 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-9 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-sans text-xs font-bold tracking-[3px] text-[#c79c18]">REAL STORIES, REAL JOY</p>
            <h2 className="font-serif mt-3 text-3xl font-bold leading-[1.08] text-[#343a3d] sm:text-5xl">Love stories worth celebrating.</h2>
          </div>
          <p className="max-w-sm font-sans text-sm leading-6 text-[#697277] sm:text-base">Every connection begins with a conversation. Here are a few moments our members cherish.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-12 md:gap-6">
          <article className="relative isolate flex min-h-[410px] overflow-hidden rounded-[28px] bg-[#701C35] p-6 text-white shadow-[0_20px_45px_rgba(36,42,45,0.18)] sm:min-h-[500px] sm:p-9 md:col-span-7">
            <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&auto=format&fit=crop" alt="Couple celebrating their wedding" className="absolute inset-0 -z-20 h-full w-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#511327]/95 via-[#511327]/35 to-black/5" />
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/15 backdrop-blur-sm"><Heart size={18} className="text-[#E8CA91]" /></div>
            <div className="mt-auto max-w-xl">
              <Stars />
              <blockquote className="font-serif mt-4 text-2xl font-bold leading-tight sm:text-4xl">“We found more than a match. We found a future we both believed in.”</blockquote>
              <p className="mt-5 font-sans text-xs font-semibold tracking-[.08em] text-white/80">ANJALI & ARUN · KOCHI</p>
            </div>
          </article>

          <div className="grid gap-5 md:col-span-5 md:grid-rows-[1.1fr_.9fr] md:gap-6">
            <article className="relative overflow-hidden rounded-[28px] border border-[#dfd7c6] bg-[#fffdf8] p-6 shadow-[0_16px_35px_rgba(36,42,45,0.08)] sm:p-8">
              <Quote size={38} strokeWidth={1.4} className="absolute right-6 top-6 text-[#c79c18]/25" />
              <Stars />
              <p className="font-serif mt-5 text-2xl font-bold leading-tight text-[#343a3d] sm:text-3xl">A thoughtful, safe space to begin a beautiful journey.</p>
              <div className="mt-6 border-t border-[#e7decb] pt-4">
                <p className="font-sans text-sm font-bold text-[#343a3d]">Nithin & Devika</p>
                <p className="mt-1 text-xs text-[#788084]">Thrissur, Kerala</p>
              </div>
            </article>

            <article className="relative isolate min-h-[210px] overflow-hidden rounded-[28px] bg-[#343a3d] p-6 text-white shadow-[0_16px_35px_rgba(36,42,45,0.13)] sm:p-8">
              <img src="https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1000&auto=format&fit=crop" alt="Couple walking together" className="absolute inset-0 -z-20 h-full w-full object-cover" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
              <div className="flex h-full max-w-[250px] flex-col justify-end">
                <Stars />
                <p className="font-serif mt-3 text-2xl font-bold leading-tight">Together, forever.</p>
                <p className="mt-2 font-sans text-[11px] font-semibold tracking-[.08em] text-white/75">MAYA & VIVEK · BENGALURU</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
