import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellRing,
  X,
  Check,
  Trash2,
  UserPlus,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useNotification } from "../context/NotificationContext";

export default function NotificationCenterModal({ onNavigateAdmin }) {
  const {
    notifications,
    unreadCount,
    isNotificationOpen,
    closeNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    deleteNotification,
  } = useNotification();

  const [filter, setFilter] = useState("all"); // 'all' | 'unread' | 'read'

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  return (
    <>
      {/* SLIDE-OVER NOTIFICATION DRAWER (ACCESSIBLE FROM ADMIN PORTAL) */}
      <AnimatePresence>
        {isNotificationOpen && (
          <div className="fixed inset-0 z-50 flex justify-end font-montserrat">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeNotifications}
              className="fixed inset-0 bg-black/55 backdrop-blur-xs cursor-pointer"
            />

            {/* Slide-over Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#FAF7F1] shadow-2xl border-l border-[#eadfce]"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#eadfce] bg-white px-3.5 sm:px-5 py-3 sm:py-4">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#701C35] text-white flex-shrink-0">
                    <BellRing size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="serif text-base sm:text-lg font-bold text-[#701C35] leading-tight truncate">
                      Notification Center
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 font-semibold tracking-wide truncate">
                      {unreadCount} UNREAD NOTIFICATIONS
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeNotifications}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer flex-shrink-0"
                  aria-label="Close notifications"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Action Bar & Quick Filter */}
              <div className="border-b border-[#eadfce] bg-white px-3.5 sm:px-5 py-2.5 sm:py-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium text-[10px] sm:text-[11px]">
                    Total: {notifications.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={markAllNotificationsAsRead}
                      disabled={unreadCount === 0}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-40 cursor-pointer"
                    >
                      <Check size={13} />
                      <span>Mark all read</span>
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={clearAllNotifications}
                      disabled={notifications.length === 0}
                      className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 disabled:opacity-40 cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Clear all</span>
                    </button>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {[
                    { id: "all", label: `All (${notifications.length})` },
                    { id: "unread", label: `Unread (${unreadCount})` },
                    {
                      id: "read",
                      label: `Read (${notifications.filter((n) => n.isRead).length})`,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilter(tab.id)}
                      className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                        filter === tab.id
                          ? "bg-[#701C35] text-white"
                          : "bg-[#FAF7F1] text-gray-600 hover:bg-gray-100 border border-[#eadfce]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {filteredNotifications.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-center text-gray-400">
                    <Bell size={32} className="mb-2 text-gray-300" />
                    <p className="text-xs font-semibold text-gray-600">
                      No notifications found
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 max-w-xs">
                      All new member registrations, inquiry submissions, and
                      status updates will appear here automatically.
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`group relative flex items-start gap-3 rounded-xl p-3.5 transition cursor-pointer border ${
                        !notif.isRead
                          ? "bg-white border-[#C8A96B] shadow-sm"
                          : "bg-white/70 border-[#eadfce] hover:bg-white"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 text-white ${
                          notif.type === "registration"
                            ? "bg-[#701C35]"
                            : notif.type === "inquiry"
                              ? "bg-blue-600"
                              : notif.type === "verified"
                                ? "bg-emerald-600"
                                : notif.type === "delete"
                                  ? "bg-red-500"
                                  : "bg-[#B28D53]"
                        }`}
                      >
                        {notif.type === "registration" ? (
                          <UserPlus size={15} />
                        ) : notif.type === "inquiry" ? (
                          <MessageSquare size={15} />
                        ) : notif.type === "verified" ? (
                          <ShieldCheck size={15} />
                        ) : notif.type === "delete" ? (
                          <Trash2 size={15} />
                        ) : (
                          <Bell size={15} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-gray-900 truncate">
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <span
                              className="h-1.5 w-1.5 rounded-full bg-[#701C35]"
                              title="Unread"
                            />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400">
                          <span>
                            {new Date(notif.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {notif.action && onNavigateAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                closeNotifications();
                                onNavigateAdmin(notif.action);
                              }}
                              className="font-semibold text-[#701C35] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>View details</span>
                              <ExternalLink size={10} />
                            </button>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1 transition cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              <div className="border-t border-[#eadfce] bg-white p-3.5 text-center text-[10px] text-gray-400">
                Kerala Kalyans Live Notification Engine · Synchronized with MongoDB
                Atlas
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
