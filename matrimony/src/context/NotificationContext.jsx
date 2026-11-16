import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "../config/api";

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

export function NotificationProvider({ children }) {
  // Only maintain genuine registration notifications for real users
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("apremiya_notifications");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out dummy messages: deletions, inquiries, internal logs, anonymous / test entries
          return parsed.filter(
            (n) =>
              n.type === "registration" &&
              !n.title?.includes("Deleted") &&
              !n.title?.includes("Inquiry") &&
              !n.title?.includes("Platform Connected") &&
              !n.title?.includes("Status Updated") &&
              !n.title?.includes("Stats") &&
              !n.title?.includes("trt") &&
              !n.message?.includes("trt") &&
              !n.message?.includes("Anonymous")
          );
        }
      }
    } catch {}
    return [];
  });

  // Modal / Drawer toggle state (accessible from Admin portal)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Add a new registration notification record
  const addNotification = (title, message, type = "registration", action = null, targetId = null) => {
    // Only accept real registration notifications, ignore dummy internal logs
    if (type !== "registration" && !title.startsWith("New Registration")) {
      return;
    }

    const notifId = targetId ? `notif-profile-${targetId}` : `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    setNotifications((prev) => {
      const existingIdx = prev.findIndex(n => (targetId && n.targetId === targetId) || n.id === notifId);
      if (existingIdx !== -1) {
        return prev;
      }

      const newNotif = {
        id: notifId,
        targetId,
        title,
        message,
        type: "registration",
        timestamp: new Date().toISOString(),
        isRead: false,
        action,
      };

      const updated = [newNotif, ...prev.slice(0, 49)];
      try {
        localStorage.setItem("apremiya_notifications", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Sync real registered profiles from MongoDB Atlas into Admin Notifications
  useEffect(() => {
    let isMounted = true;

    const syncPendingData = async () => {
      try {
        const resProfiles = await fetch(`${API_BASE}/profiles`).catch(() => null);
        if (!isMounted || !resProfiles || !resProfiles.ok) return;

        const profiles = await resProfiles.json();
        const activeProfileIds = new Set(profiles.map((p) => p.id));

        setNotifications((prev) => {
          // 1. Purge all dummy messages and notifications for profiles deleted from MongoDB
          let updated = prev.filter(
            (n) =>
              n.type === "registration" &&
              !n.title?.includes("Deleted") &&
              !n.title?.includes("Inquiry") &&
              (!n.targetId || activeProfileIds.has(n.targetId)) &&
              profiles.some(p => n.targetId === p.id || n.title?.toLowerCase().includes(p.name.toLowerCase()))
          );

          let changed = updated.length !== prev.length;

          // 2. Add real pending registrations from MongoDB
          profiles.forEach((p) => {
            const isPending = !p.verified && !p.isApproved && p.status !== "rejected";
            const existing = updated.find(
              (n) => n.targetId === p.id || n.id === `notif-profile-${p.id}`
            );

            if (isPending && !existing) {
              updated.unshift({
                id: `notif-profile-${p.id}`,
                targetId: p.id,
                title: `New Registration: ${p.name}`,
                message: `${p.name} (${p.gender}, ${p.age} yrs) from ${p.location || "India"} has registered. Status: Under Review. Please review and approve.`,
                type: "registration",
                timestamp: p.createdAt || new Date().toISOString(),
                isRead: false,
                action: { tab: "profiles", search: p.name },
              });
              changed = true;
            } else if (!isPending && existing && !existing.isRead) {
              existing.isRead = true;
              changed = true;
            }
          });

          if (changed) {
            try {
              localStorage.setItem("apremiya_notifications", JSON.stringify(updated.slice(0, 50)));
            } catch {}
            return updated.slice(0, 50);
          }
          return prev;
        });
      } catch {}
    };

    syncPendingData();
    const interval = setInterval(syncPendingData, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const markNotificationAsRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id || n.targetId === id ? { ...n, isRead: true } : n,
      );
      try {
        localStorage.setItem("apremiya_notifications", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      try {
        localStorage.setItem("apremiya_notifications", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    try {
      localStorage.removeItem("apremiya_notifications");
    } catch {}
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id && n.targetId !== id);
      try {
        localStorage.setItem("apremiya_notifications", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isNotificationOpen,
        setIsNotificationOpen,
        openNotifications: () => setIsNotificationOpen(true),
        closeNotifications: () => setIsNotificationOpen(false),
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
