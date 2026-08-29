import { useEffect, useState, useMemo, useCallback } from "react";
import {
  WalletCards,
  Send,
  ArrowDownToLine,
  ArrowLeftRight,
  Plus,
  RefreshCw,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DepositModal from "../../components/dashboard/DepositModal";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Deposit modal state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositTargetAccount, setDepositTargetAccount] = useState("");

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

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      // Fetch accounts and transactions in parallel
      const [accountsRes, txRes] = await Promise.allSettled([
        api.get("/accounts"),
        api.get("/transaction"),
      ]);

      let userAccounts = [];
      if (accountsRes.status === "fulfilled") {
        userAccounts = accountsRes.value.data?.accounts || [];
        setAccounts(userAccounts);
      }

      if (txRes.status === "fulfilled") {
        setTransactions(txRes.value.data?.transactions || []);
      }

      // Fetch balances for each account
      if (userAccounts.length > 0) {
        const balanceResults = await Promise.all(
          userAccounts.map(async (account) => {
            try {
              const balanceResponse = await api.get(
                `/accounts/balance/${account._id}`
              );
              return {
                accountId: account._id,
                balance: Number(balanceResponse.data?.balance) || 0,
              };
            } catch (error) {
              console.error(`Balance fetch failed for ${account._id}:`, error);
              return { accountId: account._id, balance: 0 };
            }
          })
        );

        const balanceMap = {};
        balanceResults.forEach((item) => {
          balanceMap[item.accountId] = item.balance;
        });
        setBalances(balanceMap);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      setError(
        error.response?.data?.message || "Unable to load dashboard data."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateAccount = async () => {
    try {
      setCreatingAccount(true);
      await api.post("/accounts");
      showToast("New bank account created successfully!");
      await fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create account.");
    } finally {
      setCreatingAccount(false);
    }
  };

  // Financial statistics calculations
  const totalBalance = useMemo(() => {
    return accounts.reduce((total, account) => {
      return total + (balances[account._id] || 0);
    }, 0);
  }, [accounts, balances]);

  const { totalReceived, totalSent } = useMemo(() => {
    let received = 0;
    let sent = 0;

    transactions.forEach((tx) => {
      if (tx.status === "COMPLETED") {
        const amount = Number(tx.amount) || 0;
        if (tx.direction === "RECEIVED") {
          received += amount;
        } else if (tx.direction === "SENT") {
          sent += amount;
        }
      }
    });

    return { totalReceived: received, totalSent: sent };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-800" />
          <div className="h-4 w-72 animate-pulse rounded bg-slate-800" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-3xl border border-white/10 bg-slate-900"
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-3xl border border-white/10 bg-slate-900 lg:col-span-2" />
          <div className="h-96 animate-pulse rounded-3xl border border-white/10 bg-slate-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-slate-900/95 px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-xl transition-all">
          <Sparkles size={16} className="text-blue-400" />
          {toastMessage}
        </div>
      )}

      {/* ================= HEADER ================= */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Personal Banking
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
              <ShieldCheck size={12} />
              Session Verified
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Welcome back, {user?.name || "User"}
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Real-time ledger overview and banking activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            onClick={() => {
              setDepositTargetAccount(accounts[0]?._id || "");
              setIsDepositOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500"
          >
            <ArrowDownToLine size={15} />
            Deposit Funds
          </button>

          <Link
            to="/send-money"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            <Send size={15} />
            Send Money
          </Link>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-400">Unable to load dashboard data</p>
              <p className="text-xs text-slate-400">{error}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ================= FINANCIAL METRICS OVERVIEW ================= */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Portfolio Balance */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Balance
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp size={19} />
            </div>
          </div>

          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            ₹
            {totalBalance.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <p className="mt-3 text-xs text-slate-400">
            Across {accounts.length} bank {accounts.length === 1 ? "account" : "accounts"}
          </p>
        </div>

        {/* Total Inflow (Received) */}
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Received
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowDownLeft size={19} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-400">
            +₹
            {totalReceived.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <p className="mt-3 text-xs text-slate-500">
            Lifetime incoming transfers
          </p>
        </div>

        {/* Total Outflow (Sent) */}
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Sent
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <ArrowUpRight size={19} />
            </div>
          </div>

          <p className="mt-3 text-2xl font-bold tracking-tight text-white">
            -₹
            {totalSent.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <p className="mt-3 text-xs text-slate-500">
            Lifetime outgoing transfers
          </p>
        </div>

        {/* Accounts Count */}
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Bank Accounts
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <WalletCards size={19} />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-bold tracking-tight text-white">
              {accounts.length}
            </p>
            <span className="text-xs font-medium text-emerald-400">
              All Active
            </span>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Verified ledger accounts
          </p>
        </div>
      </section>

      {/* ================= MAIN CONTENT: ACCOUNTS & QUICK ACTIONS ================= */}
      <section className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Bank Accounts */}
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Your Bank Accounts
              </h2>
              <p className="text-xs text-slate-400">
                Direct access to accounts and balance details
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateAccount}
                disabled={creatingAccount}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/20 disabled:opacity-50"
              >
                <Plus size={14} />
                {creatingAccount ? "Creating..." : "New Account"}
              </button>

              <Link
                to="/accounts"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300"
              >
                View all
              </Link>
            </div>
          </div>

          {accounts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/50 p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <CreditCard size={26} />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">No accounts yet</h3>
              <p className="mt-1 text-xs text-slate-400">
                Create your first digital banking account to send and receive funds.
              </p>
              <button
                onClick={handleCreateAccount}
                disabled={creatingAccount}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-blue-500"
              >
                <Plus size={16} />
                {creatingAccount ? "Opening..." : "Open Account Now"}
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {accounts.map((account) => {
                const balance = balances[account._id] || 0;
                const isCopied = copiedId === account._id;

                return (
                  <div
                    key={account._id}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-xl transition-all duration-300 hover:border-blue-500/30 hover:shadow-2xl"
                  >
                    {/* Card Top */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            Standard Account
                          </p>
                          <span className="text-[10px] text-slate-500">
                            Ledger Active
                          </span>
                        </div>
                      </div>

                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                        {account.status || "ACTIVE"}
                      </span>
                    </div>

                    {/* Balance */}
                    <div className="mt-6">
                      <p className="text-xs text-slate-400">Available Balance</p>
                      <p className="mt-1 text-2xl font-bold tracking-tight text-white">
                        ₹
                        {balance.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    {/* Account ID / Footer */}
                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="font-mono text-[11px]">
                          •••• {account._id.slice(-8)}
                        </span>
                        <button
                          onClick={() => handleCopy(account._id, account._id)}
                          className="rounded p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
                          title="Copy Full ID"
                        >
                          {isCopied ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => {
                            setDepositTargetAccount(account._id);
                            setIsDepositOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 transition hover:text-emerald-300"
                        >
                          <ArrowDownToLine size={13} />
                          Deposit
                        </button>

                        <Link
                          to="/send-money"
                          state={{ defaultFromAccount: account._id }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                        >
                          Send
                          <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions & Transfer Simulator Note */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Quick Actions</h2>
            <p className="text-xs text-slate-400">
              Essential banking operations
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setDepositTargetAccount(accounts[0]?._id || "");
                setIsDepositOpen(true);
              }}
              className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900 p-4 text-left transition-all hover:border-emerald-500/30 hover:bg-slate-800/80"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                  <ArrowDownToLine size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Deposit Funds
                  </p>
                  <p className="text-xs text-slate-400">
                    Instant self deposit / UPI
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </button>

            <Link
              to="/send-money"
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900 p-4 transition-all hover:border-blue-500/30 hover:bg-slate-800/80"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                  <Send size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Send Money
                  </p>
                  <p className="text-xs text-slate-400">
                    Instant zero-fee transfer
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </Link>

            <Link
              to="/accounts"
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900 p-4 transition-all hover:border-purple-500/30 hover:bg-slate-800/80"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 transition-colors group-hover:bg-purple-500 group-hover:text-white">
                  <WalletCards size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Manage Accounts
                  </p>
                  <p className="text-xs text-slate-400">
                    Create & view bank cards
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </Link>

            <Link
              to="/transactions"
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900 p-4 transition-all hover:border-blue-500/30 hover:bg-slate-800/80"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                  <ArrowLeftRight size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Statement & History
                  </p>
                  <p className="text-xs text-slate-400">
                    Export & search records
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </Link>
          </div>

          {/* Security & System Info Box */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-blue-950/20 p-5">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={18} className="text-blue-400" />
              <p className="text-xs font-semibold text-white">
                Double-Entry Security
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              All transactions enforce real-time MongoDB session locking, debit/credit ledger validation, and idempotency guarantees.
            </p>
          </div>
        </div>
      </section>

      {/* ================= RECENT ACTIVITY SECTION ================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Recent Transactions
            </h2>
            <p className="text-xs text-slate-400">
              Latest money transfers across all accounts
            </p>
          </div>

          <Link
            to="/transactions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            View all ({transactions.length})
            <ChevronRight size={14} />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
            <ArrowLeftRight size={24} className="mx-auto text-slate-600" />
            <p className="mt-3 text-sm font-semibold text-white">No transactions yet</p>
            <p className="mt-1 text-xs text-slate-500">
              When you transfer money, your activity will appear here in real-time.
            </p>
            <Link
              to="/send-money"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              <Send size={14} />
              Make First Transfer
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-xl">
            <div className="divide-y divide-white/5">
              {recentTransactions.map((tx) => {
                const isReceived = tx.direction === "RECEIVED";
                const isCompleted = tx.status === "COMPLETED";

                return (
                  <div
                    key={tx._id}
                    onClick={() => navigate(`/transactions/${tx._id}`)}
                    className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-white/[0.03] sm:px-6"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          isReceived
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {isReceived ? (
                          <ArrowDownLeft size={18} />
                        ) : (
                          <ArrowUpRight size={18} />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">
                            {isReceived ? "Money Received" : "Money Sent"}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              isCompleted
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-yellow-500/10 text-yellow-400"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                        <p className="mt-0.5 font-mono text-xs text-slate-500">
                          ID: {tx._id}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          isReceived ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {isReceived ? "+" : "-"}₹
                        {Number(tx.amount || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ================= DEPOSIT MODAL ================= */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
          showToast("Funds deposited successfully!");
        }}
        defaultAccountId={depositTargetAccount}
        accounts={accounts}
        balances={balances}
      />
    </div>
  );
};

export default Dashboard;