import { useEffect, useState, useCallback } from "react";
import {
  WalletCards,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Sparkles,
  ShieldCheck,
  ArrowDownToLine,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import DepositModal from "../../components/dashboard/DepositModal";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Deposit modal state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositTargetAccount, setDepositTargetAccount] = useState("");

  // Close account modal state
  const [accountToClose, setAccountToClose] = useState(null);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Account ID copied to clipboard!");
    setTimeout(() => {
      setCopiedId("");
    }, 2000);
  };

  const handleCloseAccount = async () => {
    if (!accountToClose) return;
    try {
      setClosing(true);
      setCloseError("");

      const res = await api.delete(`/accounts/${accountToClose._id}`);
      showToast(res.data?.message || "Account closed successfully.");
      setAccountToClose(null);
      await fetchAccounts();
    } catch (err) {
      console.error("Account closure error:", err);
      setCloseError(
        err.response?.data?.message ||
          "Failed to close account. Please ensure balance is ₹0."
      );
    } finally {
      setClosing(false);
    }
  };

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/accounts");
      const fetchedAccounts = response.data.accounts || [];
      setAccounts(fetchedAccounts);

      // Fetch balance for each account
      if (fetchedAccounts.length > 0) {
        const balanceResults = await Promise.all(
          fetchedAccounts.map(async (account) => {
            try {
              const balanceResponse = await api.get(
                `/accounts/balance/${account._id}`
              );
              return {
                id: account._id,
                balance: Number(balanceResponse.data?.balance) || 0,
              };
            } catch (err) {
              console.error(`Failed to fetch balance for ${account._id}:`, err);
              return { id: account._id, balance: 0 };
            }
          })
        );

        const balanceMap = {};
        balanceResults.forEach((item) => {
          balanceMap[item.id] = item.balance;
        });
        setBalances(balanceMap);
      }
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      setError(
        err.response?.data?.message || "Unable to load your bank accounts."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateAccount = async () => {
    try {
      setCreating(true);
      setError("");

      await api.post("/accounts");
      showToast("New bank account opened successfully!");
      await fetchAccounts();
    } catch (err) {
      console.error("Failed to create account:", err);
      setError(
        err.response?.data?.message || "Unable to open a new account."
      );
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const totalBalance = accounts.reduce((acc, account) => {
    return acc + (balances[account._id] || 0);
  }, 0);

  const averageBalance =
    accounts.length > 0 ? totalBalance / accounts.length : 0;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-800" />
          <div className="h-4 w-72 animate-pulse rounded bg-slate-800" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-3xl border border-white/10 bg-slate-900"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-slate-900/95 px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-xl transition-all">
          <Sparkles size={16} className="text-blue-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Bank Accounts
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your digital bank accounts, balances, and cards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchAccounts}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            onClick={() => {
              setDepositTargetAccount(accounts[0]?._id || "");
              setIsDepositOpen(true);
            }}
            disabled={accounts.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:opacity-50"
          >
            <ArrowDownToLine size={15} />
            Deposit Funds
          </button>

          <button
            onClick={handleCreateAccount}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-60"
          >
            {creating ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Opening Account...
              </>
            ) : (
              <>
                <Plus size={16} />
                Open New Account
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Combined Balance
          </p>
          <p className="mt-2 text-2xl font-bold text-white">
            ₹
            {totalBalance.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Active Accounts
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {accounts.length}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Average Balance / Account
          </p>
          <p className="mt-2 text-2xl font-bold text-blue-400">
            ₹
            {averageBalance.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {accounts.length === 0 ? (
        <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-900/60 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <WalletCards size={32} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-white">No bank accounts yet</h2>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            Open your first verified digital bank account to store funds, receive deposits, and make transfers.
          </p>

          <button
            onClick={handleCreateAccount}
            disabled={creating}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500"
          >
            <Plus size={18} />
            Open First Account
          </button>
        </div>
      ) : (
        /* Accounts Grid with Virtual Card Styling */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {accounts.map((account, index) => {
            const balance = balances[account._id] || 0;
            const isCopied = copiedId === account._id;

            return (
              <div
                key={account._id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl transition-all duration-300 hover:border-blue-500/30 hover:shadow-blue-500/5"
              >
                {/* Visual Ambient Glow */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-blue-500/5 blur-3xl transition group-hover:bg-blue-500/10" />

                {/* Card Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Metallic EMV Chip */}
                    <div className="h-8 w-11 rounded-md border border-amber-400/30 bg-gradient-to-br from-amber-300/20 via-amber-400/10 to-amber-500/20 shadow-inner" />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Finova Debit
                      </span>
                      <p className="text-[10px] text-slate-500">Account #{index + 1}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      account.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-700/50 text-slate-400"
                    }`}>
                      <CheckCircle2 size={13} />
                      {account.status || "ACTIVE"}
                    </div>

                    {account.status === "ACTIVE" && (
                      <button
                        onClick={() => {
                          setCloseError("");
                          setAccountToClose(account);
                        }}
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                        title="Close / Delete Bank Account"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Available Balance */}
                <div className="mt-8">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Available Balance
                  </span>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-white">
                    ₹
                    {balance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                {/* Account Number & Copy */}
                <div className="mt-6 rounded-2xl border border-white/5 bg-slate-950/60 p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">
                        Full Account ID
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-slate-200">
                        {account._id}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopy(account._id, account._id)}
                      className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                      title="Copy Account ID"
                    >
                      {isCopied ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <ShieldCheck size={14} className="text-blue-400" />
                    <span>Protected Ledger</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDepositTargetAccount(account._id);
                        setIsDepositOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/10 px-3 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-600 hover:text-white"
                    >
                      <ArrowDownToLine size={13} />
                      Deposit
                    </button>

                    <Link
                      to="/send-money"
                      state={{ defaultFromAccount: account._id }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600/10 px-3 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-600 hover:text-white"
                    >
                      <Send size={13} />
                      Send
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= DEPOSIT MODAL ================= */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={() => {
          fetchAccounts();
          showToast("Funds deposited successfully!");
        }}
        defaultAccountId={depositTargetAccount}
        accounts={accounts}
        balances={balances}
      />

      {/* ================= CLOSE / DELETE ACCOUNT MODAL ================= */}
      {accountToClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <AlertTriangle size={18} />
                </div>
                <h3 className="text-base font-bold text-white">
                  Close Bank Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !closing && setAccountToClose(null)}
                disabled={closing}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {closeError && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <span>{closeError}</span>
              </div>
            )}

            <div className="my-5 rounded-2xl border border-white/5 bg-slate-950 p-4 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Account ID</span>
                <span className="font-mono text-slate-200">{accountToClose._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Balance</span>
                <span
                  className={`font-bold ${
                    (balances[accountToClose._id] || 0) > 0
                      ? "text-amber-400"
                      : "text-slate-300"
                  }`}
                >
                  ₹{(balances[accountToClose._id] || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {(balances[accountToClose._id] || 0) > 0 ? (
              <div className="space-y-4">
                <p className="text-xs text-amber-400 leading-5">
                  ⚠️ This account currently has an active balance of{" "}
                  <strong>
                    ₹{(balances[accountToClose._id] || 0).toLocaleString("en-IN")}
                  </strong>
                  . Double-entry banking rules require you to transfer or withdraw all funds before closing.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountToClose(null)}
                    className="flex-1 rounded-xl border border-white/10 bg-slate-800 py-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <Link
                    to="/send-money"
                    state={{ defaultFromAccount: accountToClose._id }}
                    onClick={() => setAccountToClose(null)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white transition hover:bg-blue-500"
                  >
                    <Send size={13} />
                    Transfer Balance
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-5">
                  Are you sure you want to close this bank account? If this account has past transaction records, its ledger audit trail will be safely archived with status <strong>CLOSED</strong>.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={closing}
                    onClick={() => setAccountToClose(null)}
                    className="flex-1 rounded-xl border border-white/10 bg-slate-800 py-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={closing}
                    onClick={handleCloseAccount}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-500 disabled:opacity-60"
                  >
                    {closing ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Closing Account...
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        Confirm & Close
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

export default Accounts;