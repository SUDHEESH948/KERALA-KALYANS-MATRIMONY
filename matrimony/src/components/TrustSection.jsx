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
    <section id="about" className="mx-auto max-w-[1300px] px-2.5 sm:px-6 pt-10 sm:pt-16 md:pt-20 pb-10 sm:pb-20">
      <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-4">
        {statsList.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl sm:rounded-2xl border border-[#eadfce] bg-white p-3 sm:p-6 text-center transition hover:-translate-y-1 hover:shadow-lg"
            >
              <Icon className="mx-auto mb-1.5 sm:mb-4 text-[#B28D53]" size={20} />
              <h3 className="font-times text-2xl sm:text-4xl lg:text-[42px] font-normal text-[#701C35] leading-none my-1.5 tracking-tight">
                <AnimatedCounter target={stat.target} suffix={stat.suffix} duration={2.2} />
              </h3>
              <p className="font-montserrat mt-1 text-[11px] font-semibold text-gray-600 sm:text-sm tracking-wide">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>
      <p className="font-sans mt-3 text-center text-[10px] sm:text-xs text-gray-400">
        Verified platform assurance & secure matchmaking.
      </p>
    </section>
  )
}
