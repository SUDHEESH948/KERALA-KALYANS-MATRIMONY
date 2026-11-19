import { motion } from 'framer-motion'
import { Search, ChevronDown, X } from 'lucide-react'

export default function HeroSection({
  lookingFor,
  setLookingFor,
  ageFrom,
  setAgeFrom,
  ageTo,
  setAgeTo,
  religion,
  setReligion,
  motherTongue,
  setMotherTongue,
  mobileSearchOpen,
  setMobileSearchOpen,
  searchProfiles,
  currentMember,
  onOpenMatches
}) {
  return (
    <section className="hero-100vh relative flex flex-col justify-end overflow-hidden bg-[#211016] pb-10 sm:pb-14 lg:pb-16">
      {/* Desktop Background Image */}
      <img
        src="/Gemini_Generated_Image_hlp8u6hlp8u6hlp8.png"
        alt="Matrimony Home Desktop"
        className="hidden md:block absolute inset-0 h-full w-full object-cover object-[center_15%]"
      />

      {/* Mobile Background Image */}
      <img
        src="/erasio_Gemini_Generated_Image_yr2m55yr2m55yr2m (1).png"
        alt="Matrimony Home Mobile"
        className="block md:hidden absolute inset-0 h-full w-full object-cover object-top"
      />

      {/* Elegant Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/15 pointer-events-none" />

      {/* CONTENT & SEARCH BAR OVERLAY */}
      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-3 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="hero-heading text-white drop-shadow-lg">
            Choose <span className="whitespace-nowrap">Your Forever</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base md:text-lg text-white/95 font-normal drop-shadow max-w-xs sm:max-w-md mx-auto">
            Find love on your terms with millions of verified profiles
          </p>

          {/* DESKTOP SEARCH BAR */}
          <div id="search" className="hidden md:block mt-8 mx-auto w-full max-w-[1100px] rounded-lg bg-black/55 backdrop-blur-md p-4 border border-white/15 shadow-2xl">
            <div className="flex items-end gap-3 text-left">
              {/* I'm looking for a */}
              <div className="min-w-0 flex-1 lg:min-w-[140px]">
                <label className="mb-1 block text-xs text-white/90 font-medium">I&apos;m looking for a</label>
                <div className="relative">
                  <select
                    value={lookingFor}
                    onChange={e => setLookingFor(e.target.value)}
                    className="w-full appearance-none rounded bg-white px-3 py-2.5 text-sm font-medium text-gray-800 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#3aa8c1]"
                  >
                    <option value="Woman">Woman</option>
                    <option value="Man">Man</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                </div>
              </div>

              {/* aged ... to ... */}
              <div className="min-w-[120px] flex-1 lg:min-w-[170px]">
                <label className="mb-1 block text-xs text-white/90 font-medium">aged</label>
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <select
                      value={ageFrom}
                      onChange={e => setAgeFrom(e.target.value)}
                      className="w-full appearance-none rounded bg-white px-2.5 py-2.5 text-sm font-medium text-gray-800 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#3aa8c1]"
                    >
                      {Array.from({ length: 53 }, (_, i) => 18 + i).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  </div>
                  <span className="text-xs text-white/90 font-medium px-0.5">to</span>
                  <div className="relative flex-1">
                    <select
                      value={ageTo}
                      onChange={e => setAgeTo(e.target.value)}
                      className="w-full appearance-none rounded bg-white px-2.5 py-2.5 text-sm font-medium text-gray-800 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#3aa8c1]"
                    >
                      {Array.from({ length: 53 }, (_, i) => 18 + i).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  </div>
                </div>
              </div>

              {/* of religion */}
              <div className="min-w-0 flex-1 lg:min-w-[150px]">
                <label className="mb-1 block text-xs text-white/90 font-medium">of religion</label>
                <div className="relative">
                  <select
                    value={religion}
                    onChange={e => setReligion(e.target.value)}
                    className="w-full appearance-none rounded bg-white px-3 py-2.5 text-sm font-medium text-gray-800 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#3aa8c1]"
                  >
                    <option value="Select">Select</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Jain">Jain</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Parsi">Parsi</option>
                    <option value="Jewish">Jewish</option>
                    <option value="Any">Any Religion</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                </div>
              </div>

              {/* and mother tongue */}
              <div className="min-w-0 flex-1 lg:min-w-[160px]">
                <label className="mb-1 block text-xs text-white/90 font-medium">and mother tongue</label>
                <div className="relative">
                  <select
                    value={motherTongue}
                    onChange={e => setMotherTongue(e.target.value)}
                    className="w-full appearance-none rounded bg-white px-3 py-2.5 text-sm font-medium text-gray-800 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#3aa8c1]"
                  >
                    <option value="Select">Select</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Odia">Odia</option>
                    <option value="Urdu">Urdu</option>
                    <option value="English">English</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                </div>
              </div>

              {/* Let's Begin Button */}
              <div className="w-auto">
                <button
                  onClick={searchProfiles}
                  className="h-[42px] px-4 lg:px-8 rounded bg-[#3aa8c1] hover:bg-[#3296ad] active:bg-[#2b8296] text-white text-sm lg:text-base flex items-center justify-center transition shadow cursor-pointer whitespace-nowrap tracking-[0.01em]"
                >
                  {currentMember ? 'Explore My Matches' : "Let's Begin"}
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE SEARCH TRIGGER & EXPANDABLE CARD */}
          <div className="block md:hidden mt-4">
            {!mobileSearchOpen ? (
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    if (currentMember) {
                      if (onOpenMatches) onOpenMatches(currentMember)
                      else window.location.hash = '#matches'
                    } else {
                      setMobileSearchOpen(true)
                    }
                  }}
                  className="flex items-center gap-2 rounded-full bg-[#3aa8c1] hover:bg-[#3296ad] px-4 sm:px-5 py-2.5 sm:py-3 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-black/60 transition active:scale-95 cursor-pointer border border-white/25 max-w-[260px] sm:max-w-[280px] tracking-wide"
                  aria-label="Expand search options"
                >
                  <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-white/20 flex-shrink-0">
                    <Search size={13} />
                  </div>
                  <span>{currentMember ? 'View My Matches' : 'Find Your Match'}</span>
                  <ChevronDown size={15} className="text-white/80" />
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="mx-auto w-full max-w-[340px] rounded-xl sm:rounded-2xl bg-black/85 backdrop-blur-lg p-3 sm:p-5 border border-white/20 shadow-2xl text-left"
              >
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/15">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs sm:text-sm">
                    <Search size={15} className="text-[#3aa8c1]" />
                    <span>Search Profiles</span>
                  </div>
                  <button
                    onClick={() => setMobileSearchOpen(false)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition cursor-pointer"
                    aria-label="Close search"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* I'm looking for a */}
                  <div>
                    <label className="mb-1 block text-[11px] sm:text-xs text-white/90 font-medium">I&apos;m looking for a</label>
                    <div className="relative">
                      <select
                        value={lookingFor}
                        onChange={e => setLookingFor(e.target.value)}
                        className="w-full appearance-none rounded bg-white px-2.5 py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#3aa8c1]"
                      >
                        <option value="Woman">Woman</option>
                        <option value="Man">Man</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    </div>
                  </div>

                  {/* aged */}
                  <div>
                    <label className="mb-1 block text-[11px] sm:text-xs text-white/90 font-medium">aged</label>
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <select
                          value={ageFrom}
                          onChange={e => setAgeFrom(e.target.value)}
                          className="w-full appearance-none rounded bg-white px-2 py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#3aa8c1]"
                        >
                          {Array.from({ length: 53 }, (_, i) => 18 + i).map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
                      </div>
                      <span className="text-[11px] sm:text-xs text-white/90 font-medium px-0.5">to</span>
                      <div className="relative flex-1">
                        <select
                          value={ageTo}
                          onChange={e => setAgeTo(e.target.value)}
                          className="w-full appearance-none rounded bg-white px-2 py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#3aa8c1]"
                        >
                          {Array.from({ length: 53 }, (_, i) => 18 + i).map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
                      </div>
                    </div>
                  </div>

                  {/* of religion */}
                  <div>
                    <label className="mb-1 block text-[11px] sm:text-xs text-white/90 font-medium">of religion</label>
                    <div className="relative">
                      <select
                        value={religion}
                        onChange={e => setReligion(e.target.value)}
                        className="w-full appearance-none rounded bg-white px-2.5 py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#3aa8c1]"
                      >
                        <option value="Select">Select</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Muslim">Muslim</option>
                        <option value="Christian">Christian</option>
                        <option value="Sikh">Sikh</option>
                        <option value="Jain">Jain</option>
                        <option value="Buddhist">Buddhist</option>
                        <option value="Parsi">Parsi</option>
                        <option value="Jewish">Jewish</option>
                        <option value="Any">Any Religion</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    </div>
                  </div>

                  {/* and mother tongue */}
                  <div>
                    <label className="mb-1 block text-[11px] sm:text-xs text-white/90 font-medium">and mother tongue</label>
                    <div className="relative">
                      <select
                        value={motherTongue}
                        onChange={e => setMotherTongue(e.target.value)}
                        className="w-full appearance-none rounded bg-white px-2.5 py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#3aa8c1]"
                      >
                        <option value="Select">Select</option>
                        <option value="Malayalam">Malayalam</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Telugu">Telugu</option>
                        <option value="Kannada">Kannada</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Marathi">Marathi</option>
                        <option value="Bengali">Bengali</option>
                        <option value="Gujarati">Gujarati</option>
                        <option value="Punjabi">Punjabi</option>
                        <option value="Odia">Odia</option>
                        <option value="Urdu">Urdu</option>
                        <option value="English">English</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    </div>
                  </div>

                  {/* Let's Begin Button */}
                  <button
                    onClick={searchProfiles}
                    className="w-full h-10 mt-1 rounded bg-[#3aa8c1] hover:bg-[#3296ad] active:bg-[#2b8296] text-white font-semibold text-xs sm:text-sm flex items-center justify-center transition shadow-lg cursor-pointer tracking-wide"
                  >
                    {currentMember ? 'Explore My Matches' : "Let's Begin"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
