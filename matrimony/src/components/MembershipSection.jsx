import { Check, Crown, Gem, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'

export default function MembershipSection({ onOpenRegister }) {
  const benefits = [
    { title: 'Private contact access', detail: 'Connect with confidence when a match feels right.' },
    { title: 'Unlimited expressions of interest', detail: 'Make every meaningful introduction count.' },
    { title: 'Priority profile placement', detail: 'Be seen sooner by compatible families.' },
    { title: 'Direct, considered messaging', detail: 'Begin conversations at your own pace.' }
  ]

  return (
    <section id="membership" className="bg-[#FAF7F1] px-3 py-5 text-[#293130] sm:px-6 sm:py-12 lg:px-10">
      <div className="relative isolate mx-auto flex max-w-[1440px] items-center overflow-hidden rounded-[22px] bg-[linear-gradient(145deg,#ffffff,#FAF7F1)] px-5 py-14 sm:min-h-[740px] sm:rounded-[34px] sm:px-10 sm:py-20 lg:min-h-[780px] lg:px-12 lg:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_13%,rgba(209,167,54,0.14),transparent_26%),radial-gradient(circle_at_88%_82%,rgba(163,173,174,0.2),transparent_31%)]" />
        <div className="mx-auto grid w-full max-w-[1320px] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 xl:gap-20">
        <div className="relative">
          <div className="mb-8 flex items-start gap-3 sm:mb-11 sm:items-center sm:gap-5">
            <span className="grid size-14 shrink-0 place-items-center rounded-full border border-[#cda74c]/60 bg-[#f8f2e4] text-[#ad7d29] shadow-[0_0_0_8px_rgba(205,167,76,0.09)] sm:size-16">
              <Crown size={28} strokeWidth={1.45} />
            </span>
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-3">
                <span className="font-sans text-[0.62rem] font-bold tracking-[0.28em] text-[#ad7d29]">INTRODUCING</span>
                <span className="h-px w-8 bg-[#c79c18]/60 sm:w-14" />
              </div>
              <p className="font-serif text-2xl leading-none text-[#293130] sm:whitespace-nowrap sm:text-3xl">The Premier Circle</p>
            </div>
          </div>

          <h2 className="font-serif max-w-2xl text-[2.45rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[#293130] sm:text-5xl lg:text-6xl xl:text-7xl">
            More intention.<br />
            <span className="text-[#701C35]">More possibility.</span>
          </h2>
          <p className="mt-7 max-w-xl text-base leading-8 text-[#697277] sm:text-lg xl:text-xl xl:leading-9">
            A refined membership for those ready to move from introductions to a lasting connection—with more privacy, visibility and personal guidance.
          </p>

          <div className="mt-8 flex flex-col gap-3 border-y border-[#d6d9d7] py-5 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-x-7 sm:gap-y-4 xl:gap-x-10 xl:py-6">
            <div className="flex items-center gap-2.5 text-sm text-[#465054]"><ShieldCheck size={17} className="text-[#ad7d29]" /> Verified community</div>
            <div className="flex items-center gap-2.5 text-sm text-[#465054]"><HeartHandshake size={17} className="text-[#ad7d29]" /> Thoughtful support</div>
          </div>

          <button
            onClick={onOpenRegister}
            className="font-sans mt-8 w-full rounded-full bg-[#701C35] px-8 py-4 text-sm font-bold tracking-wide text-white shadow-[0_12px_35px_rgba(99,32,57,0.18)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#511327] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#701C35] sm:mt-9 sm:w-auto xl:px-10 xl:py-5"
          >
            Explore membership plans
          </button>
        </div>

        <div className="relative rounded-[1.5rem] border border-[#cbd2d2] bg-white/75 p-1.5 shadow-[0_20px_44px_rgba(44,54,56,0.12)] backdrop-blur-md sm:rounded-[2rem] sm:p-3">
          <div className="rounded-[1.55rem] border border-[#dce0df] bg-[linear-gradient(145deg,#ffffff,#FAF7F1)] p-5 sm:p-8">
            <div className="flex flex-col gap-5 border-b border-[#eadfce] pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#701C35] text-[#f5d66d] shadow-lg shadow-[#701C35]/20"><Gem size={22} strokeWidth={1.7} /></span>
                <div>
                  <p className="font-sans text-[0.68rem] font-bold tracking-[0.2em] text-[#ad7d29]">MEMBERSHIP</p>
                  <h3 className="font-serif mt-1 text-2xl font-semibold text-[#293130]">Premier benefits</h3>
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#cda74c]/55 bg-[#f8f2e4] px-3 py-1.5 font-sans text-[0.68rem] font-bold tracking-wider text-[#9d7226]"><Sparkles size={13} /> CURATED</span>
            </div>

            <div className="divide-y divide-[#eadfce]">
              {benefits.map((item, index) => (
                <div key={item.title} className="group flex gap-3 py-5 first:pt-6 sm:gap-5">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-[#cda74c]/60 bg-[#f8f2e4] text-[#ad7d29] transition group-hover:bg-[#c79c18] group-hover:text-white">
                    <Check size={15} strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-start gap-2.5 sm:items-center sm:gap-3"><span className="mt-1 font-sans text-[0.65rem] font-bold tracking-widest text-[#ad7d29] sm:mt-0">0{index + 1}</span><h4 className="text-[0.95rem] font-semibold leading-6 text-[#293130] sm:text-[1.05rem]">{item.title}</h4></div>
                    <p className="mt-1.5 text-sm leading-6 text-[#697277]">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 rounded-2xl bg-[#e8ecec] px-4 py-4 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-[#465054]">Personal matchmaking guidance</p>
              <p className="mt-1 font-sans text-[0.66rem] font-bold tracking-[0.17em] text-[#9d7226] sm:mt-0">INCLUDED WITH PREMIER</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
