import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  X,
  CheckCircle2,
  ShieldCheck,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

import { API_BASE } from "../config/api";
import { useNotification } from "../context/NotificationContext";
import TermsDisclaimerModal from "./TermsDisclaimerModal";

export default function RegisterModal({
  isOpen,
  onClose,
  initialPreferences = null,
}) {
  const { addNotification } = useNotification();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [profileFor, setProfileFor] = useState("Self");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Bride");
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState("5'5\"");
  const [marriageType, setMarriageType] = useState("Never Married");
  const [religion, setReligion] = useState("Hindu");
  const [caste, setCaste] = useState("");
  const [motherTongue, setMotherTongue] = useState("Malayalam");
  const [education, setEducation] = useState("");
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Profile Photo State (Direct Device Upload)
  const [photo, setPhoto] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Sync initial preferences from hero search bar if provided
  useEffect(() => {
    if (isOpen && initialPreferences) {
      if (
        initialPreferences.religion &&
        initialPreferences.religion !== "Select" &&
        initialPreferences.religion !== "Any"
      ) {
        setReligion(initialPreferences.religion);
      }
      if (
        initialPreferences.motherTongue &&
        initialPreferences.motherTongue !== "Select"
      ) {
        setMotherTongue(initialPreferences.motherTongue);
      }
      if (initialPreferences.lookingFor === "Woman") {
        setGender("Groom");
      } else if (initialPreferences.lookingFor === "Man") {
        setGender("Bride");
      }
    }
  }, [isOpen, initialPreferences]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage(
        "Please select a valid image file (PNG, JPG, JPEG, WEBP)",
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result);
      setPhotoPreview(reader.result);
      setErrorMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto("");
    setPhotoPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // 1. Create a profile in MongoDB Atlas (with Under Review status)
      const profilePayload = {
        name: name.trim(),
        gender,
        age: Number(age) || 25,
        height,
        marriageType,
        maritalStatus: marriageType,
        religion,
        caste: caste.trim(),
        motherTongue,
        education: education.trim() || "Graduate",
        profession: profession.trim() || "Professional",
        location: location.trim() || "Kerala, India",
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        photo:
          photo.trim() ||
          (gender === "Bride"
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600"
            : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"),
        verified: false,
        status: "Under Review",
      };

      const resProfile = await fetch(`${API_BASE}/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profilePayload),
      });

      if (resProfile.ok) {
        const savedProfile = await resProfile.json();
        const profileId = savedProfile?.id || savedProfile?._id;
        setIsSubmitted(true);
        addNotification(
          `New Registration: ${name.trim()} (${gender})`,
          `${name.trim()} (${gender}, ${age} yrs) from ${location.trim() || "India"} has registered. Status: Under Review. Please review and approve.`,
          "registration",
          { tab: "profiles", search: name.trim() },
          profileId,
        );
      } else {
        const data = await resProfile.json();
        throw new Error(data.error || "Failed to submit registration");
      }
    } catch (err) {
      setErrorMessage(
        err.message || "Could not connect to server. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setName("");
    setEducation("");
    setProfession("");
    setLocation("");
    setPhone("");
    setEmail("");
    setPhoto("");
    setPhotoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-[#eadfce] overflow-hidden my-2 sm:my-6 font-inter register-modal"
        >
          {/* Header Banner */}
          <div className="bg-[#701C35] px-3.5 sm:px-8 py-3.5 sm:py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <img
                src="/kerala-kalyan-logo.png"
                alt="Kerala Kalyans Matrimony"
                className="h-9 sm:h-11 w-auto object-contain bg-white rounded-lg p-1 flex-shrink-0"
              />
              <div className="min-w-0">
                <h3 className="serif text-base sm:text-2xl font-bold leading-tight truncate">
                  Register on Kerala Kalyans
                </h3>
                <p className="text-[9px] sm:text-xs text-[#E8CA91] font-semibold tracking-wide truncate">
                  FIND YOUR SPECIAL SOMEONE
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer flex-shrink-0"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form Content or Success Screen */}
          <div className="p-3.5 sm:p-8 max-h-[85vh] overflow-y-auto">
            {isSubmitted ? (
              <div className="text-center py-6 sm:py-8 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <Clock size={36} />
                </div>
                <h4 className="serif text-2xl font-bold text-[#701C35]">
                  Awaiting Admin Approval
                </h4>
                <div className="bg-amber-50/95 border border-amber-200 p-4 sm:p-5 rounded-xl max-w-md mx-auto shadow-xs text-center space-y-2.5">
                  <p className="text-sm font-bold text-amber-950 leading-relaxed">
                    Your registration has been submitted successfully. Please
                    wait for admin approval before logging in.
                  </p>
                  <p className="text-xs text-amber-900/90 leading-relaxed pt-2.5 border-t border-amber-200/80">
                    Once approved by our administrator, an approval confirmation
                    with your temporary password will be sent to your registered
                    email address.
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl max-w-md mx-auto text-xs text-emerald-800 flex items-center justify-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-emerald-600 flex-shrink-0"
                  />
                  <span>
                    Welcome email confirmation sent to <b>{email}</b>
                  </span>
                </div>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  Thank you, <b>{name}</b>. Once our administrator reviews and
                  approves your account, your approval notice with login
                  credentials will be dispatched to <b>{email}</b>.
                </p>

                <div className="bg-[#FAF7F1] p-4 rounded-xl border border-[#eadfce] text-left text-xs space-y-2 max-w-md mx-auto font-inter">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-semibold">
                      Account Status:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                      Under Review (Pending Approval)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600 text-[11px] pt-1.5 border-t border-[#eadfce]">
                    <span className="font-semibold">Notification Email:</span>
                    <span className="font-medium text-gray-900">{email}</span>
                  </div>
                </div>

                <div className="pt-3 flex justify-center">
                  <button
                    onClick={handleReset}
                    className="px-8 py-3 rounded-full bg-[#701C35] hover:bg-[#511327] text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-lg shadow-[#701C35]/20"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                    {errorMessage}
                  </div>
                )}

                {/* Profile Created For */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1.5">
                    This Profile is for
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[
                      "Self",
                      "Son",
                      "Daughter",
                      "Brother",
                      "Sister",
                      "Relative",
                    ].map((rel) => (
                      <button
                        type="button"
                        key={rel}
                        onClick={() => {
                          setProfileFor(rel);
                          if (rel === "Son" || rel === "Brother")
                            setGender("Groom");
                          if (rel === "Daughter" || rel === "Sister")
                            setGender("Bride");
                        }}
                        className={`py-2 px-1 text-center rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                          profileFor === rel
                            ? "bg-[#701C35] text-white border-[#701C35]"
                            : "bg-[#FAF7F1] text-gray-700 border-[#eadfce] hover:bg-gray-100"
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile Photo Section (Direct Device Upload) */}
                <div className="rounded-xl border border-[#eadfce] bg-[#FAF7F1]/80 p-3 sm:p-4">
                  <div className="mb-2.5">
                    <label className="block text-gray-800 font-semibold text-xs sm:text-sm">
                      Add Profile Photo
                    </label>
                    <p className="text-[10px] sm:text-[11px] text-[#9C8158] font-medium">
                      Profiles with photos receive 8x more verified partner
                      requests
                    </p>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                  />

                  {photoPreview ? (
                    <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-[#eadfce]">
                      <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 border-[#C8A96B] shadow-sm flex-shrink-0 bg-gray-100">
                        <img
                          src={photoPreview}
                          alt="Profile Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          Photo Attached Successfully
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Ready for your matrimonial profile
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1 rounded-md text-[11px] font-medium bg-[#701C35] text-white hover:bg-[#511327] transition cursor-pointer"
                          >
                            Change Photo
                          </button>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="px-2.5 py-1 rounded-md text-[11px] font-medium text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center p-4 sm:p-5 border-2 border-dashed border-[#d8c7b3] hover:border-[#701C35] bg-white rounded-xl cursor-pointer transition text-center group"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FAF7F1] text-[#701C35] group-hover:bg-[#701C35] group-hover:text-white transition mb-2 shadow-xs">
                        <Camera size={20} />
                      </div>
                      <p className="text-xs font-semibold text-gray-800 group-hover:text-[#701C35] transition">
                        Click to upload your portrait photo
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Supports JPG, PNG, WEBP (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Name & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ananya Menon"
                        className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#701C35] focus:ring-1 focus:ring-[#701C35]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Gender *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGender("Bride")}
                        className={`py-2.5 rounded-lg border font-semibold text-center transition cursor-pointer ${
                          gender === "Bride"
                            ? "bg-[#701C35] text-white border-[#701C35]"
                            : "bg-white text-gray-700 border-gray-300"
                        }`}
                      >
                        Bride (Female)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender("Groom")}
                        className={`py-2.5 rounded-lg border font-semibold text-center transition cursor-pointer ${
                          gender === "Groom"
                            ? "bg-[#701C35] text-white border-[#701C35]"
                            : "bg-white text-gray-700 border-gray-300"
                        }`}
                      >
                        Groom (Male)
                      </button>
                    </div>
                    {gender === "Bride" ? (
                      <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                        <span>✨ Free Registration for Girls' Profiles · No Charges</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-amber-800 font-semibold mt-1 flex items-center gap-1">
                        <span>📋 One-Time Fee · 6 Profiles Every Saturday (3 Months)</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Age, Height & Marriage Type */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Age *
                    </label>
                    <select
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#701C35]"
                    >
                      {Array.from({ length: 50 }, (_, i) => 18 + i).map((n) => (
                        <option key={n} value={n}>
                          {n} years
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Height
                    </label>
                    <select
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#701C35]"
                    >
                      {[
                        "4'10\"",
                        "5'0\"",
                        "5'2\"",
                        "5'4\"",
                        "5'5\"",
                        "5'6\"",
                        "5'7\"",
                        "5'8\"",
                        "5'9\"",
                        "5'10\"",
                        "5'11\"",
                        "6'0\"",
                        "6'1\"",
                        "6'2\"",
                        "6'4\"",
                      ].map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Marriage Type *
                    </label>
                    <select
                      value={marriageType}
                      onChange={(e) => setMarriageType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#701C35] font-medium"
                    >
                      <option value="Never Married">Never Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Awaiting Divorce">Awaiting Divorce</option>
                      <option value="Separated">Separated</option>
                      <option value="Second Marriage">Second Marriage</option>
                    </select>
                  </div>
                </div>

                {/* Religion & Caste */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Religion *
                    </label>
                    <select
                      value={religion}
                      onChange={(e) => setReligion(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#701C35]"
                    >
                      <option value="Hindu">Hindu</option>
                      <option value="Christian">Christian</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Sikh">Sikh</option>
                      <option value="Jain">Jain</option>
                      <option value="Buddhist">Buddhist</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Caste / Community
                    </label>
                    <input
                      type="text"
                      value={caste}
                      onChange={(e) => setCaste(e.target.value)}
                      placeholder="e.g. Nair, Syrian Catholic"
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#701C35]"
                    />
                  </div>
                </div>

                {/* Mother Tongue & Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Mother Tongue *
                    </label>
                    <select
                      value={motherTongue}
                      onChange={(e) => setMotherTongue(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-[#701C35]"
                    >
                      <option value="Malayalam">Malayalam</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      City / Location *
                    </label>
                    <div className="relative">
                      <MapPin
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Kochi, Kerala"
                        className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#701C35]"
                      />
                    </div>
                  </div>
                </div>

                {/* Education & Profession */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Highest Education
                    </label>
                    <div className="relative">
                      <GraduationCap
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="e.g. B.Tech, MBBS, MBA"
                        className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#701C35]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Profession / Job
                    </label>
                    <div className="relative">
                      <Briefcase
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        placeholder="e.g. Software Engineer"
                        className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#701C35]"
                      />
                    </div>
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Mobile / WhatsApp Number *
                    </label>
                    <div className="relative">
                      <Phone
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98471 22334"
                        className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#701C35]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. user@example.com"
                        className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#701C35]"
                      />
                    </div>
                  </div>
                </div>

                {/* Registration & Privacy Disclaimer Box */}
                <div className="rounded-xl border border-[#eadfce] bg-[#FAF7F1] p-3 sm:p-3.5 space-y-2 text-[11px] text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#701C35] flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#701C35]" />
                      <span>Registration Terms &amp; Privacy Notice</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-[#701C35] font-semibold hover:underline text-[10px] cursor-pointer"
                    >
                      View Full Policy →
                    </button>
                  </div>
                  <ul className="space-y-1 text-gray-600 list-disc list-inside leading-relaxed">
                    <li>
                      <b>Fee Policy:</b> Only a one-time non-refundable fee. <b className="text-emerald-700">Free registration for girls&apos; profiles.</b>
                    </li>
                    <li>
                      <b>Profile Services:</b> 6 verified profiles sent every Saturday during the 3-month period.
                    </li>
                    <li>
                      <b>Zero Commission:</b> No extra payments like ₹25,000 or ₹50,000 once the marriage is fixed.
                    </li>
                    <li>
                      <b>Voluntary:</b> Customers register voluntarily. No 100% guarantee that we will conduct the marriage.
                    </li>
                    <li className="text-red-700">
                      <b>Privacy &amp; Legal:</b> Profiles are strictly for personal use only. Sharing or forwarding is strictly prohibited. Strict legal action will be taken against violators.
                    </li>
                  </ul>
                  <p className="text-[10px] text-gray-400 pt-1 border-t border-[#eadfce]">
                    By clicking Complete Registration, you agree to our Terms of Service, Privacy Policy &amp; Legal Disclaimer.
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 rounded-xl bg-[#701C35] hover:bg-[#511327] text-white font-semibold text-sm transition shadow-lg shadow-[#701C35]/25 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Creating Profile..."
                    : "Complete Registration"}
                </button>
              </form>
            )}
          </div>
        </motion.div>

        {/* Full Terms & Legal Disclaimer Modal */}
        <TermsDisclaimerModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
        />
      </div>
    </AnimatePresence>
  );
}
