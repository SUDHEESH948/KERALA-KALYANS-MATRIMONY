import { useState, useEffect, useRef, useCallback } from "react";
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
import AdminContactDialog from "../components/AdminContactDialog";
import { useNotification } from "../context/NotificationContext";
import AdminWhatsAppFollowUps from "../components/AdminWhatsAppFollowUps";
import {
  KERALA_NAKSHATRAS,
  KERALA_DISTRICTS,
  HEIGHT_OPTIONS,
  INFORMER_RELATIONS
} from "../config/keralaMatrimonyData";

const gothamStylesheet = import.meta.env.VITE_ADMIN_GOTHAM_STYLESHEET?.trim();

function sessionExpiresAt(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));
    return Number.isFinite(exp) ? exp * 1000 : 0;
  } catch {
    return 0;
  }
}

export default function AdminPage({ onExit }) {
  const [contactOpen, setContactOpen] = useState(false);
  useEffect(() => {
    if (!gothamStylesheet) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = gothamStylesheet;
    document.head.append(link);
    return () => link.remove();
  }, []);

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
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard tab state
  const [activeTab, setActiveTab] = useState("profiles");

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

  const signIn = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok && data?.error) throw new Error(data.error);
    if (!res.ok || !data?.token || !data?.admin) {
      throw new Error("The sign-in service is unavailable. Please try again later.");
    }

    localStorage.setItem("apremiya_admin_token", data.token);
    localStorage.setItem("apremiya_admin_user", JSON.stringify(data.admin));
    setToken(data.token);
    setAdminUser(data.admin);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      await signIn(loginEmail, loginPassword);
      addNotification(
        "Welcome Back",
        "Administrator session authenticated successfully.",
        "verified",
      );
    } catch (err) {
      setLoginError(
        err instanceof TypeError
          ? "Could not reach the sign-in service. Please try again later."
          : err.message,
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const clearSession = useCallback((message) => {
    setToken("");
    setAdminUser(null);
    setLoginPassword("");
    setContactOpen(false);
    setEditingProfile(null);
    setConfirmModal(null);
    setApprovalModal(null);
    setProfiles([]);
    setInquiries([]);
    setLoginError(message);
  }, []);

  const endSession = useCallback((message) => {
    if (localStorage.getItem("apremiya_admin_token") !== token) return;
    localStorage.removeItem("apremiya_admin_token");
    localStorage.removeItem("apremiya_admin_user");
    clearSession(message);
  }, [token, clearSession]);

  const expireSession = useCallback(() => {
    endSession("Your admin session ended. Sign in again to continue.");
  }, [endSession]);

  useEffect(() => {
    if (!token) return;
    const expiresAt = sessionExpiresAt(token);
    let timer;
    const checkSession = () => {
      clearTimeout(timer);
      if (localStorage.getItem("apremiya_admin_token") !== token) {
        clearSession("Your admin session changed. Sign in again to continue.");
        return;
      }
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) expireSession();
      else timer = setTimeout(checkSession, Math.min(remaining, 2_147_483_647));
    };
    const checkStorage = (event) => {
      if (event.key === "apremiya_admin_token" || event.key === null) checkSession();
    };
    checkSession();
    window.addEventListener("storage", checkStorage);
    window.addEventListener("focus", checkSession);
    document.addEventListener("visibilitychange", checkSession);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("storage", checkStorage);
      window.removeEventListener("focus", checkSession);
      document.removeEventListener("visibilitychange", checkSession);
    };
  }, [token, clearSession, expireSession]);

  const fetchAsAdmin = async (url, options) => {
    const response = await fetch(url, options);
    if (response.status === 401 || response.status === 403) expireSession();
    return response;
  };

  // Fetch all data (with silent background auto-refresh & real-time notification detection)
  const fetchData = async (isSilent = false) => {
    if (!token) return;
    if (!isSilent) setIsLoading(true);
    try {
      const [resStats, resProfiles, resInquiries] = await Promise.all([
        fetch(`${API_BASE}/stats`),
        fetchAsAdmin(`${API_BASE}/profiles/admin`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/inquiries`),
      ]);
      if (resProfiles.status === 401 || resProfiles.status === 403 ||
          localStorage.getItem("apremiya_admin_token") !== token) return;

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
      const res = await fetchAsAdmin(`${API_BASE}/profiles/${id}/approve`, {
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
      const res = await fetchAsAdmin(`${API_BASE}/profiles/${id}/reject`, {
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
      const res = await fetchAsAdmin(`${API_BASE}/profiles/${id}/resend-approval`, {
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
        const res = await fetchAsAdmin(`${API_BASE}/profiles/${id}/verify`, {
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
          const res = await fetchAsAdmin(`${API_BASE}/profiles/${id}`, {
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
      const res = await fetchAsAdmin(`${API_BASE}/profiles/${editingProfile.id}`, {
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
          prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
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
      <div className="min-h-screen bg-[var(--admin-surface)] flex flex-col justify-center items-center p-4 admin-page">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[var(--admin-border)] p-5 sm:p-8">
          <div className="text-center mb-6">
            <img
              src="/kerala-kalyan-logo.png"
              alt="Kerala Kalyans Matrimony"
              className="h-12 w-auto mx-auto object-contain mb-3"
            />
            <h1 className="text-2xl sm:text-3xl text-[var(--admin-gold-ink)]">
              Kerala Kalyans Admin
            </h1>
            <p className="text-xs tracking-[2px] font-semibold text-[var(--admin-gold-text)] mt-1">
              PORTAL CONTROL PANEL
            </p>
          </div>

          {loginError && (
            <div className="mb-4 rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border)] p-3 text-xs text-[var(--admin-gold-text)] flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--admin-gold-ink)] mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--admin-border)] text-sm focus:outline-none focus:border-[var(--admin-gold-ink)] focus:ring-1 focus:ring-[var(--admin-gold-ink)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--admin-gold-ink)] mb-1">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--admin-border)] text-sm focus:outline-none focus:border-[var(--admin-gold-ink)] focus:ring-1 focus:ring-[var(--admin-gold-ink)]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-2 py-3 rounded-lg bg-[var(--admin-gold)] hover:bg-[var(--admin-gold-hover)] text-[var(--admin-gold-ink)] font-semibold text-sm transition shadow-md cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn
                ? "Verifying Credentials..."
                : "Sign In to Admin Panel"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--admin-border)] flex items-center justify-end text-xs">
            {onExit && (
              <button
                onClick={onExit}
                className="text-[var(--admin-gold-ink)] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
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
    <div className="min-h-screen bg-[var(--admin-canvas)] text-[var(--admin-gold-ink)] admin-page">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-[var(--admin-border)] bg-white text-[var(--admin-gold-ink)] shadow-sm">
        <div className="mx-auto max-w-[1400px] px-2.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src="/kerala-kalyan-logo.png"
              alt="Kerala Kalyans Matrimony"
              className="h-8 sm:h-9 w-auto object-contain bg-white rounded-md p-1 flex-shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl leading-tight truncate">
                Kerala Kalyans
              </h2>
              <p className="text-[10px] sm:text-[11px] tracking-[1.5px] sm:tracking-[2px] text-[var(--admin-gold-text)] font-semibold truncate">
                ADMIN CONSOLE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 text-xs flex-shrink-0">
            <div className="hidden md:block text-right">
              <p className="font-semibold truncate max-w-[120px]">
                {adminUser?.name || "Administrator"}
              </p>
              <p className="text-[12px] text-[var(--admin-gold-text)] truncate max-w-[120px]">
                {adminUser?.email}
              </p>
            </div>

            {/* Notification Bell Button */}
            <button
              onClick={() => setActiveTab("notifications")}
              className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-md transition cursor-pointer font-semibold ${
                activeTab === "notifications"
                  ? "bg-[var(--admin-gold)] text-[var(--admin-gold-ink)]"
                  : "bg-[var(--admin-surface)] hover:bg-[var(--admin-gold-light)] text-[var(--admin-gold-ink)]"
              }`}
              title="Notifications Center"
            >
              <Bell size={15} />
              <span className="hidden md:inline">Notifications</span>
              {unreadCount > 0 && (
                <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[var(--admin-gold-strong)] text-[11px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {onExit && (
              <button
                onClick={onExit}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[var(--admin-surface)] hover:bg-[var(--admin-gold-light)] transition cursor-pointer font-semibold"
                aria-label="View main website"
                title="View Main Website"
              >
                <ArrowLeft size={13} />
                <span className="hidden sm:inline">Site</span>
              </button>
            )}

            <button
              onClick={() => endSession("")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[var(--admin-gold-strong)] hover:bg-[var(--admin-gold-strong-hover)] text-white transition cursor-pointer font-semibold"
              aria-label="Sign out"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-[var(--admin-border)] pb-4">
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-center">
            {[
              { id: "profiles", label: "Profiles", count: profiles.length },
              { id: "whatsapp", label: "WhatsApp Follow-ups" },
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
                type="button"
                aria-pressed={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`admin-tab min-h-11 min-w-0 px-2 py-2 sm:min-h-0 sm:whitespace-nowrap sm:px-3 sm:py-1.5 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-[var(--admin-gold-strong)] text-white shadow-md"
                    : "bg-white text-[var(--admin-gold-text)] hover:bg-[var(--admin-surface)] border border-[var(--admin-border)]"
                }`}
              >
                <span className="min-w-0 text-center wrap-anywhere">{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`shrink-0 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === tab.id
                        ? "bg-white/25 text-white"
                        : tab.isBadge && tab.count > 0
                          ? "bg-[var(--admin-gold-strong)] text-white"
                          : "bg-[var(--admin-surface)] text-[var(--admin-gold-ink)]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => setContactOpen(true)}
              className="admin-tab min-h-11 rounded-lg border border-[var(--admin-border)] bg-white px-2 py-2 text-xs text-[var(--admin-gold-text)] transition hover:bg-[var(--admin-surface)] sm:min-h-0 sm:px-3 sm:py-1.5"
            >
              Contact
            </button>
          </div>
        </div>

        {contactOpen && <AdminContactDialog token={token} onSessionEnded={expireSession} onClose={() => setContactOpen(false)} />}

        {activeTab === "whatsapp" && (
          <AdminWhatsAppFollowUps
            profiles={profiles}
            isLoading={isLoading}
            lastRefreshedAt={lastRefreshedAt}
          />
        )}

        {/* TAB 1: PROFILES MANAGEMENT */}
        {activeTab === "profiles" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div
                onClick={() => {
                  setStatusFilter("all");
                  setGenderFilter("all");
                  setSearchQuery("");
                }}
                className={`p-3 sm:p-4 rounded-xl border transition cursor-pointer shadow-xs ${
                  statusFilter === "all" && !searchQuery
                    ? "bg-white border-[var(--admin-gold-ink)] ring-2 ring-[var(--admin-gold-ink)]/20"
                    : "bg-white border-[var(--admin-border)] hover:border-[var(--admin-gold-ink)]/50"
                }`}
                title="Click to view all registrations"
              >
                <p className="text-[12px] sm:text-xs text-[var(--admin-gold-text)] font-semibold truncate">
                  Total Registrations
                </p>
                <h3 className="text-xl sm:text-2xl text-[var(--admin-gold-ink)] mt-0.5">
                  {profiles.length}
                </h3>
              </div>
              <div
                onClick={() => setStatusFilter("pending")}
                className={`p-3 sm:p-4 rounded-xl border transition cursor-pointer shadow-xs ${
                  statusFilter === "pending"
                    ? "bg-[var(--admin-surface)] border-[var(--admin-gold)] ring-2 ring-[var(--admin-gold)]/30"
                    : "bg-[var(--admin-surface)]/50 border-[var(--admin-border)] hover:border-[var(--admin-gold)]"
                }`}
                title="Click to view pending approval registrations"
              >
                <p className="text-[12px] sm:text-xs text-[var(--admin-gold-ink)] font-semibold truncate">
                  Pending Approval
                </p>
                <h3 className="text-xl sm:text-2xl text-[var(--admin-gold-text)] mt-0.5">
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
                    ? "bg-[var(--admin-surface)] border-[var(--admin-gold)] ring-2 ring-[var(--admin-gold)]/30"
                    : "bg-[var(--admin-surface)]/40 border-[var(--admin-border)] hover:border-[var(--admin-gold)]"
                }`}
                title="Click to view approved active members"
              >
                <p className="text-[12px] sm:text-xs text-[var(--admin-gold-ink)] font-semibold truncate">
                  Approved & Active
                </p>
                <h3 className="text-xl sm:text-2xl text-[var(--admin-gold-text)] mt-0.5">
                  {profiles.filter((p) => p.isApproved || p.verified).length}
                </h3>
              </div>
              <div
                onClick={() => setStatusFilter("rejected")}
                className={`p-3 sm:p-4 rounded-xl border transition cursor-pointer shadow-xs ${
                  statusFilter === "rejected"
                    ? "bg-[var(--admin-surface)] border-[var(--admin-gold)] ring-2 ring-[var(--admin-gold)]/30"
                    : "bg-[var(--admin-surface)]/40 border-[var(--admin-border)] hover:border-[var(--admin-gold)]"
                }`}
                title="Click to view rejected applications"
              >
                <p className="text-[12px] sm:text-xs text-[var(--admin-gold-ink)] font-semibold truncate">
                  Rejected
                </p>
                <h3 className="text-xl sm:text-2xl text-[var(--admin-gold-text)] mt-0.5">
                  {profiles.filter((p) => p.status === "rejected").length}
                </h3>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl border border-[var(--admin-border)] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full">
                <div className="relative flex-1 min-w-0 w-full">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-gold-text)]"
                  />
                  <input
                    type="text"
                    placeholder="Search name, email, phone, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-8 py-2 rounded-lg border border-[var(--admin-border)] focus:outline-none focus:border-[var(--admin-gold-ink)] text-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-gold-text)] hover:text-[var(--admin-gold-text)] p-0.5"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full sm:w-auto px-2.5 py-2 rounded-lg border border-[var(--admin-border)] bg-white font-medium focus:outline-none text-xs"
                  >
                    <option value="all">All Genders</option>
                    <option value="Bride">Brides</option>
                    <option value="Groom">Grooms</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto px-2.5 py-2 rounded-lg border border-[var(--admin-border)] bg-white font-medium focus:outline-none text-xs"
                  >
                    <option value="all">All Registrations</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved Members</option>
                    <option value="rejected">Rejected Applications</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="admin-profiles w-full text-left text-xs" role="table" aria-label="Registered profiles">
                  <thead role="rowgroup" className="bg-[var(--admin-surface)] border-b border-[var(--admin-border)] text-[var(--admin-gold-text)] font-semibold uppercase tracking-wider text-[12px]">
                    <tr role="row">
                      <th role="columnheader" scope="col" className="px-4 py-3">Profile</th>
                      <th role="columnheader" scope="col" className="px-4 py-3">Age & Height</th>
                      <th role="columnheader" scope="col" className="px-4 py-3">Community</th>
                      <th role="columnheader" scope="col" className="px-4 py-3">Education & Career</th>
                      <th role="columnheader" scope="col" className="px-4 py-3">Location</th>
                      <th role="columnheader" scope="col" className="px-4 py-3 text-left lg:text-center">Status</th>
                      <th role="columnheader" scope="col" className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody role="rowgroup" className="divide-y divide-[var(--admin-border)]">
                    {filteredProfiles.length === 0 ? (
                      <tr role="row">
                        <td role="cell" colSpan="7" className="text-center py-12 px-4">
                          <div className="max-w-sm mx-auto space-y-2">
                            <p className="text-sm font-bold text-[var(--admin-gold-ink)]">
                              No profiles matching current filters
                            </p>
                            <p className="text-xs text-[var(--admin-gold-text)]">
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
                              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--admin-gold-strong)] hover:bg-[var(--admin-gold-strong-hover)] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                            >
                              <RefreshCw size={13} />
                              <span>
                                Show All Registrations ({profiles.length})
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map((p) => (
                        <tr
                          role="row"
                          key={p.id}
                          className="hover:bg-[var(--admin-surface)]/40 transition"
                        >
                          <td role="cell" className="px-4 py-3.5">
                            <div className="flex min-w-0 items-center gap-3">
                              <img
                                src={p.photo}
                                alt={p.name}
                                className="h-10 w-10 shrink-0 rounded-full object-cover border border-[var(--admin-border)]"
                              />
                              <div className="min-w-0 wrap-anywhere">
                                <div className="font-semibold text-[var(--admin-gold-ink)] text-sm flex items-center gap-1.5">
                                  <span>{p.name}</span>
                                  {(p.isApproved || p.verified) && (
                                    <ShieldCheck
                                      size={14}
                                      className="text-[var(--admin-gold-text)]"
                                      title="Approved & Verified Member"
                                    />
                                  )}
                                </div>
                                <div className="text-[13px] text-[var(--admin-gold-ink)] font-medium lg:truncate lg:max-w-[190px]">
                                  {p.email}
                                </div>
                                <span className="text-[12px] text-[var(--admin-gold-text)]">
                                  {p.phone ? `${p.phone} · ` : ""}
                                  {p.id} · {p.gender} ·{" "}
                                  <span className="text-[var(--admin-gold-ink)] font-medium">
                                    {p.marriageType ||
                                      p.maritalStatus ||
                                      "Never Married"}
                                  </span>
                                  {p.bookNo && (
                                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px]">
                                      Book #{p.bookNo}
                                    </span>
                                  )}
                                </span>
                                {p.informerName && (
                                  <div className="text-[11px] text-[var(--admin-gold-text)]">
                                    Informer: <b>{p.informerName}</b> {p.informerRelation ? `(${p.informerRelation})` : ""}
                                  </div>
                                )}
                                <div className="mt-1 text-[13px] font-medium text-[var(--admin-gold-ink)]">
                                  Profiles opened {p.profileOpenCount} / {p.profileOpenLimit}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td role="cell" className="px-4 py-3 text-[var(--admin-gold-ink)]">
                            <span aria-hidden="true" className="mb-1 block font-semibold lg:hidden">
                              Age & Height
                            </span>
                            <div>{p.age} yrs</div>
                            <div className="text-[12px] text-[var(--admin-gold-text)]">
                              {p.height}
                            </div>
                          </td>
                          <td role="cell" className="px-4 py-3 text-[var(--admin-gold-ink)]">
                            <span aria-hidden="true" className="mb-1 block font-semibold lg:hidden">
                              Community &amp; Star
                            </span>
                            <div>{p.religion} · {p.caste || p.motherTongue}</div>
                            {(p.star || p.nakshatra) && (
                              <div className="text-[12px] font-bold text-[#701C35]">
                                ⭐ {p.star || p.nakshatra}
                              </div>
                            )}
                          </td>
                          <td role="cell" className="px-4 py-3 text-[var(--admin-gold-ink)]">
                            <span aria-hidden="true" className="mb-1 block font-semibold lg:hidden">
                              Education & Career
                            </span>
                            <div className="font-medium text-[var(--admin-gold-ink)]">
                              {p.profession}
                            </div>
                            <div className="text-[12px] text-[var(--admin-gold-text)]">
                              {p.education}
                            </div>
                          </td>
                          <td role="cell" className="px-4 py-3 text-[var(--admin-gold-ink)]">
                            <span aria-hidden="true" className="mb-1 block font-semibold lg:hidden">
                              Location &amp; Address
                            </span>
                            <div className="font-medium">{p.district ? `${p.district}, ` : ''}{p.location}</div>
                            {(p.houseName || p.postOffice) && (
                              <div className="text-[11px] text-[var(--admin-gold-text)]">
                                {[p.houseName, p.postOffice, p.pincode].filter(Boolean).join(", ")}
                              </div>
                            )}
                          </td>
                          <td role="cell" className="px-4 py-3 text-left lg:text-center">
                            {p.status === "rejected" ? (
                              <div className="flex flex-col items-start gap-1 lg:items-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-[var(--admin-surface)] text-[var(--admin-gold-ink)] border border-[var(--admin-border)]">
                                  <XCircle size={12} />
                                  <span>Rejected</span>
                                </span>
                                <button
                                  onClick={() =>
                                    handleApproveProfile(p.id, p.name)
                                  }
                                  className="text-[12px] text-[var(--admin-gold-ink)] hover:underline font-semibold cursor-pointer"
                                  title="Re-approve application"
                                >
                                  Re-Approve
                                </button>
                              </div>
                            ) : p.isApproved || p.verified ? (
                              <div className="flex flex-col items-start gap-1 lg:items-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-[var(--admin-surface)] text-[var(--admin-gold-ink)] border border-[var(--admin-border)]">
                                  <CheckCircle2 size={12} />
                                  <span>Approved</span>
                                </span>
                                <button
                                  onClick={() =>
                                    handleResendApproval(p.id, p.name)
                                  }
                                  className="text-[11px] text-[var(--admin-gold-ink)] hover:underline font-medium cursor-pointer"
                                  title="Resend temporary login credentials email"
                                >
                                  Resend Email
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-1.5 lg:justify-center">
                                <button
                                  onClick={() =>
                                    handleApproveProfile(p.id, p.name)
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-[var(--admin-gold-strong)] hover:bg-[var(--admin-gold-strong-hover)] text-white shadow-xs transition cursor-pointer"
                                  title="Approve user, hash temporary password & send approval email"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectProfile(p.id, p.name)
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-[var(--admin-surface)] hover:bg-[var(--admin-surface)] text-[var(--admin-gold-text)] border border-[var(--admin-border)] transition cursor-pointer"
                                  title="Reject registration & notify applicant"
                                >
                                  <XCircle size={13} />
                                  <span>Reject</span>
                                </button>
                              </div>
                            )}
                          </td>
                          <td role="cell" className="px-4 py-3 text-right">
                            <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                              <button
                                onClick={() => {
                                  window.location.hash = `#profile/${p.id}`;
                                }}
                                className="p-2.5 lg:p-1.5 rounded text-[var(--admin-gold-text)] hover:text-[var(--admin-gold-ink)] hover:bg-[var(--admin-gold)]/15 transition cursor-pointer flex items-center gap-1"
                                title="View Complete Profile"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => setEditingProfile(p)}
                                className="p-2.5 lg:p-1.5 rounded text-[var(--admin-gold-text)] hover:text-[var(--admin-gold-ink)] hover:bg-[var(--admin-surface)] transition cursor-pointer"
                                title="Edit Profile"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() =>
                                  promptDeleteProfile(p.id, p.name)
                                }
                                className="p-2.5 lg:p-1.5 rounded text-[var(--admin-gold-text)] hover:text-[var(--admin-gold-text)] hover:bg-[var(--admin-surface)] transition cursor-pointer"
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
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[var(--admin-border)] shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl text-[var(--admin-gold-ink)]">
                  Website Inquiries & Search Leads
                </h3>
                <p className="text-xs text-[var(--admin-gold-text)]">
                  Live submissions received through the homepage search bar and
                  registration links.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[var(--admin-gold-strong)] text-white text-xs font-semibold">
                {inquiries.length} Total Leads
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inquiries.length === 0 ? (
                <div className="col-span-full py-12 text-center text-[var(--admin-gold-text)] bg-white rounded-xl border border-[var(--admin-border)]">
                  No inquiries recorded yet. Test by submitting from the home
                  page!
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="min-w-0 wrap-anywhere bg-white p-4 sm:p-5 rounded-xl border border-[var(--admin-border)] shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-bold text-[var(--admin-gold-text)]">
                        {inq.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[12px] font-semibold ${
                          inq.status === "New"
                            ? "bg-[var(--admin-surface)] text-[var(--admin-gold-ink)]"
                            : inq.status === "Contacted"
                              ? "bg-[var(--admin-surface)] text-[var(--admin-gold-ink)]"
                              : "bg-[var(--admin-surface)] text-[var(--admin-gold-ink)]"
                        }`}
                      >
                        {inq.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="card-title text-[var(--admin-gold-ink)] text-sm">
                        {inq.name}
                      </h4>
                      <p className="text-xs text-[var(--admin-gold-text)] mt-0.5">
                        Looking for a{" "}
                        <b className="text-[var(--admin-gold-ink)]">{inq.lookingFor}</b> · Aged{" "}
                        {inq.ageRange}
                      </p>
                    </div>

                    <div className="text-xs text-[var(--admin-gold-text)] space-y-1 bg-[var(--admin-surface)] p-2.5 rounded-lg border border-[var(--admin-border)]/60">
                      <div>
                        <b>Religion:</b> {inq.religion || "Any"}
                      </div>
                      <div>
                        <b>Mother Tongue:</b> {inq.motherTongue || "Any"}
                      </div>
                      {inq.phone && (
                        <div className="flex items-center gap-1.5 text-[var(--admin-gold-ink)]">
                          <Phone size={12} className="text-[var(--admin-gold-text)]" />{" "}
                          {inq.phone}
                        </div>
                      )}
                      {inq.email && (
                        <div className="flex items-center gap-1.5 text-[var(--admin-gold-ink)]">
                          <Mail size={12} className="text-[var(--admin-gold-text)]" />{" "}
                          {inq.email}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[12px] text-[var(--admin-gold-text)] pt-1">
                        <Calendar size={11} />{" "}
                        {new Date(inq.date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--admin-border)]">
                      <select
                        value={inq.status}
                        onChange={(e) =>
                          handleInquiryStatus(inq.id, e.target.value)
                        }
                        className="text-xs px-2 py-1 rounded border border-[var(--admin-border)] bg-white cursor-pointer"
                      >
                        <option value="New">Mark New</option>
                        <option value="Contacted">Mark Contacted</option>
                        <option value="Closed">Mark Closed</option>
                      </select>

                      <button
                        onClick={() => promptDeleteInquiry(inq.id, inq.name)}
                        className="text-[var(--admin-gold-text)] hover:text-[var(--admin-gold-text)] p-1 cursor-pointer transition"
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
          <div className="space-y-6">
            {/* Header banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-[var(--admin-border)] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--admin-gold-strong)] text-white flex-shrink-0 shadow-md">
                  <BellRing size={24} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl text-[var(--admin-gold-ink)]">
                    Notification Center
                  </h3>
                  <p className="text-xs text-[var(--admin-gold-text)] mt-0.5">
                    Real-time stream of member registrations, inquiry leads, and
                    platform activity.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={markAllNotificationsAsRead}
                  disabled={notifications.filter((n) => !n.isRead).length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-[var(--admin-border)] hover:bg-[var(--admin-surface)] text-[var(--admin-gold-ink)] transition cursor-pointer disabled:opacity-40"
                >
                  <Check size={14} className="text-[var(--admin-gold-text)]" />
                  <span>Mark All Read</span>
                </button>
                <button
                  onClick={clearAllNotifications}
                  disabled={notifications.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--admin-gold-text)] hover:bg-[var(--admin-surface)] border border-[var(--admin-border)] transition cursor-pointer disabled:opacity-40"
                >
                  <Trash2 size={14} />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                {
                  id: "all",
                  label: `All Registrations (${notifications.length})`,
                },
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
                      ? "bg-[var(--admin-gold-strong)] text-white shadow-xs"
                      : "bg-white text-[var(--admin-gold-text)] border border-[var(--admin-border)] hover:bg-[var(--admin-surface)]"
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
                <div className="bg-white rounded-xl border border-[var(--admin-border)] p-12 text-center text-[var(--admin-gold-text)]">
                  <Bell size={36} className="mx-auto mb-3 text-[var(--admin-gold-text)]" />
                  <p className="text-sm font-semibold text-[var(--admin-gold-text)]">
                    No notifications found
                  </p>
                  <p className="text-xs text-[var(--admin-gold-text)] mt-1">
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
                      className={`flex items-start justify-between flex-wrap gap-3 p-3 sm:flex-nowrap sm:gap-4 sm:p-4 rounded-xl border transition cursor-pointer ${
                        !notif.isRead
                          ? "bg-white border-[var(--admin-gold)] shadow-sm ring-1 ring-[var(--admin-gold)]/30"
                          : "bg-white/70 border-[var(--admin-border)] hover:bg-white"
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 basis-full items-start gap-3 sm:basis-auto">
                        <div className="p-2.5 rounded-xl flex-shrink-0 bg-[var(--admin-gold-strong)] text-white">
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

                        <div className="flex-1 min-w-0 wrap-anywhere">
                          <div className="flex items-center gap-2">
                            <h4 className="card-title text-xs sm:text-sm text-[var(--admin-gold-ink)]">
                              {notif.title}
                            </h4>
                            {!notif.isRead && (
                              <span
                                className="h-2 w-2 rounded-full bg-[var(--admin-gold-strong)] inline-block"
                                title="Unread"
                              />
                            )}
                          </div>
                          <p className="text-xs text-[var(--admin-gold-text)] mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[12px] text-[var(--admin-gold-text)]">
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
                                className="font-semibold text-[var(--admin-gold-ink)] hover:underline cursor-pointer"
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
                        className="text-[var(--admin-gold-text)] hover:text-[var(--admin-gold-text)] p-1 rounded-full cursor-pointer transition"
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
          <div className="max-w-2xl bg-white p-6 rounded-xl border border-[var(--admin-border)] shadow-sm">
            <h3 className="text-xl text-[var(--admin-gold-ink)]">
              Homepage Statistics Control
            </h3>
            <p className="text-xs text-[var(--admin-gold-text)] mt-1 mb-6">
              Update the animated numbers displayed in the live website's
              statistics counter cards.
            </p>

            <form onSubmit={handleSaveStats} className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--admin-gold-ink)] mb-1">
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
                  className="w-full px-3 py-2 rounded-lg border border-[var(--admin-border)] text-sm focus:outline-none focus:border-[var(--admin-gold-ink)]"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--admin-gold-ink)] mb-1">
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
                  className="w-full px-3 py-2 rounded-lg border border-[var(--admin-border)] text-sm focus:outline-none focus:border-[var(--admin-gold-ink)]"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--admin-gold-ink)] mb-1">
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
                  className="w-full px-3 py-2 rounded-lg border border-[var(--admin-border)] text-sm focus:outline-none focus:border-[var(--admin-gold-ink)]"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--admin-gold-ink)] mb-1">
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
                  className="w-full px-3 py-2 rounded-lg border border-[var(--admin-border)] text-sm focus:outline-none focus:border-[var(--admin-gold-ink)]"
                />
              </div>

              <button
                type="submit"
                className="mt-4 min-h-11 w-full px-4 py-2.5 sm:w-auto sm:px-6 rounded-lg bg-[var(--admin-gold-strong)] hover:bg-[var(--admin-gold-strong-hover)] text-white font-semibold text-xs transition cursor-pointer shadow"
              >
                Save Platform Stats
              </button>
            </form>
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-[var(--admin-gold-strong)]/35 p-3 backdrop-blur-xs sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full my-auto shrink-0 p-4 shadow-2xl border border-[var(--admin-border)] sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--admin-border)]">
              <h3 className="text-xl text-[var(--admin-gold-ink)]">
                Edit Profile ({editingProfile.id})
              </h3>
              <button
                onClick={() => setEditingProfile(null)}
                className="p-1 rounded-full hover:bg-[var(--admin-surface)] text-[var(--admin-gold-text)] hover:text-[var(--admin-gold-text)]"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpdateProfile}
              className="mt-4 space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block mb-1">Full Name</label>
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
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)] focus:outline-none focus:border-[var(--admin-gold-ink)]"
                  />
                </div>
                <div>
                  <label className="block mb-1">Gender</label>
                  <select
                    value={editingProfile.gender}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        gender: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)] bg-white"
                  >
                    <option value="Bride">Bride</option>
                    <option value="Groom">Groom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block mb-1">Age</label>
                  <input
                    type="number"
                    value={editingProfile.age}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        age: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                  />
                </div>
                <div>
                  <label className="block mb-1">Height</label>
                  <input
                    type="text"
                    value={editingProfile.height}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        height: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">
                  Marriage Type
                </label>
                <select
                  value={
                    editingProfile.marriageType ||
                    editingProfile.maritalStatus ||
                    "Never Married"
                  }
                  onChange={(e) =>
                    setEditingProfile({
                      ...editingProfile,
                      marriageType: e.target.value,
                      maritalStatus: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded border border-[var(--admin-border)] bg-white"
                >
                  <option value="Never Married">Never Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Awaiting Divorce">Awaiting Divorce</option>
                  <option value="Separated">Separated</option>
                  <option value="Second Marriage">Second Marriage</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block mb-1">Religion</label>
                  <select
                    value={editingProfile.religion}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        religion: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)] bg-white"
                  >
                    <option>Hindu</option>
                    <option>Christian</option>
                    <option>Muslim</option>
                    <option>Sikh</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Caste</label>
                  <input
                    type="text"
                    value={editingProfile.caste || ""}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        caste: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block mb-1">Star / Nakshatram (നക്ഷത്രം)</label>
                  <select
                    value={editingProfile.star || editingProfile.nakshatra || ""}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        star: e.target.value,
                        nakshatra: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)] bg-white"
                  >
                    <option value="">Select Nakshatram</option>
                    {KERALA_NAKSHATRAS.map((n) => (
                      <option key={n} value={n.split(' ')[0]}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">District (ജില്ല)</label>
                  <select
                    value={editingProfile.district || ""}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        district: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)] bg-white"
                  >
                    <option value="">Select District</option>
                    {KERALA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block mb-1">House Name (വീട്ടുപേര്)</label>
                  <input
                    type="text"
                    value={editingProfile.houseName || ""}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        houseName: e.target.value,
                      })
                    }
                    placeholder="e.g. Twins"
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                  />
                </div>
                <div>
                  <label className="block mb-1">Street / Landmark</label>
                  <input
                    type="text"
                    value={editingProfile.landmark || ""}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        landmark: e.target.value,
                      })
                    }
                    placeholder="e.g. Near Police Parade Ground"
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block mb-1">Post Office (P.O.)</label>
                  <input
                    type="text"
                    value={editingProfile.postOffice || ""}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        postOffice: e.target.value,
                      })
                    }
                    placeholder="e.g. (P O) Arpookara"
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                  />
                </div>
                <div>
                  <label className="block mb-1">Pin Code</label>
                  <input
                    type="text"
                    value={editingProfile.pincode || ""}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        pincode: e.target.value,
                      })
                    }
                    placeholder="e.g. 686008"
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block mb-1">Informer Name</label>
                  <input
                    type="text"
                    value={editingProfile.informerName || ""}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        informerName: e.target.value,
                      })
                    }
                    placeholder="e.g. Ajithkumar"
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                  />
                </div>
                <div>
                  <label className="block mb-1">Book / Serial No.</label>
                  <input
                    type="text"
                    value={editingProfile.bookNo || ""}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        bookNo: e.target.value,
                      })
                    }
                    placeholder="e.g. 21"
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block mb-1">Primary Phone</label>
                  <input
                    type="text"
                    value={editingProfile.phone || ""}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                  />
                </div>
                <div>
                  <label className="block mb-1">Secondary / WhatsApp Phone</label>
                  <input
                    type="text"
                    value={editingProfile.secondaryPhone || ""}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        secondaryPhone: e.target.value,
                      })
                    }
                    placeholder="e.g. 9446057238"
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block mb-1">Education</label>
                  <input
                    type="text"
                    value={editingProfile.education}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        education: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                  />
                </div>
                <div>
                  <label className="block mb-1">Profession</label>
                  <input
                    type="text"
                    value={editingProfile.profession}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        profession: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Location</label>
                <input
                  type="text"
                  value={editingProfile.location}
                  onChange={(e) =>
                    setEditingProfile({
                      ...editingProfile,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                />
              </div>

              <div>
                <label className="block mb-1">Photo URL</label>
                <input
                  type="url"
                  value={editingProfile.photo}
                  onChange={(e) =>
                    setEditingProfile({
                      ...editingProfile,
                      photo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded border border-[var(--admin-border)]"
                />
              </div>

              <div>
                <label className="block mb-1">Photo Privacy Level</label>
                <select
                  value={editingProfile.photoPrivacy || 'public'}
                  onChange={(e) =>
                    setEditingProfile({
                      ...editingProfile,
                      photoPrivacy: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded border border-[var(--admin-border)] bg-white text-xs sm:text-sm"
                >
                  <option value="public">Public (Visible with dynamic watermark)</option>
                  <option value="blurred_until_approved">Blurred Until Approved (Privacy Shield)</option>
                  <option value="private">Private (Request required)</option>
                </select>
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
                  className="rounded text-[var(--admin-gold-ink)]"
                />
                <label
                  htmlFor="editVerifiedCheck"
                  className="cursor-pointer"
                >
                  Verified Profile
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--admin-border)]">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="px-4 py-2 rounded border border-[var(--admin-border)] hover:bg-[var(--admin-surface)] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[var(--admin-gold-strong)] hover:bg-[var(--admin-gold-strong-hover)] text-white font-semibold transition cursor-pointer shadow"
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
        <div className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-[var(--admin-gold-strong)]/35 p-3 backdrop-blur-xs sm:p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white my-auto shrink-0 p-4 shadow-2xl border border-[var(--admin-border)] sm:p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--admin-surface)] text-[var(--admin-gold-text)] mb-4">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl text-center text-[var(--admin-gold-ink)]">
              {confirmModal.title}
            </h3>
            <p className="mt-2 text-xs text-center text-[var(--admin-gold-text)] leading-relaxed max-w-xs mx-auto">
              {confirmModal.message}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="w-1/2 px-4 py-2.5 rounded-xl border border-[var(--admin-border)] text-[var(--admin-gold-ink)] font-semibold text-xs hover:bg-[var(--admin-surface)] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="w-1/2 px-4 py-2.5 rounded-xl bg-[var(--admin-gold-strong)] hover:bg-[var(--admin-gold-strong-hover)] text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-[var(--admin-gold)]/20"
              >
                {confirmModal.confirmText || "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CREDENTIALS / APPROVAL SUCCESS MODAL */}
      {approvalModal && (
        <div className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-[var(--admin-gold-strong)]/35 p-3 backdrop-blur-xs sm:p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white my-auto shrink-0 p-4 sm:p-7 shadow-2xl border border-[var(--admin-border)] animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--admin-surface)] text-[var(--admin-gold-text)] mb-4">
              <Key size={26} />
            </div>
            <h3 className="text-xl sm:text-2xl text-center text-[var(--admin-gold-ink)]">
              {approvalModal.isResend
                ? "Credentials Reissued"
                : "Account Approved"}
            </h3>
            <p className="mt-1 text-xs text-center text-[var(--admin-gold-text)]">
              Member: <b className="text-[var(--admin-gold-ink)]">{approvalModal.name}</b>
              {approvalModal.email && <span> ({approvalModal.email})</span>}
            </p>

            <div className="mt-5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-[var(--admin-gold-text)] font-semibold mb-1">
                <span>Temporary Password</span>
                <span className="text-[12px] text-[var(--admin-gold-ink)] bg-[var(--admin-surface)] border border-[var(--admin-gold)] px-2 py-0.5 rounded-full font-bold">
                  ⏱️ Expires in 10 mins
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-2 bg-white px-3.5 py-2.5 rounded-lg border border-[var(--admin-border)]">
                <code className="min-w-0 wrap-anywhere font-bold text-base text-[var(--admin-gold-ink)] tracking-wider select-all">
                  {approvalModal.temporaryPassword}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      approvalModal.temporaryPassword,
                    );
                    setCopiedPassword(true);
                    setTimeout(() => setCopiedPassword(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--admin-gold-strong)] hover:bg-[var(--admin-gold-strong-hover)] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
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
              <p className="text-[12px] text-[var(--admin-gold-text)] mt-2">
                Combination of uppercase, lowercase, numbers &amp; special
                characters. Valid for 10 minutes.
              </p>
            </div>

            <div className="mt-4 p-3 bg-[var(--admin-surface)]/70 border border-[var(--admin-border)] rounded-xl text-xs text-[var(--admin-gold-ink)] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[var(--admin-gold-ink)]">
                <CheckCircle2 size={14} className="text-[var(--admin-gold-text)]" />
                <span>Nodemailer Dispatched</span>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--admin-gold-ink)]">
                Email has been sent to <b>{approvalModal.email}</b>. If not
                visible in the inbox, ask the member to check their <b>Spam</b>{" "}
                or <b>Promotions</b> folder.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setApprovalModal(null);
                setCopiedPassword(false);
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-[var(--admin-gold-strong)] hover:bg-[var(--admin-gold-strong-hover)] text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-[var(--admin-gold-ink)]/20"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
      {/* CREDENTIALS / APPROVAL SUCCESS MODAL */}
      {approvalModal && (
        <div className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-[var(--admin-gold-strong)]/35 p-3 backdrop-blur-xs sm:p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white my-auto shrink-0 p-4 sm:p-7 shadow-2xl border border-[var(--admin-border)] animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--admin-surface)] text-[var(--admin-gold-text)] mb-4">
              <Key size={26} />
            </div>
            <h3 className="text-xl sm:text-2xl text-center text-[var(--admin-gold-ink)]">
              {approvalModal.isResend
                ? "Credentials Reissued"
                : "Account Approved"}
            </h3>
            <p className="mt-1 text-xs text-center text-[var(--admin-gold-text)]">
              Member: <b className="text-[var(--admin-gold-ink)]">{approvalModal.name}</b>
              {approvalModal.email && <span> ({approvalModal.email})</span>}
            </p>

            <div className="mt-5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-[var(--admin-gold-text)] font-semibold mb-1">
                <span>Temporary Password</span>
                <span className="text-[12px] text-[var(--admin-gold-ink)] bg-[var(--admin-surface)] border border-[var(--admin-gold)] px-2 py-0.5 rounded-full font-bold">
                  ⏱️ Expires in 10 mins
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-2 bg-white px-3.5 py-2.5 rounded-lg border border-[var(--admin-border)]">
                <code className="min-w-0 wrap-anywhere font-bold text-base text-[var(--admin-gold-ink)] tracking-wider select-all">
                  {approvalModal.temporaryPassword}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      approvalModal.temporaryPassword,
                    );
                    setCopiedPassword(true);
                    setTimeout(() => setCopiedPassword(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--admin-gold-strong)] hover:bg-[var(--admin-gold-strong-hover)] text-white text-xs font-semibold transition cursor-pointer shadow-xs"
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
              <p className="text-[12px] text-[var(--admin-gold-text)] mt-2">
                Combination of uppercase, lowercase, numbers &amp; special
                characters. Valid for 10 minutes.
              </p>
            </div>

            <div className="mt-4 p-3 bg-[var(--admin-surface)]/70 border border-[var(--admin-border)] rounded-xl text-xs text-[var(--admin-gold-ink)] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[var(--admin-gold-ink)]">
                <CheckCircle2 size={14} className="text-[var(--admin-gold-text)]" />
                <span>Nodemailer Dispatched</span>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--admin-gold-ink)]">
                Email has been sent to <b>{approvalModal.email}</b>. If not
                visible in the inbox, ask the member to check their <b>Spam</b>{" "}
                or <b>Promotions</b> folder.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setApprovalModal(null);
                setCopiedPassword(false);
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-[var(--admin-gold-strong)] hover:bg-[var(--admin-gold-strong-hover)] text-white font-semibold text-xs transition cursor-pointer shadow-md shadow-[var(--admin-gold-ink)]/20"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
