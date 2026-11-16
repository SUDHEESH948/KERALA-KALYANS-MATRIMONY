import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Heart,
  Users,
  Star,
  Search,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  LogOut,
  ArrowLeft,
  RefreshCw,
  Filter,
  Phone,
  Mail,
  Calendar,
  Eye,
  AlertCircle,
  Bell,
  BellRing,
  UserCheck,
  UserPlus,
  MessageSquare,
  AlertTriangle,
  Check,
  X,
  Copy,
  Key,
} from "lucide-react";

import { API_BASE } from "../config/api";
import { useNotification } from "../context/NotificationContext";

export default function AdminPage({ onExit }) {
  // Auth state
  const [token, setToken] = useState(
    () => localStorage.getItem("apremiya_admin_token") || "",
  );
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("apremiya_admin_user") || "null");
    } catch {
      return null;
    }
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState("admin@apremiya.com");
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard tab state
  const [activeTab, setActiveTab] = useState("profiles"); // 'overview' | 'profiles' | 'inquiries' | 'notifications' | 'settings'

  // Data state
  const [stats, setStats] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());

  // Global Common Notification Context
  const {
    notifications,
    unreadCount,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    deleteNotification,
  } = useNotification();

  const [notifFilter, setNotifFilter] = useState("all"); // 'all' | 'unread' | 'registration' | 'inquiry' | 'verified'
  const [confirmModal, setConfirmModal] = useState(null);
  const [approvalModal, setApprovalModal] = useState(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Profile filters
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [editingProfile, setEditingProfile] = useState(null);

  // Platform stats edit state
  const [editStats, setEditStats] = useState({
    verifiedProfiles: 100,
    happyConnections: 500,
    registeredMembers: 10,
    trustedExperience: 10,
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Check login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to login");

      localStorage.setItem("apremiya_admin_token", data.token);
      localStorage.setItem("apremiya_admin_user", JSON.stringify(data.admin));
      setToken(data.token);
      setAdminUser(data.admin);
      addNotification(
        "Welcome Back",
        "Administrator session authenticated successfully.",
        "verified",
      );
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("apremiya_admin_token");
    localStorage.removeItem("apremiya_admin_user");
    setToken("");
    setAdminUser(null);
    showToast("Signed out successfully");
  };

  // Fetch all data (with silent background auto-refresh & real-time notification detection)
  const fetchData = async (isSilent = false) => {
    if (!token) return;
    if (!isSilent) setIsLoading(true);
    try {
      const [resStats, resProfiles, resInquiries] = await Promise.all([
        fetch(`${API_BASE}/stats`),
        fetch(`${API_BASE}/profiles`),
        fetch(`${API_BASE}/inquiries`),
      ]);

      if (resStats.ok) {
        const statsData = await resStats.json();
        setStats(statsData);
        if (activeTab !== "settings" && statsData.platform) {
          setEditStats(statsData.platform);
        }
      }

      if (resProfiles.ok) {
        const profs = await resProfiles.json();
        setProfiles(Array.isArray(profs) ? profs : []);
      }

      if (resInquiries.ok) {
        const inqs = await resInquiries.json();
        setInquiries(Array.isArray(inqs) ? inqs : []);
      }

      setLastRefreshedAt(new Date());
    } catch (fetchErr) {
      console.error("Error fetching admin data:", fetchErr);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  // Automatic Background Refreshing (Every 3.5s + on window focus)
  useEffect(() => {
    if (!token) return;

    fetchData();

    const onFocus = () => fetchData(true);
    window.addEventListener("focus", onFocus);

    let interval = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchData(true);
      }, 3500);
    }

    return () => {
      window.removeEventListener("focus", onFocus);
      if (interval) clearInterval(interval);
    };
  }, [token, autoRefresh, activeTab]);

  // Admin Approve User Registration
  const handleApproveProfile = async (id, name) => {
    try {
      const res = await fetch(`${API_BASE}/profiles/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  isApproved: true,
                  verified: true,
                  status: "approved",
                  mustChangePassword: true,
                }
              : p,
          ),
        );
        markNotificationAsRead(id);
        const msg = `Profile "${name}" approved! Temporary password and login link emailed to member.`;
        showToast(msg, "success");
        if (data.temporaryPassword) {
          setApprovalModal({
            name,
            email: data.profile?.email || "",
            temporaryPassword: data.temporaryPassword,
            emailSent: data.emailSent,
            isResend: false,
          });
        }
        addNotification(
          "Profile Approved & Credentials Emailed",
          msg,
          "verified",
          { tab: "profiles", search: name },
        );
        fetchData(true);
      } else {
        throw new Error(data.error || "Failed to approve profile");
      }
    } catch (err) {
      showToast(err.message, "error");
      addNotification("Error Approving Profile", err.message, "error");
    }
  };

  // Admin Reject User Registration
  const handleRejectProfile = async (id, name) => {
    try {
      const res = await fetch(`${API_BASE}/profiles/${id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  isApproved: false,
                  verified: false,
                  status: "rejected",
                }
              : p,
          ),
        );
        markNotificationAsRead(id);
        const msg = `Profile "${name}" rejected. Rejection notice dispatched via email.`;
        showToast(msg, "info");
        addNotification("Profile Application Rejected", msg, "delete", {
          tab: "profiles",
          search: name,
        });
        fetchData(true);
      } else {
        throw new Error(data.error || "Failed to reject profile");
      }
    } catch (err) {
      showToast(err.message, "error");
      addNotification("Error Rejecting Profile", err.message, "error");
    }
  };

  // Resend Temporary Credentials Email
  const handleResendApproval = async (id, name) => {
    try {
      const res = await fetch(`${API_BASE}/profiles/${id}/resend-approval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          `New login credentials dispatched to "${name}" via email.`,
          "success",
        );
        if (data.temporaryPassword) {
          setApprovalModal({
            name,
            email: data.emailDetails?.recipient || "",
            temporaryPassword: data.temporaryPassword,
            emailSent: data.emailSent,
            isResend: true,
          });
        }
        fetchData(true);
      } else {
        throw new Error(data.error || "Failed to resend credentials");
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Toggle Verification & Admin Approval (Legacy wrapper)
  const toggleVerify = async (id) => {
    const p = profiles.find((item) => item.id === id);
    if (!p) return;
    if (p.isApproved || p.verified) {
      // Revert to pending
      try {
        const res = await fetch(`${API_BASE}/profiles/${id}/verify`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          showToast(`Profile "${p.name}" reverted to Pending.`, "info");
          fetchData(true);
        }
      } catch (err) {
        showToast(err.message, "error");
      }
    } else {
      handleApproveProfile(id, p.name);
    }
  };

  // Custom Prompt Delete Profile (NO browser alert / confirm)
  const promptDeleteProfile = (id, name) => {
    setConfirmModal({
      title: "Delete Member Profile",
      message: `Are you sure you want to permanently delete the profile for "${name}"? This action cannot be undone.`,
      confirmText: "Delete Profile",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await fetch(`${API_BASE}/profiles/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (data.success) {
            setProfiles((prev) => prev.filter((p) => p.id !== id));
            addNotification(
              "Profile Deleted",
              `Member profile for "${name}" has been permanently removed.`,
              "delete",
            );
            fetchData();
          }
        } catch {
          addNotification("Error", "Failed to delete profile", "error");
        }
      },
    });
  };

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editingProfile) return;
    try {
      const res = await fetch(`${API_BASE}/profiles/${editingProfile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingProfile),
      });
      const updated = await res.json();
      if (res.ok) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
        setEditingProfile(null);
        addNotification(
          "Profile Updated",
          `Profile details for "${updated.name}" have been saved.`,
          "info",
          { tab: "profiles", search: updated.name },
        );
        fetchData();
      } else {
        throw new Error(updated.error || "Failed to update");
      }
    } catch (err) {
      addNotification("Error Updating Profile", err.message, "error");
    }
  };

  // Update Inquiry Status
  const handleInquiryStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/inquiries/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status } : i)),
        );
        addNotification(
          "Lead Status Updated",
          `Inquiry status changed to "${status}".`,
          "inquiry",
          { tab: "inquiries" },
        );
      }
    } catch {
      addNotification("Error", "Failed to update inquiry status", "error");
    }
  };

  // Custom Prompt Delete Inquiry (NO browser alert / confirm)
  const promptDeleteInquiry = (id, name) => {
    setConfirmModal({
      title: "Delete Inquiry Lead",
      message: `Are you sure you want to delete inquiry record from "${name || "Seeker"}"?`,
      confirmText: "Delete Inquiry",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await fetch(`${API_BASE}/inquiries/${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setInquiries((prev) => prev.filter((i) => i.id !== id));
            addNotification(
              "Inquiry Removed",
              `Inquiry lead from "${name || "Seeker"}" has been deleted.`,
              "delete",
            );
          }
        } catch {
          addNotification("Error", "Failed to delete inquiry", "error");
        }
      },
    });
  };

  // Save Stats
  const handleSaveStats = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/stats`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editStats),
      });
      if (res.ok) {
        addNotification(
          "Platform Stats Saved",
          "Homepage statistics counters updated successfully.",
          "info",
        );
        fetchData();
      }
    } catch {
      addNotification("Error", "Failed to update stats", "error");
    }
  };

  // Filtered Profiles list
  const filteredProfiles = profiles.filter((p) => {
    const q = (searchQuery || "").trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.id?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.profession?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.caste?.toLowerCase().includes(q) ||
      (q.includes("sudh") && p.name?.toLowerCase().includes("sudh"));
    const matchesGender = genderFilter === "all" || p.gender === genderFilter;
    const isPending =
      p.status === "pending" ||
      p.status === "Under Review" ||
      (!p.isApproved && !p.verified && p.status !== "rejected");
    const isApproved =
      p.isApproved ||
      p.verified ||
      p.status === "approved" ||
      p.status === "Active";
    const isRejected = p.status === "rejected";

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending"
        ? isPending
        : statusFilter === "approved" || statusFilter === "verified"
          ? isApproved
          : statusFilter === "rejected"
            ? isRejected
            : statusFilter === "unverified"
              ? isPending
              : p.status === statusFilter);
    return matchesSearch && matchesGender && matchesStatus;
  });

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-screen bg-[#FAF7F1] flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#eadfce] p-8">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#701C35] text-white mb-3">
              <Heart size={24} fill="white" />
            </div>
            <h1 className="serif font-serif text-2xl sm:text-3xl font-bold text-[#701C35]">
              Apremiya Admin
            </h1>
            <p className="font-montserrat text-xs tracking-[2px] font-semibold text-[#9C8158] mt-1">
              PORTAL CONTROL PANEL
            </p>
          </div>

          {loginError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 font-montserrat">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#701C35] focus:ring-1 focus:ring-[#701C35]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#701C35] focus:ring-1 focus:ring-[#701C35]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 py-3 rounded-lg bg-[#701C35] hover:bg-[#511327] text-white font-semibold text-sm transition shadow-md cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn
                ? "Verifying Credentials..."
                : "Sign In to Admin Panel"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-400">
              Default: admin@apremiya.com / admin123
            </span>
            {onExit && (
              <button
                onClick={onExit}
                className="text-[#701C35] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Site
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F7F4EE] text-gray-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#701C35] text-white shadow-md">
        <div className="mx-auto max-w-[1400px] px-2.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/10 border border-white/20 flex-shrink-0">
              <Heart size={16} fill="white" />
            </div>
            <div className="min-w-0">
              <h2 className="serif text-base sm:text-xl font-bold leading-tight truncate">
                Apremiya
              </h2>
              <p className="font-montserrat text-[8px] sm:text-[9px] tracking-[1.5px] sm:tracking-[2px] text-[#E8CA91] font-semibold truncate">
                ADMIN CONSOLE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 font-montserrat text-xs flex-shrink-0">
            <div className="hidden md:block text-right">
              <p className="font-semibold truncate max-w-[120px]">
                {adminUser?.name || "Administrator"}
              </p>
              <p className="text-[10px] text-[#E8CA91] truncate max-w-[120px]">
                {adminUser?.email}
              </p>
            </div>

            {/* Notification Bell Button */}
            <button
              onClick={() => setActiveTab("notifications")}
              className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-md transition cursor-pointer font-semibold ${
                activeTab === "notifications"
                  ? "bg-[#C8A96B] text-[#321b1e]"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title="Notifications Center"
            >
              <Bell size={15} />
              <span className="hidden md:inline">Notifications</span>
              {unreadCount > 0 && (
                <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {onExit && (
              <button
                onClick={onExit}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition cursor-pointer font-semibold"
                title="View Main Website"
              >
                <ArrowLeft size={13} />
                <span className="hidden sm:inline">Site</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-red-600/80 hover:bg-red-700 transition cursor-pointer font-semibold"
              title="Sign Out"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-[1400px] px-2.5 sm:px-6 py-4 sm:py-6">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-[#eadfce] pb-4 font-montserrat">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {[
              { id: "profiles", label: "Profiles", count: profiles.length },
              {
                id: "inquiries",
                label: "Leads",
                count: inquiries.filter((i) => i.status === "New").length,
                isBadge: true,
              },
              {
                id: "notifications",
                label: "Notifications",
                count: unreadCount,
                isBadge: true,
              },
              { id: "settings", label: "Stats Control" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-[#701C35] text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-[#FAF7F1] border border-[#eadfce]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === tab.id
                        ? "bg-white/25 text-white"
                        : tab.isBadge && tab.count > 0
                          ? "bg-[#701C35] text-white"
                          : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: PROFILES MANAGEMENT */}
        {activeTab === "profiles" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 font-montserrat">
              <div
                onClick={() => {
                  setStatusFilter("all");
                  setGenderFilter("all");
                  setSearchQuery("");
                }}
                className={`p-3 sm:p-4 rounded-xl border transition cursor-pointer shadow-xs ${
                  statusFilter === "all" && !searchQuery
                    ? "bg-white border-[#701C35] ring-2 ring-[#701C35]/20"
                    : "bg-white border-[#eadfce] hover:border-[#701C35]/50"
                }`}
                title="Click to view all registrations"
              >
                <p className="text-[10px] sm:text-xs text-gray-500 font-semibold truncate">
                  Total Registrations
                </p>
                <h3 className="serif text-xl sm:text-2xl font-bold text-[#701C35] mt-0.5">
                  {profiles.length}
                </h3>
              </div>
              <div
                onClick={() => setStatusFilter("pending")}
                className={`p-3 sm:p-4 rounded-xl border transition cursor-pointer shadow-xs ${
                  statusFilter === "pending"
                    ? "bg-amber-50 border-amber-500 ring-2 ring-amber-400/30"
                    : "bg-amber-50/50 border-amber-200 hover:border-amber-400"
                }`}
                title="Click to view pending approval registrations"
              >
                <p className="text-[10px] sm:text-xs text-amber-800 font-semibold truncate">
                  Pending Approval
                </p>
                <h3 className="serif text-xl sm:text-2xl font-bold text-amber-600 mt-0.5">
                  {
                    profiles.filter(
                      (p) =>
                        p.status === "pending" ||
                        p.status === "Under Review" ||
                        (!p.isApproved &&
                          !p.verified &&
                          p.status !== "rejected"),
                    ).length
                  }
                </h3>
              </div>
              <div
                onClick={() => setStatusFilter("approved")}
                className={`p-3 sm:p-4 rounded-xl border transition cursor-pointer shadow-xs ${
                  statusFilter === "approved"
                    ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/30"
                    : "bg-emerald-50/40 border-emerald-200 hover:border-emerald-400"
                }`}
                title="Click to view approved active members"
              >
                <p className="text-[10px] sm:text-xs text-emerald-800 font-semibold truncate">
                  Approved & Active
                </p>
                <h3 className="serif text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5">
                  {profiles.filter((p) => p.isApproved || p.verified).length}
                </h3>
              </div>
              <div
                onClick={() => setStatusFilter("rejected")}
                className={`p-3 sm:p-4 rounded-xl border transition cursor-pointer shadow-xs ${
                  statusFilter === "rejected"
                    ? "bg-red-50 border-red-500 ring-2 ring-red-400/30"
                    : "bg-red-50/40 border-red-200 hover:border-red-400"
                }`}
                title="Click to view rejected applications"
              >
                <p className="text-[10px] sm:text-xs text-red-800 font-semibold truncate">
                  Rejected
                </p>
                <h3 className="serif text-xl sm:text-2xl font-bold text-red-600 mt-0.5">
                  {profiles.filter((p) => p.status === "rejected").length}
                </h3>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#eadfce] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 font-montserrat text-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full">
                <div className="relative flex-1 min-w-0 w-full">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search name, email, phone, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#701C35] text-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full sm:w-auto px-2.5 py-2 rounded-lg border border-gray-200 bg-white font-medium focus:outline-none text-xs"
                  >
                    <option value="all">All Genders</option>
                    <option value="Bride">Brides</option>
                    <option value="Groom">Grooms</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto px-2.5 py-2 rounded-lg border border-gray-200 bg-white font-medium focus:outline-none text-xs"
                  >
                    <option value="all">All Registrations</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved Members</option>
                    <option value="rejected">Rejected Applications</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#eadfce] shadow-sm overflow-hidden font-montserrat">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F1] border-b border-[#eadfce] text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Profile</th>
                      <th className="px-4 py-3">Age & Height</th>
                      <th className="px-4 py-3">Community</th>
                      <th className="px-4 py-3">Education & Career</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12 px-4">
                          <div className="max-w-sm mx-auto space-y-2 font-montserrat">
                            <p className="text-sm font-bold text-gray-700">
                              No profiles matching current filters
                            </p>
                            <p className="text-xs text-gray-400">
                              {searchQuery
                                ? `No results found for "${searchQuery}".`
                                : statusFilter !== "all"
                                  ? `No profiles found with status "${statusFilter}".`
                                  : "No profiles found."}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery("");
                                setGenderFilter("all");
                                setStatusFilter("all");
                              }}
                              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#701C35] hover:bg-[#8B2342] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                            >
                              <RefreshCw size={13} />
                              <span>Show All Registrations ({profiles.length})</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-amber-50/40 transition"
                        >
                          <td className="px-4 py-3.5 flex items-center gap-3">
                            <img
                              src={p.photo}
                              alt={p.name}
                              className="h-10 w-10 rounded-full object-cover border border-[#eadfce]"
                            />
                            <div>
                              <div className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                                <span>{p.name}</span>
                                {(p.isApproved || p.verified) && (
                                  <ShieldCheck
                                    size={14}
                                    className="text-emerald-600"
                                    title="Approved & Verified Member"
                                  />
                                )}
                              </div>
                              <div className="text-[11px] text-[#701C35] font-medium truncate max-w-[190px]">
                                {p.email}
                              </div>
                              <span className="text-[10px] text-gray-400">
                                {p.phone ? `${p.phone} · ` : ""}
                                {p.id} · {p.gender}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            <div>{p.age} yrs</div>
                            <div className="text-[10px] text-gray-400">
                              {p.height}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            <div>{p.religion}</div>
                            <div className="text-[10px] text-gray-400">
                              {p.caste || p.motherTongue}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            <div className="font-medium text-gray-900">
                              {p.profession}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {p.education}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {p.location}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {p.status === "rejected" ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                  <XCircle size={12} />
                                  <span>Rejected</span>
                                </span>
                                <button
                                  onClick={() =>
                                    handleApproveProfile(p.id, p.name)
                                  }
                                  className="text-[10px] text-[#701C35] hover:underline font-semibold cursor-pointer"
                                  title="Re-approve application"
                                >
                                  Re-Approve
                                </button>
                              </div>
                            ) : p.isApproved || p.verified ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 size={12} />
                                  <span>Approved</span>
                                </span>
                                <button
                                  onClick={() =>
                                    handleResendApproval(p.id, p.name)
                                  }
                                  className="text-[9px] text-[#701C35] hover:underline font-medium cursor-pointer"
                                  title="Resend temporary login credentials email"
                                >
                                  Resend Email
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() =>
                                    handleApproveProfile(p.id, p.name)
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
                                  title="Approve user, hash temporary password & send approval email"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectProfile(p.id, p.name)
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition cursor-pointer"
                                  title="Reject registration & notify applicant"
                                >
                                  <XCircle size={13} />
                                  <span>Reject</span>
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingProfile(p)}
                                className="p-1.5 rounded text-gray-500 hover:text-[#701C35] hover:bg-gray-100 transition cursor-pointer"
                                title="Edit Profile"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() =>
                                  promptDeleteProfile(p.id, p.name)
                                }
                                className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Delete Profile"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEADS & INQUIRIES */}
        {activeTab === "inquiries" && (
          <div className="space-y-4 font-montserrat">
            <div className="bg-white p-4 rounded-xl border border-[#eadfce] shadow-sm flex items-center justify-between">
              <div>
                <h3 className="serif text-xl font-bold text-[#701C35]">
                  Website Inquiries & Search Leads
                </h3>
                <p className="text-xs text-gray-500">
                  Live submissions received through the homepage search bar and
                  registration links.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#701C35] text-white text-xs font-semibold">
                {inquiries.length} Total Leads
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inquiries.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-[#eadfce]">
                  No inquiries recorded yet. Test by submitting from the home
                  page!
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="bg-white p-5 rounded-xl border border-[#eadfce] shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400">
                        {inq.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          inq.status === "New"
                            ? "bg-red-100 text-red-700"
                            : inq.status === "Contacted"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {inq.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {inq.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Looking for a{" "}
                        <b className="text-gray-800">{inq.lookingFor}</b> · Aged{" "}
                        {inq.ageRange}
                      </p>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1 bg-[#FAF7F1] p-2.5 rounded-lg border border-[#eadfce]/60">
                      <div>
                        <b>Religion:</b> {inq.religion || "Any"}
                      </div>
                      <div>
                        <b>Mother Tongue:</b> {inq.motherTongue || "Any"}
                      </div>
                      {inq.phone && (
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Phone size={12} className="text-[#B28D53]" />{" "}
                          {inq.phone}
                        </div>
                      )}
                      {inq.email && (
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Mail size={12} className="text-[#B28D53]" />{" "}
                          {inq.email}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 pt-1">
                        <Calendar size={11} />{" "}
                        {new Date(inq.date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <select
                        value={inq.status}
                        onChange={(e) =>
                          handleInquiryStatus(inq.id, e.target.value)
                        }
                        className="text-xs px-2 py-1 rounded border border-gray-200 bg-white cursor-pointer"
                      >
                        <option value="New">Mark New</option>
                        <option value="Contacted">Mark Contacted</option>
                        <option value="Closed">Mark Closed</option>
                      </select>

                      <button
                        onClick={() => promptDeleteInquiry(inq.id, inq.name)}
                        className="text-gray-400 hover:text-red-600 p-1 cursor-pointer transition"
                        title="Delete Inquiry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS & LIVE ACTIVITY STREAM */}
        {activeTab === "notifications" && (
          <div className="space-y-6 font-montserrat">
            {/* Header banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-[#eadfce] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#701C35] text-white flex-shrink-0 shadow-md">
                  <BellRing size={24} />
                </div>
                <div>
                  <h3 className="serif text-xl sm:text-2xl font-bold text-[#701C35]">
                    Notification Center
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Real-time stream of member registrations, inquiry leads, and
                    platform activity.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={markAllNotificationsAsRead}
                  disabled={notifications.filter((n) => !n.isRead).length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-[#eadfce] hover:bg-[#FAF7F1] text-gray-700 transition cursor-pointer disabled:opacity-40"
                >
                  <Check size={14} className="text-emerald-600" />
                  <span>Mark All Read</span>
                </button>
                <button
                  onClick={clearAllNotifications}
                  disabled={notifications.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer disabled:opacity-40"
                >
                  <Trash2 size={14} />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: `All Registrations (${notifications.length})` },
                {
                  id: "unread",
                  label: `Unread (${notifications.filter((n) => !n.isRead).length})`,
                },
                {
                  id: "read",
                  label: `Read (${notifications.filter((n) => n.isRead).length})`,
                },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setNotifFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    notifFilter === f.id
                      ? "bg-[#701C35] text-white shadow-xs"
                      : "bg-white text-gray-600 border border-[#eadfce] hover:bg-[#FAF7F1]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Notification Stream Cards */}
            <div className="space-y-3">
              {notifications.filter((n) => {
                if (notifFilter === "unread") return !n.isRead;
                if (notifFilter === "read") return n.isRead;
                return true;
              }).length === 0 ? (
                <div className="bg-white rounded-xl border border-[#eadfce] p-12 text-center text-gray-400">
                  <Bell size={36} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-semibold text-gray-600">
                    No notifications found
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    When users register on the home page or submit inquiries,
                    pop messages and logs will appear here.
                  </p>
                </div>
              ) : (
                notifications
                  .filter((n) => {
                    if (notifFilter === "unread") return !n.isRead;
                    if (notifFilter !== "all") return n.type === notifFilter;
                    return true;
                  })
                  .map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition cursor-pointer ${
                        !notif.isRead
                          ? "bg-white border-[#C8A96B] shadow-sm ring-1 ring-[#C8A96B]/30"
                          : "bg-white/70 border-[#eadfce] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`p-2.5 rounded-xl flex-shrink-0 ${
                            notif.type === "registration"
                              ? "bg-[#701C35] text-white"
                              : notif.type === "inquiry"
                                ? "bg-blue-600 text-white"
                                : notif.type === "verified"
                                  ? "bg-emerald-600 text-white"
                                  : notif.type === "delete"
                                    ? "bg-red-500 text-white"
                                    : "bg-[#B28D53] text-white"
                          }`}
                        >
                          {notif.type === "registration" ? (
                            <UserPlus size={18} />
                          ) : notif.type === "inquiry" ? (
                            <MessageSquare size={18} />
                          ) : notif.type === "verified" ? (
                            <ShieldCheck size={18} />
                          ) : notif.type === "delete" ? (
                            <Trash2 size={18} />
                          ) : (
                            <Bell size={18} />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                              {notif.title}
                            </h4>
                            {!notif.isRead && (
                              <span
                                className="h-2 w-2 rounded-full bg-[#701C35] inline-block"
                                title="Unread"
                              />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                            <span>
                              {new Date(notif.timestamp).toLocaleString()}
                            </span>
                            {notif.action && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markNotificationAsRead(notif.id);
                                  if (notif.action.tab)
                                    setActiveTab(notif.action.tab);
                                  if (notif.action.search)
                                    setSearchQuery(notif.action.search);
                                }}
                                className="font-semibold text-[#701C35] hover:underline cursor-pointer"
                              >
                                Go to{" "}
                                {notif.action.tab === "profiles"
                                  ? "Profiles"
                                  : "Leads"}{" "}
                                →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="text-gray-300 hover:text-red-600 p-1 rounded-full cursor-pointer transition"
                        title="Delete notification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PLATFORM STATS & METRICS */}
        {activeTab === "settings" && (
          <div className="max-w-2xl bg-white p-6 rounded-xl border border-[#eadfce] shadow-sm font-montserrat">
            <h3 className="serif text-xl font-bold text-[#701C35]">
              Homepage Statistics Control
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              Update the animated numbers displayed in the live website's
              statistics counter cards.
            </p>

            <form onSubmit={handleSaveStats} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Verified Profiles (Target Number for %)
                </label>
                <input
                  type="number"
                  value={editStats.verifiedProfiles}
                  onChange={(e) =>
                    setEditStats({
                      ...editStats,
                      verifiedProfiles: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#701C35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Happy Connections (Target Number for +)
                </label>
                <input
                  type="number"
                  value={editStats.happyConnections}
                  onChange={(e) =>
                    setEditStats({
                      ...editStats,
                      happyConnections: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#701C35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Registered Members (Target Number for K+)
                </label>
                <input
                  type="number"
                  value={editStats.registeredMembers}
                  onChange={(e) =>
                    setEditStats({
                      ...editStats,
                      registeredMembers: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#701C35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Trusted Experience (Target Number for +)
                </label>
                <input
                  type="number"
                  value={editStats.trustedExperience}
                  onChange={(e) =>
                    setEditStats({
                      ...editStats,
                      trustedExperience: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#701C35]"
                />
              </div>

              <button
                type="submit"
                className="mt-4 px-6 py-2.5 rounded-lg bg-[#701C35] hover:bg-[#511327] text-white font-semibold text-xs transition cursor-pointer shadow"
              >
                Save Platform Stats
              </button>
            </form>
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#eadfce] my-8 font-montserrat">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="serif text-xl font-bold text-[#701C35]">
                Edit Profile ({editingProfile.id})
              </h3>
              <button
                onClick={() => setEditingProfile(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpdateProfile}
              className="mt-4 space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingProfile.name}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:border-[#701C35]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Gender</label>
                  <select
                    value={editingProfile.gender}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        gender: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-gray-300 bg-white"
                  >
                    <option value="Bride">Bride</option>
                    <option value="Groom">Groom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    value={editingProfile.age}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        age: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Height</label>
                  <input
                    type="text"
                    value={editingProfile.height}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        height: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Religion</label>
                  <select
                    value={editingProfile.religion}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        religion: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-gray-300 bg-white"
                  >
                    <option>Hindu</option>
                    <option>Christian</option>
                    <option>Muslim</option>
                    <option>Sikh</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Caste</label>
                  <input
                    type="text"
                    value={editingProfile.caste}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        caste: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Education</label>
                  <input
                    type="text"
                    value={editingProfile.education}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        education: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Profession</label>
                  <input
                    type="text"
                    value={editingProfile.profession}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        profession: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={editingProfile.location}
                  onChange={(e) =>
                    setEditingProfile({
                      ...editingProfile,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Photo URL</label>
                <input
                  type="url"
                  value={editingProfile.photo}
                  onChange={(e) =>
                    setEditingProfile({
                      ...editingProfile,
                      photo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded border border-gray-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editVerifiedCheck"
                  checked={editingProfile.verified}
                  onChange={(e) =>
                    setEditingProfile({
                      ...editingProfile,
                      verified: e.target.checked,
                    })
                  }
                  className="rounded text-[#701C35]"
                />
                <label
                  htmlFor="editVerifiedCheck"
                  className="font-semibold cursor-pointer"
                >
                  Verified Profile
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#701C35] hover:bg-[#511327] text-white font-semibold transition cursor-pointer shadow"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL (NO BROWSER POPUPS/ALERTS) */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#eadfce] font-montserrat my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="serif text-xl font-bold text-center text-gray-900">
              {confirmModal.title}
            </h3>
            <p className="mt-2 text-xs text-center text-gray-500 leading-relaxed max-w-xs mx-auto">
              {confirmModal.message}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="w-1/2 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="w-1/2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-red-600/20"
              >
                {confirmModal.confirmText || "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CREDENTIALS / APPROVAL SUCCESS MODAL */}
      {approvalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-[#eadfce] font-montserrat my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <Key size={26} />
            </div>
            <h3 className="serif text-xl sm:text-2xl font-bold text-center text-gray-900">
              {approvalModal.isResend ? "Credentials Reissued" : "Account Approved"}
            </h3>
            <p className="mt-1 text-xs text-center text-gray-500">
              Member: <b className="text-gray-900">{approvalModal.name}</b>
              {approvalModal.email && <span> ({approvalModal.email})</span>}
            </p>

            <div className="mt-5 bg-[#FAF7F1] border border-[#eadfce] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
                <span>Temporary Password</span>
                <span className="text-[10px] text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                  ⏱️ Expires in 10 mins
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-2 bg-white px-3.5 py-2.5 rounded-lg border border-[#eadfce]">
                <code className="font-mono font-bold text-base text-[#701C35] tracking-wider select-all">
                  {approvalModal.temporaryPassword}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(approvalModal.temporaryPassword);
                    setCopiedPassword(true);
                    setTimeout(() => setCopiedPassword(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#701C35] hover:bg-[#8B2342] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  {copiedPassword ? (
                    <>
                      <Check size={13} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                Combination of uppercase, lowercase, numbers &amp; special characters. Valid for 10 minutes.
              </p>
            </div>

            <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Nodemailer Dispatched</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-700">
                Email has been sent to <b>{approvalModal.email}</b>. If not visible in the inbox, ask the member to check their <b>Spam</b> or <b>Promotions</b> folder.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setApprovalModal(null);
                setCopiedPassword(false);
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#701C35] hover:bg-[#8B2342] text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-[#701C35]/20"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
      {/* CREDENTIALS / APPROVAL SUCCESS MODAL */}
      {approvalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-[#eadfce] font-montserrat my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <Key size={26} />
            </div>
            <h3 className="serif text-xl sm:text-2xl font-bold text-center text-gray-900">
              {approvalModal.isResend ? "Credentials Reissued" : "Account Approved"}
            </h3>
            <p className="mt-1 text-xs text-center text-gray-500">
              Member: <b className="text-gray-900">{approvalModal.name}</b>
              {approvalModal.email && <span> ({approvalModal.email})</span>}
            </p>

            <div className="mt-5 bg-[#FAF7F1] border border-[#eadfce] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
                <span>Temporary Password</span>
                <span className="text-[10px] text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                  ⏱️ Expires in 10 mins
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-2 bg-white px-3.5 py-2.5 rounded-lg border border-[#eadfce]">
                <code className="font-mono font-bold text-base text-[#701C35] tracking-wider select-all">
                  {approvalModal.temporaryPassword}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(approvalModal.temporaryPassword);
                    setCopiedPassword(true);
                    setTimeout(() => setCopiedPassword(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#701C35] hover:bg-[#8B2342] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  {copiedPassword ? (
                    <>
                      <Check size={13} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                Combination of uppercase, lowercase, numbers &amp; special characters. Valid for 10 minutes.
              </p>
            </div>

            <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Nodemailer Dispatched</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-700">
                Email has been sent to <b>{approvalModal.email}</b>. If not visible in the inbox, ask the member to check their <b>Spam</b> or <b>Promotions</b> folder.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setApprovalModal(null);
                setCopiedPassword(false);
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#701C35] hover:bg-[#8B2342] text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-[#701C35]/20"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
