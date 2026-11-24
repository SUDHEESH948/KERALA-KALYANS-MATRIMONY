import { motion } from 'framer-motion'
import { Search, ChevronDown, X } from 'lucide-react'

const SelectBox = ({ value, onChange, children, small = false, variant = 'dark' }) => <div className="relative"><select value={value} onChange={onChange} className={`w-full appearance-none ${variant === 'light' ? 'rounded-2xl border border-[#e4d9c2] bg-[#faf7ef] text-[#26312b] shadow-none focus:border-[#701C35] focus:ring-[#701C35]/25' : 'rounded bg-white text-gray-800 shadow-sm focus:ring-[#d3a825]'} ${small ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-base'} font-medium outline-none focus:ring-2`}>{children}</select><ChevronDown className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${variant === 'light' ? 'text-[#38463e]' : 'text-gray-500'}`} size={small ? 13 : 18} /></div>

export default function HeroSection({ lookingFor, setLookingFor, ageFrom, setAgeFrom, ageTo, setAgeTo, religion, setReligion, motherTongue, setMotherTongue, mobileSearchOpen, setMobileSearchOpen, searchProfiles, currentMember, onOpenMatches }) {
  const ages = Array.from({ length: 53 }, (_, i) => 18 + i)
  const religions = ['Select', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Jewish', 'Any']
  const languages = ['Select', 'Malayalam', 'Tamil', 'Telugu', 'Kannada', 'Hindi', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Odia', 'Urdu', 'English']
  const submit = (event) => {
    if (currentMember && onOpenMatches) { event?.preventDefault?.(); onOpenMatches(currentMember); return }
    searchProfiles(event)
  }
  const ageOptions = ages.map(age => <option key={age} value={age}>{age}</option>)
  return <section className="bg-white px-3 pb-8 sm:px-6 sm:pb-12 lg:px-10">
    <div className="relative mx-auto min-h-[620px] max-w-[1440px] overflow-hidden rounded-[26px] bg-[#252b2e] sm:min-h-[650px] sm:rounded-[34px] md:min-h-[680px]">
    <img src="/Gemini_Generated_Image_hlp8u6hlp8u6hlp8.png" alt="Kerala wedding celebration" className="absolute inset-0 hidden h-full w-full object-cover object-[center_15%] md:block" />
    <img src="/erasio_Gemini_Generated_Image_yr2m55yr2m55yr2m (1).png" alt="Kerala wedding celebration" className="absolute inset-0 block h-full w-full object-cover object-top md:hidden" />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-black/10" />
    <div className="relative z-10 mx-auto flex min-h-[620px] w-full max-w-[1320px] flex-col px-5 py-10 sm:min-h-[650px] sm:px-10 sm:py-12 md:min-h-[680px] md:px-12 md:py-12">
      <motion.div className="flex h-full flex-1 flex-col justify-between" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="max-w-[680px] text-left">
          <p className="font-sans text-[12px] font-bold tracking-[.22em] text-[#E8CA91] sm:text-xs">KERALA&apos;S TRUSTED MATCHMAKING</p>
          <h1 className="font-serif mt-3 text-4xl font-bold leading-[.98] text-white drop-shadow-lg sm:text-6xl md:text-7xl">Choose your forever.</h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/90 drop-shadow sm:text-base">Find love on your terms with meaningful, verified connections.</p>
        </div>
        <div>
        <form id="search" onSubmit={submit} className="mt-8 hidden w-full overflow-x-auto rounded-[30px] border border-[#eadfc7] bg-[#fffdf8] p-5 text-left shadow-[0_22px_50px_rgba(0,0,0,.22)] md:block [-webkit-overflow-scrolling:touch]">
          <div className="grid min-w-[980px] grid-cols-[1.24fr_1.1fr_1.1fr_1.1fr_.82fr] items-end gap-4">
            <label className="min-w-0"><span className="mb-3 block text-sm font-medium text-[#5d6b63]">I&apos;m looking for a</span><SelectBox variant="light" value={lookingFor} onChange={e => setLookingFor(e.target.value)}><option>Woman</option><option>Man</option></SelectBox></label>
            <div className="min-w-0"><span className="mb-3 block text-sm font-medium text-[#5d6b63]">Age</span><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"><SelectBox variant="light" value={ageFrom} onChange={e => setAgeFrom(e.target.value)}>{ageOptions}</SelectBox><span className="text-sm text-[#66736b]">to</span><SelectBox variant="light" value={ageTo} onChange={e => setAgeTo(e.target.value)}>{ageOptions}</SelectBox></div></div>
            <label className="min-w-0"><span className="mb-3 block text-sm font-medium text-[#5d6b63]">Community</span><SelectBox variant="light" value={religion} onChange={e => setReligion(e.target.value)}>{religions.map(item => <option key={item}>{item}</option>)}</SelectBox></label>
            <label className="min-w-0"><span className="mb-3 block text-sm font-medium text-[#5d6b63]">Mother tongue</span><SelectBox variant="light" value={motherTongue} onChange={e => setMotherTongue(e.target.value)}>{languages.map(item => <option key={item}>{item}</option>)}</SelectBox></label>
            <button type="submit" className="flex h-[50px] w-full self-end items-center justify-center whitespace-nowrap rounded-full bg-[#701C35] px-4 text-sm font-bold tracking-wide text-white shadow-[0_10px_20px_rgba(158,119,13,.22)] transition hover:bg-[#511327]">{currentMember ? 'My Matches' : 'Search profiles'}</button>
          </div>
        </form>
        <form onSubmit={submit} className="hidden">
          <div className="grid grid-cols-6 gap-3">
            <label className="col-span-2 min-w-0"><span className="mb-1 block text-xs font-medium text-white/90">I&apos;m looking for a</span><SelectBox value={lookingFor} onChange={e => setLookingFor(e.target.value)}><option>Woman</option><option>Man</option></SelectBox></label>
            <div className="col-span-2 min-w-0"><span className="mb-1 block text-xs font-medium text-white/90">aged</span><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5"><SelectBox value={ageFrom} onChange={e => setAgeFrom(e.target.value)}>{ageOptions}</SelectBox><span className="text-xs text-white/90">to</span><SelectBox value={ageTo} onChange={e => setAgeTo(e.target.value)}>{ageOptions}</SelectBox></div></div>
            <label className="col-span-2 min-w-0"><span className="mb-1 block text-xs font-medium text-white/90">of religion</span><SelectBox value={religion} onChange={e => setReligion(e.target.value)}>{religions.map(item => <option key={item}>{item}</option>)}</SelectBox></label>
            <label className="col-span-4 min-w-0"><span className="mb-1 block text-xs font-medium text-white/90">and mother tongue</span><SelectBox value={motherTongue} onChange={e => setMotherTongue(e.target.value)}>{languages.map(item => <option key={item}>{item}</option>)}</SelectBox></label>
            <button type="submit" className="col-span-2 flex h-[42px] items-center justify-center rounded bg-[#701C35] px-6 text-sm font-bold tracking-wide text-white shadow transition hover:bg-[#511327]">{currentMember ? 'Explore My Matches' : "Let's Begin"}</button>
          </div>
        </form>
        <div className="mt-4 block md:hidden">
          {!mobileSearchOpen ? (
            <button onClick={() => currentMember ? submit() : setMobileSearchOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#701C35] px-6 py-3 text-sm font-bold tracking-wide text-white shadow-xl shadow-black/60"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20"><Search size={14} /></span>{currentMember ? 'View My Matches' : 'Find Your Match'}<ChevronDown size={15} /></button>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="mx-auto w-full max-w-[380px] rounded-2xl border border-white/20 bg-black/85 p-4 text-left shadow-2xl backdrop-blur-lg">
              <div className="mb-4 flex items-center justify-between border-b border-white/15 pb-3 text-base font-semibold text-white"><span className="flex items-center gap-2"><Search size={17} className="text-[#d3a825]" />Search Profiles</span><button type="button" onClick={() => setMobileSearchOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15" aria-label="Close search"><X size={18} /></button></div>
              <div className="space-y-3">
                <label className="block text-sm font-medium text-white/90">I&apos;m looking for a<SelectBox value={lookingFor} onChange={e => setLookingFor(e.target.value)}><option>Woman</option><option>Man</option></SelectBox></label>
                <div><span className="mb-1 block text-sm font-medium text-white/90">aged</span><div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2"><SelectBox value={ageFrom} onChange={e => setAgeFrom(e.target.value)}>{ageOptions}</SelectBox><span className="pb-3 text-sm text-white/80">to</span><SelectBox value={ageTo} onChange={e => setAgeTo(e.target.value)}>{ageOptions}</SelectBox></div></div>
                <label className="block text-sm font-medium text-white/90">of religion<SelectBox value={religion} onChange={e => setReligion(e.target.value)}>{religions.map(item => <option key={item}>{item}</option>)}</SelectBox></label>
                <label className="block text-sm font-medium text-white/90">and mother tongue<SelectBox value={motherTongue} onChange={e => setMotherTongue(e.target.value)}>{languages.map(item => <option key={item}>{item}</option>)}</SelectBox></label>
                <button type="button" onClick={submit} className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-[#701C35] text-sm font-bold text-white hover:bg-[#511327]">{currentMember ? 'Explore My Matches' : "Let's Begin"}</button>
              </div>
            </motion.div>
          )}
        </div>
        </div>
      </motion.div>
    </div>
    </div>
  </section>
}
