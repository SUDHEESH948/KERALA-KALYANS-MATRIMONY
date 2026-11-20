import { motion } from 'framer-motion'
import { ShieldCheck, Heart, Users, Star } from 'lucide-react'
import AnimatedCounter from './AnimatedCounter'

export default function TrustSection({ platformStats }) {
  const statsList = [
    { label: 'Verified Profiles', target: platformStats?.verifiedProfiles || 100, suffix: '%', icon: ShieldCheck },
    { label: 'Happy Connections', target: platformStats?.happyConnections || 500, suffix: '+', icon: Heart },
    { label: 'Registered Members', target: platformStats?.registeredMembers || 10, suffix: 'K+', icon: Users },
    { label: 'Trusted Experience', target: platformStats?.trustedExperience || 10, suffix: '+', icon: Star }
  ]

  return (
    <section id="about" className="relative overflow-hidden bg-[#FAF7F1] px-5 py-16 sm:px-6 sm:py-24">
      <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-[#d8bd7b]/50" />
      <div className="mx-auto max-w-[1320px]">
      <div className="mb-9 flex flex-col gap-4 border-b border-[#ded4c2] pb-7 sm:mb-11 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-sans text-[0.7rem] font-bold tracking-[0.22em] text-[#b98231]">BUILT ON TRUST</p>
          <h2 className="font-serif mt-2 text-3xl font-semibold text-[#293130] sm:text-4xl">A more considered way to connect.</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-[#697277]">Thoughtful matchmaking, with care and confidence at every step.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {statsList.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.article
              key={stat.label}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-[22px] border border-[#eadfce] bg-[linear-gradient(145deg,#ffffff,#FAF7F1)] p-5 text-left shadow-[0_14px_30px_rgba(44,54,56,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#c79c18]/70 hover:shadow-[0_20px_36px_rgba(44,54,56,0.14)] sm:p-6"
            >
              <div className="absolute right-0 top-0 size-16 rounded-bl-full bg-[#E8CA91]/70 transition group-hover:bg-[#f1cc4b]/20" />
              <div className="relative flex items-start justify-between">
                <span className="grid size-11 place-items-center rounded-full border border-[#cda74c]/60 bg-[#f8f2e4] text-[#ad7d29] transition group-hover:bg-[#c79c18] group-hover:text-white"><Icon size={21} strokeWidth={1.7} /></span>
                <span className="font-sans text-[0.65rem] font-bold tracking-[0.18em] text-[#a6792e]">0{i + 1}</span>
              </div>
              <h3 className="font-serif relative mt-7 text-4xl font-normal leading-none tracking-tight text-[#701C35] sm:text-[2.8rem]">
                <AnimatedCounter target={stat.target} suffix={stat.suffix} duration={2.2} />
              </h3>
              <p className="font-sans relative mt-3 text-sm font-semibold tracking-wide text-[#465054]">{stat.label}</p>
              <div className="relative mt-5 h-px w-10 bg-[#c79c18]/70 transition-all duration-300 group-hover:w-full" />
            </motion.article>
          )
        })}
      </div>
      <p className="mt-6 text-center font-sans text-[0.68rem] font-semibold tracking-[0.14em] text-[#8b8171]">VERIFIED PLATFORM ASSURANCE · SECURE MATCHMAKING</p>
      </div>
    </section>
  )
}
