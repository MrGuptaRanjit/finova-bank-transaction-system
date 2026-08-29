import { useEffect, useState, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  ArrowDownToLine,
  WalletCards,
  CheckCircle2,
  Loader2,
  CreditCard,
  Building2,
  Smartphone,
  Sparkles,
  ReceiptText,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Plus,
} from "lucide-react";

import api from "../../services/api";

const PRESET_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];

const PAYMENT_METHODS = [
  {
    id: "UPI",
    name: "Instant UPI Transfer",
    description: "Google Pay, PhonePe, Paytm, BHIM UPI ID",
    icon: Smartphone,
    badge: "Most Popular",
  },
  {
    id: "CARD",
    name: "Debit / Credit Card",
    description: "Visa, Mastercard, RuPay Cards",
    icon: CreditCard,
    badge: "Instant 0% Fee",
  },
  {
    id: "NETBANKING",
    name: "Internet Banking / IMPS",
    description: "All Major Scheduled Indian Commercial Banks",
    icon: Building2,
    badge: "Direct IMPS",
  },
  {
    id: "DIRECT_TREASURY",
    name: "Finova Treasury Direct Top-up",
    description: "Instant sandbox treasury reserve credit",
    icon: Sparkles,
    badge: "Real-Time Ledger",
  },
];

const Deposit = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [selectedAccount, setSelectedAccount] = useState(
    location.state?.defaultAccountId || ""
  );
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoadingAccounts(true);
      setError("");

      const response = await api.get("/accounts");
      const fetchedAccounts = response.data?.accounts || [];
      setAccounts(fetchedAccounts);

      if (fetchedAccounts.length > 0) {
        const balanceResults = await Promise.all(
          fetchedAccounts.map(async (acc) => {
            try {
              const res = await api.get(`/accounts/balance/${acc._id}`);
              return {
                id: acc._id,
                balance: Number(res.data?.balance) || 0,
              };
            } catch (err) {
              console.error(`Balance fetch error for ${acc._id}:`, err);
              return { id: acc._id, balance: 0 };
            }
          })
        );

        const balanceMap = {};
        balanceResults.forEach((item) => {
          balanceMap[item.id] = item.balance;
        });
        setBalances(balanceMap);

        if (!selectedAccount) {
          const active = fetchedAccounts.find((a) => a.status === "ACTIVE");
          if (active) setSelectedAccount(active._id);
        }
      }
    } catch (err) {
      console.error("Failed to load accounts for deposit:", err);
      setError(
        err.response?.data?.message || "Unable to load your bank accounts."
      );
    } finally {
      setLoadingAccounts(false);
    }
  }, [selectedAccount]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const currentBalance = balances[selectedAccount] || 0;
  const depositAmount = Number(amount) || 0;

  const handleDeposit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedAccount) {
      setError("Please select the target account to fund.");
      return;
    }

    if (!depositAmount || depositAmount <= 0) {
      setError("Please enter a valid deposit amount greater than ₹0.");
      return;
    }

    if (depositAmount > 1000000) {
      setError("Maximum deposit amount per transaction is ₹10,00,000.");
      return;
    }

    try {
      setLoading(true);
      const idempotencyKey = `dep-${Date.now()}-${crypto.randomUUID()}`;

      const response = await api.post("/transaction/deposit", {
        toAccount: selectedAccount,
        amount: depositAmount,
        paymentMethod,
        idempotencyKey,
      });

      setSuccessData({
        transaction: response.data.transaction,
        newBalance: response.data.newBalance,
        amount: depositAmount,
        account: selectedAccount,
      });
    } catch (err) {
      console.error("Deposit failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to process deposit. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleReset = () => {
    setSuccessData(null);
    setAmount("");
    setError("");
    fetchAccounts();
  };

  if (loadingAccounts) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-800" />
        <div className="h-96 animate-pulse rounded-3xl border border-white/10 bg-slate-900" />
      </div>
    );
  }

  // ================= SUCCESS SCREEN =================
  if (successData) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 text-center shadow-2xl sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
            <CheckCircle2 size={36} />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-white">
            Deposit Completed!
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            ₹{successData.amount.toLocaleString("en-IN")} has been credited directly to your bank account.
          </p>

          {/* Breakdown Box */}
          <div className="my-6 rounded-2xl border border-white/5 bg-slate-950/80 p-5 text-left text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-slate-400">Amount Credited</span>
              <span className="text-xl font-bold text-emerald-400">
                +₹{successData.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <span className="text-slate-500">Credited To Account</span>
              <span className="font-mono text-slate-200">
                ••••{successData.account.slice(-8)}
              </span>
            </div>

            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Transaction ID</span>
              <div className="flex items-center gap-1.5 font-mono text-slate-200">
                <span className="max-w-[200px] truncate">
                  {successData.transaction?._id}
                </span>
                <button
                  onClick={() => handleCopyId(successData.transaction?._id)}
                  className="p-0.5 text-slate-400 hover:text-white"
                  title="Copy ID"
                >
                  {copiedId ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Deposit Channel</span>
              <span className="font-semibold text-white">{paymentMethod}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Deposit Fee</span>
              <span className="font-semibold text-emerald-400">₹0.00 (Free)</span>
            </div>

            <div className="flex justify-between border-t border-white/5 pt-3">
              <span className="text-slate-400 font-medium">Updated Account Balance</span>
              <span className="font-bold text-white text-sm">
                ₹{Number(successData.newBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleReset}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-500"
            >
              <Plus size={16} />
              Make Another Deposit
            </button>

            <Link
              to={`/transactions/${successData.transaction?._id}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              <ReceiptText size={16} />
              View Full Receipt
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN DEPOSIT FORM =================
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Deposit Funds
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Add money directly into your personal bank accounts with zero processing fees.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleDeposit}
        className="space-y-6 rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl sm:p-8"
      >
        {/* Target Account Selector */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Destination Account
            </label>
            <span className="text-xs text-slate-400">
              Current Balance:{" "}
              <strong className="text-emerald-400">
                ₹{currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>

          <div className="relative">
            <WalletCards
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-950 py-3.5 pl-11 pr-10 text-sm font-medium text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {accounts.length === 0 && (
                <option value="">No active accounts available</option>
              )}
              {accounts.map((acc, index) => (
                <option key={acc._id} value={acc._id} className="bg-slate-900">
                  Account #{index + 1} (•••• {acc._id.slice(-6)}) — Available: ₹
                  {(balances[acc._id] || 0).toLocaleString("en-IN")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Deposit Amount Input & Preset Chips */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Deposit Amount
            </label>
            {depositAmount > 0 && (
              <span className="text-xs text-slate-400">
                Balance after deposit:{" "}
                <strong className="text-white">
                  ₹{(currentBalance + depositAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </strong>
              </span>
            )}
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-500">
              ₹
            </span>
            <input
              type="number"
              min="1"
              max="1000000"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 py-3.5 pl-10 pr-4 text-xl font-bold text-white placeholder:text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt.toString())}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-white"
              >
                +₹{amt.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Payment & Funding Channel
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/5"
                      : "border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/5 text-slate-400"
                      }`}
                    >
                      <Icon size={17} />
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/5 text-slate-500"
                      }`}
                    >
                      {method.badge}
                    </span>
                  </div>

                  <p className="mt-2.5 text-sm font-bold text-white">
                    {method.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {method.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security Box */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950 p-4 text-xs text-slate-400">
          <ShieldCheck size={18} className="shrink-0 text-blue-400" />
          <span>
            Instant sandbox ledger settlement. Deposits credit your balance immediately with full double-entry accounting records.
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || accounts.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-600/25 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Authorizing & Crediting Funds...
            </>
          ) : (
            <>
              <ArrowDownToLine size={18} />
              Deposit ₹{depositAmount > 0 ? depositAmount.toLocaleString("en-IN") : "0"} Instantly
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Deposit;
