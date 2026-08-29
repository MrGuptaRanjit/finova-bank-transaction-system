import { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      const saved = localStorage.getItem("read_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchNotificationData = async () => {
      try {
        const response = await api.get("/transaction");
        const txs = response.data?.transactions || [];

        // Build notifications from real transactions
        const items = txs.slice(0, 6).map((tx) => {
          const isReceived = tx.direction === "RECEIVED";
          const amountFormatted = Number(tx.amount || 0).toLocaleString("en-IN");
          const date = new Date(tx.createdAt);

          return {
            id: tx._id,
            type: isReceived ? "credit" : "debit",
            title: isReceived ? "Money Received" : "Money Transferred",
            message: isReceived
              ? `₹${amountFormatted} credited from ••••${tx.fromAccount?.slice(-4)}`
              : `₹${amountFormatted} sent to ••••${tx.toAccount?.slice(-4)}`,
            time: date.toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            read: readIds.includes(tx._id),
            txId: tx._id,
          };
        });

        // Add security welcome notification if empty or at bottom
        items.push({
          id: "sec-welcome",
          type: "security",
          title: "Session Verified",
          message: "Double-entry cryptographic ledger security is active.",
          time: "Today",
          read: readIds.includes("sec-welcome"),
        });

        setNotifications(items);
      } catch (err) {
        console.error("Failed to load live notifications:", err);
        // Fallback static notifications
        setNotifications([
          {
            id: "sec-init",
            type: "security",
            title: "Security Verified",
            message: "Your banking account is secured with JWT authentication.",
            time: "Just now",
            read: false,
          },
        ]);
      }
    };

    fetchNotificationData();
  }, [readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    const updated = [...readIds, id];
    setReadIds(updated);
    localStorage.setItem("read_notifications", JSON.stringify(updated));
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    localStorage.setItem("read_notifications", JSON.stringify(allIds));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClickNotification = (n) => {
    markAsRead(n.id);
    setIsOpen(false);
    if (n.txId) {
      navigate(`/transactions/${n.txId}`);
    } else {
      navigate("/transactions");
    }
  };

  const getNotificationIcon = (type) => {
    if (type === "credit") {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
          <ArrowDownLeft size={17} />
        </div>
      );
    }
    if (type === "debit") {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          <ArrowUpRight size={17} />
        </div>
      );
    }
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
        <ShieldCheck size={17} />
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Notification Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-300 transition hover:bg-white/5 hover:text-white"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />

          <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h3 className="text-sm font-bold text-white">Notifications</h3>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {unreadCount > 0
                    ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`
                    : "All updates caught up"}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/10"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[360px] divide-y divide-white/5 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleClickNotification(item)}
                    className={`flex cursor-pointer gap-3.5 p-4 transition hover:bg-white/[0.04] ${
                      !item.read ? "bg-blue-600/[0.06]" : ""
                    }`}
                  >
                    {getNotificationIcon(item.type)}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-white">{item.title}</p>
                        {!item.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        )}
                      </div>

                      <p className="mt-0.5 text-xs text-slate-300">{item.message}</p>

                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{item.time}</span>
                        {item.txId && (
                          <span className="inline-flex items-center gap-0.5 text-blue-400">
                            Receipt <ExternalLink size={10} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 bg-slate-950/50 px-4 py-3 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/transactions");
                }}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                View all transactions & statement
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;