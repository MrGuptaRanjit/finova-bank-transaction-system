import { useState, useEffect } from "react";
import {
  Mail,
  User,
  ShieldCheck,
  LogOut,
  Copy,
  Check,
  Lock,
  Wallet,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  AlertCircle,
  Send,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [accountsCount, setAccountsCount] = useState(0);
  const [txCount, setTxCount] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [copiedId, setCopiedId] = useState(false);

  // Delete profile state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [accRes, txRes] = await Promise.allSettled([
          api.get("/accounts"),
          api.get("/transaction"),
        ]);

        let accounts = [];
        if (accRes.status === "fulfilled") {
          accounts = accRes.value.data?.accounts || [];
          setAccountsCount(accounts.length);
        }

        if (txRes.status === "fulfilled") {
          const txs = txRes.value.data?.transactions || [];
          setTxCount(txs.length);
        }

        if (accounts.length > 0) {
          const balanceResults = await Promise.all(
            accounts.map(async (acc) => {
              try {
                const res = await api.get(`/accounts/balance/${acc._id}`);
                return Number(res.data?.balance) || 0;
              } catch (err) {
                console.error(`Balance fetch error for ${acc._id}:`, err);
                return 0;
              }
            })
          );
          const total = balanceResults.reduce((a, b) => a + b, 0);
          setTotalBalance(total);
        }
      } catch (err) {
        console.error("Failed to load profile stats:", err);
      }
    };

    fetchStats();
  }, []);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => {
      setCopiedId(false);
    }, 2000);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout API failed:", e);
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const handleDeleteProfile = async () => {
    if (totalBalance > 0) return;
    if (
      confirmText.trim().toLowerCase() !== "delete" &&
      confirmText.trim() !== user?.email
    ) {
      setDeleteError("Please type DELETE or your account email to confirm.");
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      await api.delete("/auth/profile");
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Profile deletion failed:", err);
      setDeleteError(
        err.response?.data?.message ||
          "Failed to delete profile. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Account Profile & Security
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your personal information, banking status, and security settings.
        </p>
      </div>

      {/* Main Profile Header Card */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
        <div className="border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-blue-600/20 text-3xl font-bold text-blue-400 ring-2 ring-blue-500/30">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* Information */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  {user?.name || "Verified User"}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                  <ShieldCheck size={14} />
                  KYC Verified
                </span>
              </div>

              <p className="mt-1 font-mono text-xs text-slate-400">
                {user?.email || "No email available"}
              </p>

              {user?.id && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <span>User ID:</span>
                  <span className="font-mono text-slate-300">{user.id}</span>
                  <button
                    onClick={() => handleCopy(user.id)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Copy User ID"
                  >
                    {copiedId ? (
                      <Check size={13} className="text-emerald-400" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 sm:self-center"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid divide-y divide-white/5 border-b border-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-6 text-center">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Assets
            </span>
            <p className="mt-1 text-xl font-bold text-white">
              ₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-6 text-center">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Open Accounts
            </span>
            <p className="mt-1 text-xl font-bold text-emerald-400">
              {accountsCount} Active
            </p>
          </div>

          <div className="p-6 text-center">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Lifetime Transfers
            </span>
            <p className="mt-1 text-xl font-bold text-blue-400">
              {txCount} Total
            </p>
          </div>
        </div>

        {/* Detailed User Information */}
        <div className="p-6 sm:p-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Account Specifications
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-slate-950 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <User size={15} className="text-blue-400" />
                <span>Legal Full Name</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-white">
                {user?.name || "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-950 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Mail size={15} className="text-blue-400" />
                <span>Primary Email</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-white">
                {user?.email || "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-950 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Wallet size={15} className="text-blue-400" />
                <span>Base Currency</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-white">
                INR (₹) — Indian Rupee
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-950 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <ShieldCheck size={15} className="text-blue-400" />
                <span>Session Status</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-emerald-400">
                Active & Authenticated (JWT 3-Day)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security & System Info */}
      <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Lock size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Bank-Grade Security Architecture
            </h3>
            <p className="mt-1 text-xs leading-6 text-slate-400">
              Your banking transactions are powered by atomic ACID double-entry ledger verification. Every transfer creates immutable paired DEBIT and CREDIT ledger entries within isolated MongoDB sessions, preventing balance inconsistencies or double-spending.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/20 via-slate-900 to-slate-900 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Danger Zone</h3>
                <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400 ring-1 ring-red-500/20">
                  Irreversible
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-400 max-w-xl">
                Permanently close your user profile, deactivate all connected bank accounts, and revoke all active login sessions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setDeleteError("");
              setConfirmText("");
              setShowDeleteModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 shrink-0 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-xs font-bold text-red-400 transition hover:bg-red-600 hover:text-white"
          >
            <Trash2 size={15} />
            Delete Profile
          </button>
        </div>
      </div>

      {/* ================= DELETE PROFILE MODAL ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="text-base font-bold text-white">
                  Delete User Profile
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !deleting && setShowDeleteModal(false)}
                disabled={deleting}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {deleteError && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {totalBalance > 0 ? (
              <div className="my-5 space-y-4">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-300 space-y-2">
                  <p className="font-bold">⚠️ Active Funds Detected</p>
                  <p className="leading-5 text-amber-200/90">
                    You currently have an active balance of{" "}
                    <strong>
                      ₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </strong>{" "}
                    across your bank accounts. Under banking guidelines, you must transfer or withdraw all funds before your profile can be closed.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-slate-800 py-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <Link
                    to="/send-money"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white transition hover:bg-blue-500"
                  >
                    <Send size={13} />
                    Transfer All Funds
                  </Link>
                </div>
              </div>
            ) : (
              <div className="my-5 space-y-4">
                <p className="text-xs text-slate-400 leading-5">
                  This action is <strong>permanent</strong> and cannot be undone. All your bank accounts will be deactivated, active tokens revoked, and profile data wiped.
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Type <span className="font-mono text-red-400">DELETE</span> or your email (<span className="font-mono text-slate-300">{user?.email}</span>) to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs font-medium text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-slate-800 py-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={
                      deleting ||
                      (confirmText.trim().toLowerCase() !== "delete" &&
                        confirmText.trim() !== user?.email)
                    }
                    onClick={handleDeleteProfile}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {deleting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        Delete Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;