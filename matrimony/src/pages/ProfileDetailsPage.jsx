import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  Star,
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  User,
  Share2,
  Check,
  Sparkles,
  MessageCircle,
  Clock,
  Award,
  Globe,
  Home as HomeIcon,
  Users,
} from "lucide-react";
import { API_BASE } from "../config/api";
import ScreenshotPrivacyShield from "../components/ScreenshotPrivacyShield";

export default function ProfileDetailsPage({
  profileId,
  onBack,
  currentMember,
}) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load profile from API or database
  useEffect(() => {
    if (!profileId) return;
    const controller = new AbortController();
    const fetchProfile = async () => {
      if (controller.signal.aborted) return;
      setIsLoading(true);
      setError("");
      setProfile(null);
      try {
        const token = localStorage.getItem("apremiya_member_token");
        const res = await fetch(
          `${API_BASE}/profiles/${encodeURIComponent(profileId)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            signal: controller.signal,
          },
        );
        const data = await res.json();
        if (controller.signal.aborted) return;
        if (res.ok) {
          setProfile(data);
          window.dispatchEvent(new Event("apremiya-profile-opened"));
          // Check if interest was sent
          try {
            const savedInterests = JSON.parse(
              localStorage.getItem(`apremiya_interests_${currentMember?.id}`) ||
                "[]",
            );
            setInterestSent(savedInterests.includes(data.id));
            const savedShortlist = JSON.parse(
              localStorage.getItem(`apremiya_shortlist_${currentMember?.id}`) ||
                "[]",
            );
            setIsShortlisted(savedShortlist.includes(data.id));
          } catch {}
        } else {
          setError(data.error || "Failed to load profile details.");
        }
      } catch {
        if (!controller.signal.aborted)
          setError("Failed to load profile details.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    // Defer the request so React's development effect replay cannot open the final profile twice.
    queueMicrotask(fetchProfile);
    return () => controller.abort();
  }, [profileId, currentMember?.id]);

  const handleToggleInterest = () => {
    if (!profile) return;
    const memberKey = `apremiya_interests_${currentMember?.id || "guest"}`;
    try {
      const saved = JSON.parse(localStorage.getItem(memberKey) || "[]");
      let updated;
      if (interestSent) {
        updated = saved.filter((id) => id !== profile.id);
        setInterestSent(false);
        showToast(`Interest withdrawn for ${profile.name}`);
      } else {
        updated = [...saved, profile.id];
        setInterestSent(true);
        showToast(
          `💖 Expressed interest in ${profile.name}! Notification sent.`,
        );
      }
      localStorage.setItem(memberKey, JSON.stringify(updated));
    } catch {}
  };

  const handleToggleShortlist = () => {
    if (!profile) return;
    const memberKey = `apremiya_shortlist_${currentMember?.id || "guest"}`;
    try {
      const saved = JSON.parse(localStorage.getItem(memberKey) || "[]");
      let updated;
      if (isShortlisted) {
        updated = saved.filter((id) => id !== profile.id);
        setIsShortlisted(false);
        showToast(`Removed from your shortlist`);
      } else {
        updated = [...saved, profile.id];
        setIsShortlisted(true);
        showToast(`⭐ Added ${profile.name} to your shortlist!`);
      }
      localStorage.setItem(memberKey, JSON.stringify(updated));
    } catch {}
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    showToast("Profile link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F1] flex flex-col items-center justify-center p-4 profile-details-page">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#701C35] border-t-transparent mb-4" />
        <p className="text-sm font-semibold text-gray-600">
          Loading complete profile view...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#FAF7F1] flex flex-col items-center justify-center p-6 text-center profile-details-page">
        <div className="bg-white p-8 rounded-2xl border border-[#eadfce] max-w-md w-full shadow-lg space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <User size={32} />
          </div>
          <h2 className="text-2xl text-gray-900">Profile unavailable</h2>
          <p className="text-xs text-gray-500">
            {error || "Profile not found."}
          </p>
          <button
            onClick={onBack}
            className="w-full py-2.5 rounded-xl bg-[#701C35] hover:bg-[#5C1429] text-white text-xs font-semibold cursor-pointer shadow-md"
          >
            ← Return to Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F1] text-gray-800 profile-details-page protected-profile-view flex flex-col pb-24 selection:bg-[#701C35] selection:text-white">
      {/* Anti-Screenshot Privacy Shield with Real-Time Admin Notification */}
      <ScreenshotPrivacyShield
        label="Member Profile"
        currentMember={currentMember}
        targetProfile={profile}
      />

      {/* 1. TOP STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-[#FAF7F1]/95 backdrop-blur-md border-b border-[#eadfce] shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#eadfce] bg-white text-gray-700 hover:text-[#701C35] hover:border-[#701C35] text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <ArrowLeft size={15} />
              <span>Back to Matches</span>
            </button>
            <img
              src="/kerala-kalyan-logo.png"
              alt="Kerala Kalyans Matrimony"
              className="h-8 sm:h-9 w-auto object-contain mix-blend-multiply hidden sm:block"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-bold bg-white px-2.5 py-1 rounded-md border border-[#eadfce]">
              {profile.id}
            </span>
            <button
              onClick={handleShare}
              className="p-2 rounded-full border border-[#eadfce] bg-white text-gray-600 hover:text-[#701C35] transition cursor-pointer"
              title="Share Profile Link"
            >
              {isCopied ? (
                <Check size={16} className="text-emerald-600" />
              ) : (
                <Share2 size={16} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. PROFILE HERO BANNER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 w-full">
        <div className="bg-white rounded-3xl border border-[#eadfce] overflow-hidden shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* Left Column: Full-Height Portrait Photo */}
            <div className="md:col-span-5 relative h-96 sm:h-[480px] bg-gray-900 overflow-hidden group">
              <img
                src={profile.photo}
                alt={profile.name}
                className="h-full w-full object-cover object-center filter brightness-95 select-none pointer-events-none"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

              {/* Status Tags */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[13px] font-bold text-white border border-white/20">
                  {profile.gender}
                </span>
                {(profile.isApproved || profile.verified) && (
                  <span className="px-3 py-1 rounded-full bg-emerald-700 text-white text-[13px] font-bold flex items-center gap-1 shadow-xs">
                    <ShieldCheck size={13} /> Verified Member
                  </span>
                )}
              </div>

              {/* Bottom Photo Overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs text-amber-200 font-semibold tracking-wide">
                  {profile.religion} · {profile.caste || profile.motherTongue} ·{" "}
                  {profile.marriageType ||
                    profile.maritalStatus ||
                    "Never Married"}
                </p>
                <h1 className="text-2xl sm:text-3xl leading-tight mt-0.5">
                  {profile.name}
                </h1>
                <p className="text-xs text-gray-200 mt-1 flex items-center gap-2">
                  <span>{profile.age} yrs</span>
                  <span>•</span>
                  <span>{profile.height}</span>
                  <span>•</span>
                  <span>{profile.location}</span>
                </p>
              </div>
            </div>

            {/* Right Column: Key Summary & Fast Facts */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="border-b border-[#eadfce] pb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#B28D53] tracking-widest uppercase">
                    <Sparkles size={14} />
                    <span>Verified Matrimonial Candidate</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl text-[#701C35] mt-1">
                    {profile.name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Registered member seeking a compatible life partner. Profile
                    verified by Apremiya admissions team. Registered member
                    seeking a compatible life partner. Profile verified by
                    Kerala Kalyans Matrimony admissions team.
                  </p>
                </div>

                {/* Grid of Key Attributes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[#FAF7F1] rounded-xl border border-[#eadfce]">
                    <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider block">
                      Age &amp; Height
                    </span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                      {profile.age} yrs · {profile.height}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF7F1] rounded-xl border border-[#eadfce]">
                    <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider block">
                      Marriage Type
                    </span>
                    <span className="font-bold text-[#701C35] text-sm mt-0.5 block">
                      {profile.marriageType ||
                        profile.maritalStatus ||
                        "Never Married"}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF7F1] rounded-xl border border-[#eadfce]">
                    <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider block">
                      Religion
                    </span>
                    <span className="font-bold text-[#701C35] text-sm mt-0.5 block">
                      {profile.religion}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF7F1] rounded-xl border border-[#eadfce]">
                    <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider block">
                      Community / Caste
                    </span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                      {profile.caste || "Open / Any"}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF7F1] rounded-xl border border-[#eadfce]">
                    <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider block">
                      Mother Tongue
                    </span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                      {profile.motherTongue}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF7F1] rounded-xl border border-[#eadfce]">
                    <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider block">
                      Profession
                    </span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block truncate">
                      {profile.profession}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF7F1] rounded-xl border border-[#eadfce]">
                    <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider block">
                      Star (നക്ഷത്രം)
                    </span>
                    <span className="font-bold text-[#701C35] text-sm mt-0.5 block truncate">
                      ⭐ {profile.star || profile.nakshatra || "Not Specified"}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF7F1] rounded-xl border border-[#eadfce]">
                    <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider block">
                      Base District &amp; Location
                    </span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block truncate">
                      {profile.district ? `${profile.district}, ` : ""}
                      {profile.location}
                    </span>
                  </div>

                  {profile.bookNo && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-[12px] text-amber-800 font-bold uppercase tracking-wider block">
                        Record Reference
                      </span>
                      <span className="font-bold text-amber-950 text-sm mt-0.5 block">
                        Book #{profile.bookNo}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fast Connect CTA box */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-emerald-900">
                  <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                    <Heart size={16} fill="white" />
                  </div>
                  <div>
                    <span className="font-bold block">
                      Interested in this profile?
                    </span>
                    <span className="text-[13px] text-emerald-700">
                      Express your interest directly to start communication.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleToggleInterest}
                    className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm ${
                      interestSent
                        ? "bg-emerald-600 text-white"
                        : "bg-[#701C35] hover:bg-[#8B2342] text-white"
                    }`}
                  >
                    <Heart size={14} fill={interestSent ? "white" : "none"} />
                    <span>
                      {interestSent ? "Interest Sent ✓" : "Send Interest"}
                    </span>
                  </button>

                  <button
                    onClick={handleToggleShortlist}
                    className={`p-2.5 rounded-xl border transition cursor-pointer ${
                      isShortlisted
                        ? "bg-amber-100 border-amber-300 text-amber-800"
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                    title={isShortlisted ? "Shortlisted" : "Shortlist"}
                  >
                    <Star size={16} fill={isShortlisted ? "#D97706" : "none"} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DETAILED SECTIONS */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main 2 columns: Education, Career & Background */}
          <div className="md:col-span-2 space-y-6">
            {/* Education & Career Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#eadfce] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#eadfce] pb-3">
                <div className="h-8 w-8 rounded-lg bg-[#FAF7F1] border border-[#eadfce] text-[#701C35] flex items-center justify-center">
                  <GraduationCap size={18} />
                </div>
                <h3 className="text-xl text-[#701C35]">
                  Education &amp; Professional Career
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Highest Qualification
                  </span>
                  <p className="font-bold text-gray-900 text-sm">
                    {profile.education}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Designation / Profession
                  </span>
                  <p className="font-bold text-gray-900 text-sm">
                    {profile.profession}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Work Location
                  </span>
                  <p className="font-bold text-gray-900 text-sm">
                    {profile.location}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Employment Type
                  </span>
                  <p className="font-bold text-gray-900 text-sm">
                    Full Time Professional
                  </p>
                </div>
              </div>
            </div>

            {/* Religious & Community Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#eadfce] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#eadfce] pb-3">
                <div className="h-8 w-8 rounded-lg bg-[#FAF7F1] border border-[#eadfce] text-[#701C35] flex items-center justify-center">
                  <Globe size={18} />
                </div>
                <h3 className="text-xl text-[#701C35]">
                  Religion &amp; Cultural Heritage
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Religion
                  </span>
                  <p className="font-bold text-[#701C35] text-sm">
                    {profile.religion}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Caste / Division
                  </span>
                  <p className="font-bold text-gray-900 text-sm">
                    {profile.caste || "Not Specified / Open"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Mother Tongue
                  </span>
                  <p className="font-bold text-gray-900 text-sm">
                    {profile.motherTongue}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Star / Nakshatram (നക്ഷത്രം)
                  </span>
                  <p className="font-bold text-[#701C35] text-sm">
                    ⭐ {profile.star || profile.nakshatra || "Not Specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Native Place & Family Address Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#eadfce] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#eadfce] pb-3">
                <div className="h-8 w-8 rounded-lg bg-[#FAF7F1] border border-[#eadfce] text-[#701C35] flex items-center justify-center">
                  <HomeIcon size={18} />
                </div>
                <h3 className="text-xl text-[#701C35]">
                  Native Place &amp; Family Address (മേൽവിലാസം)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block">
                    House / Tharavadu Name (വീട്ടുപേര്)
                  </span>
                  <p className="font-bold text-gray-900 text-sm">
                    {profile.houseName || "Not Specified"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Street / Landmark (ലാൻഡ്മാർക്ക്)
                  </span>
                  <p className="font-bold text-gray-900 text-sm">
                    {profile.landmark || "Not Specified"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Post Office (P.O.) &amp; Pin Code
                  </span>
                  <p className="font-bold text-gray-900 text-sm">
                    {[profile.postOffice, profile.pincode]
                      .filter(Boolean)
                      .join(" - ") || "Not Specified"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block">
                    District &amp; State
                  </span>
                  <p className="font-bold text-gray-900 text-sm">
                    {[
                      profile.district,
                      profile.state || "Kerala",
                      profile.country || "India",
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>

                {profile.informerName && (
                  <div className="space-y-1 sm:col-span-2 pt-2 border-t border-[#eadfce]">
                    <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider block">
                      Informer Details (വിവരങ്ങൾ അറിയിച്ചയാൾ)
                    </span>
                    <p className="font-bold text-[#701C35] text-sm">
                      {profile.informerName}{" "}
                      {profile.informerRelation
                        ? `(${profile.informerRelation})`
                        : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* About & Partner Expectations */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#eadfce] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#eadfce] pb-3">
                <div className="h-8 w-8 rounded-lg bg-[#FAF7F1] border border-[#eadfce] text-[#701C35] flex items-center justify-center">
                  <Users size={18} />
                </div>
                <h3 className="text-xl text-[#701C35]">
                  Partner Expectations &amp; Preferences
                </h3>
              </div>

              <div className="text-xs text-gray-600 leading-relaxed space-y-2">
                <p>
                  Looking for an educated, understanding, and family-oriented
                  life partner from the{" "}
                  <b className="text-[#701C35]">{profile.religion}</b> community
                  who values both cultural heritage and modern aspirations.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[13px]">
                  <span className="px-3 py-1 bg-[#FAF7F1] rounded-full border border-[#eadfce] font-semibold text-gray-700">
                    Preferably {profile.religion}
                  </span>
                  <span className="px-3 py-1 bg-[#FAF7F1] rounded-full border border-[#eadfce] font-semibold text-gray-700">
                    Educated Professional
                  </span>
                  <span className="px-3 py-1 bg-[#FAF7F1] rounded-full border border-[#eadfce] font-semibold text-gray-700">
                    Based in Kerala / India / Abroad
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 column: Contact & Trust Card */}
          <div className="space-y-6">
            {/* Contact with Kerala Kalyans Matrimony Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#eadfce] bg-gradient-to-br from-white to-[#FAF7F1] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#eadfce] pb-3">
                <div className="flex items-center gap-2 text-[#701C35] font-bold text-sm">
                  <ShieldCheck size={18} className="text-[#701C35]" />
                  <span>Contact with Kerala Kalyans</span>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#701C35]/10 text-[#701C35]">
                  Mediated Contact
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                To protect family privacy and ensure verified introductions, all
                communications with{" "}
                <b className="text-gray-900">{profile.name}</b> and family are
                coordinated through Kerala Kalyans Matrimony office.
              </p>

              {/* Profile Reference Badge */}
              <div className="p-3 bg-[#FAF7F1] rounded-xl border border-[#eadfce] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-gray-500 uppercase font-semibold block">
                    Quote Reference ID
                  </span>
                  <span className="font-bold text-[#701C35] text-sm">
                    {profile.id || profile._id}
                  </span>
                </div>
                <span className="text-[11px] text-gray-500 bg-white px-2 py-1 rounded border border-[#eadfce]">
                  {profile.name}
                </span>
              </div>

              {/* Action Buttons to Call & WhatsApp Kerala Kalyans Office */}
              <div className="space-y-2.5 text-xs pt-1">
                <a
                  href="tel:+918075588406"
                  className="w-full p-3 rounded-xl bg-[#701C35] hover:bg-[#511327] text-white flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition shadow-md shadow-[#701C35]/20 cursor-pointer"
                >
                  <Phone size={15} />
                  <span>Call Office: (+91) 80755 88406</span>
                </a>

                <a
                  href={`https://wa.me/917907348468?text=Hello%20Kerala%20Kalyans%20Matrimony,%20I%20am%20interested%20in%20connecting%20with%20Profile%20ID:%20${encodeURIComponent(profile.id || profile._id || "")}%20(${encodeURIComponent(profile.name || "")})`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp: (+91) 79073 48468</span>
                </a>
              </div>

              {/* Working Hours & Mediation Note */}
              <div className="pt-2 border-t border-[#eadfce] text-[11px] text-gray-500 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-gray-700">
                  <Clock size={12} className="text-[#701C35]" />
                  <span>Office Hours: 10:00 AM – 5:00 PM (Mon – Sat)</span>
                </div>
                <p className="leading-normal">
                  Our matchmaking team will verify horoscope matching, confirm
                  mutual family interest, and arrange direct introductions.
                </p>
              </div>
            </div>

            {/* Kerala Kalyans Trust Guarantee Card */}
            <div className="bg-[#FAF7F1] rounded-3xl p-6 border border-[#eadfce] space-y-3 text-xs text-gray-600">
              <div className="flex items-center gap-2 text-[#701C35] font-bold text-sm">
                <Award size={16} />
                <span>Kerala Kalyans Assurance</span>
              </div>
              <ul className="space-y-2 text-[13px] list-disc list-inside text-gray-600">
                <li>Government ID verified profile</li>
                <li>100% confidential and secure matching</li>
                <li>Manual screening by admissions team</li>
                <li>Report suspicious activity anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FLOATING BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#eadfce] py-3.5 px-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer hidden sm:inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-gray-900 block leading-tight">
                {profile.name}
              </span>
              <span className="text-[12px] text-gray-400 block">
                {profile.age} yrs · {profile.location}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleToggleShortlist}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                isShortlisted
                  ? "bg-amber-100 border-amber-300 text-amber-800"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Star size={14} fill={isShortlisted ? "#D97706" : "none"} />
              <span>{isShortlisted ? "Shortlisted" : "Shortlist"}</span>
            </button>

            <button
              onClick={handleToggleInterest}
              className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                interestSent
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-[#701C35] hover:bg-[#8B2342] text-white shadow-[#701C35]/20"
              }`}
            >
              <Heart size={15} fill={interestSent ? "white" : "none"} />
              <span>{interestSent ? "Interest Sent ✓" : "Send Interest"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. TOAST NOTIFICATION POPUP */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-[#701C35] text-white px-5 py-3 rounded-xl shadow-xl border border-[#E8CA91]/40 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles size={16} className="text-[#E8CA91]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
