import { useState, useEffect } from "react";
import {
  X,
  ArrowDownToLine,
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
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const PRESET_AMOUNTS = [1000, 5000, 10000, 25000, 50000];

const PAYMENT_METHODS = [
  {
    id: "UPI",
    name: "Instant UPI",
    description: "Google Pay, PhonePe, Paytm, BHIM",
    icon: Smartphone,
    badge: "Fastest",
  },
  {
    id: "CARD",
    name: "Debit / Credit Card",
    description: "Visa, Mastercard, RuPay",
    icon: CreditCard,
    badge: "Instant",
  },
  {
    id: "NETBANKING",
    name: "NetBanking / IMPS",
    description: "All Major Indian Banks",
    icon: Building2,
    badge: "0% Fee",
  },
  {
    id: "DIRECT_TREASURY",
    name: "Treasury Direct Top-up",
    description: "Instant sandbox treasury credit",
    icon: Sparkles,
    badge: "Instant",
  },
];

const DepositModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultAccountId = "",
  accounts = [],
  balances = {},
}) => {
  const [selectedAccount, setSelectedAccount] = useState(defaultAccountId);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (defaultAccountId) {
      setSelectedAccount(defaultAccountId);
    } else if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0]._id);
    }
  }, [defaultAccountId, accounts, selectedAccount]);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccessData(null);
      setCopiedId(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentBalance = balances[selectedAccount] || 0;
  const depositAmount = Number(amount) || 0;

  const handleDeposit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedAccount) {
      setError("Please select the target account to deposit into.");
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

      if (onSuccess) {
        onSuccess(response.data);
      }
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowDownToLine size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Deposit Money</h2>
              <p className="text-xs text-slate-400">
                Add funds directly into your account
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        {successData ? (
          /* ================= SUCCESS STATE ================= */
          <div className="p-6 sm:p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="mt-4 text-2xl font-bold text-white">
              Funds Added Successfully!
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              ₹{successData.amount.toLocaleString("en-IN")} has been credited to
              your account.
            </p>

            <div className="my-6 rounded-2xl border border-white/5 bg-slate-950 p-5 text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-slate-400">Amount Deposited</span>
                <span className="text-base font-bold text-emerald-400">
                  +₹{successData.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Credited To</span>
                <span className="font-mono text-slate-200">
                  ••••{successData.account.slice(-8)}
                </span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Transaction ID</span>
                <div className="flex items-center gap-1.5 font-mono text-slate-300">
                  <span className="max-w-[170px] truncate">
                    {successData.transaction?._id}
                  </span>
                  <button
                    onClick={() => handleCopyId(successData.transaction?._id)}
                    className="p-0.5 text-slate-400 hover:text-white"
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
                <span className="text-slate-500">Payment Channel</span>
                <span className="font-semibold text-white">{paymentMethod}</span>
              </div>

              <div className="flex justify-between border-t border-white/5 pt-2">
                <span className="text-slate-500">New Account Balance</span>
                <span className="font-bold text-white">
                  ₹{Number(successData.newBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-blue-500"
              >
                Add More Funds
              </button>

              <Link
                to={`/transactions/${successData.transaction?._id}`}
                onClick={onClose}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
              >
                <ReceiptText size={15} />
                View Full Receipt
              </Link>
            </div>
          </div>
        ) : (
          /* ================= DEPOSIT FORM ================= */
          <form onSubmit={handleDeposit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-400">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Account Selector */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Deposit Into Account
                </label>
                <span className="text-xs text-slate-400">
                  Current:{" "}
                  <strong className="text-emerald-400">
                    ₹{currentBalance.toLocaleString("en-IN")}
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
                  {accounts.map((acc, index) => (
                    <option key={acc._id} value={acc._id} className="bg-slate-900">
                      Account #{index + 1} (•••• {acc._id.slice(-6)}) — Balance: ₹
                      {(balances[acc._id] || 0).toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount Input & Preset Chips */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Deposit Amount
                </label>
                {depositAmount > 0 && (
                  <span className="text-xs text-slate-400">
                    New Balance:{" "}
                    <strong className="text-white">
                      ₹{(currentBalance + depositAmount).toLocaleString("en-IN")}
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

              {/* Quick amount chips */}
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

            {/* Payment Method Selector */}
            <div>
              <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Payment Channel
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-start rounded-2xl border p-3 text-left transition ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/5"
                          : "border-white/10 bg-slate-950/60 text-slate-400 hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <Icon
                          size={18}
                          className={isSelected ? "text-emerald-400" : "text-slate-500"}
                        />
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

                      <p className="mt-2 text-xs font-bold text-white">
                        {method.name}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {method.description}
                      </p>
                    </button>
                  );
                })}
              </div>
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
                  Authorizing Deposit...
                </>
              ) : (
                <>
                  <ArrowDownToLine size={18} />
                  Deposit ₹{depositAmount > 0 ? depositAmount.toLocaleString("en-IN") : "0"} Instantly
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DepositModal;
