import { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Send,
  WalletCards,
  ArrowRight,
  AlertCircle,
  X,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  ReceiptText,
} from "lucide-react";

import api from "../../services/api";

const QUICK_AMOUNTS = [500, 1000, 2500, 5000, 10000];

const SendMoney = () => {
  const location = useLocation();

  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [fromAccount, setFromAccount] = useState(
    location.state?.defaultFromAccount || ""
  );
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Fetch accounts and balances
  const fetchAccounts = useCallback(async () => {
    try {
      setLoadingAccounts(true);
      setError("");

      const response = await api.get("/accounts");
      const fetchedAccounts = response.data.accounts || [];
      setAccounts(fetchedAccounts);

      // Fetch balance for all active accounts
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
              console.error(`Failed to fetch balance for ${acc._id}:`, err);
              return { id: acc._id, balance: 0 };
            }
          })
        );

        const balanceMap = {};
        balanceResults.forEach((item) => {
          balanceMap[item.id] = item.balance;
        });
        setBalances(balanceMap);

        // If no fromAccount is set yet, default to first active account
        if (!fromAccount) {
          const activeAccount = fetchedAccounts.find(
            (account) => account.status === "ACTIVE"
          );
          if (activeAccount) {
            setFromAccount(activeAccount._id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      setError(
        err.response?.data?.message || "Unable to load your bank accounts."
      );
    } finally {
      setLoadingAccounts(false);
    }
  }, [fromAccount]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const selectedAccountBalance = balances[fromAccount] || 0;
  const transferAmount = Number(amount) || 0;
  const remainingBalance = selectedAccountBalance - transferAmount;

  // Form Validation
  const validateForm = () => {
    if (!fromAccount) {
      setError("Please select a sender bank account.");
      return false;
    }

    if (!toAccount.trim()) {
      setError("Please enter the recipient account ID.");
      return false;
    }

    if (fromAccount === toAccount.trim()) {
      setError("Sender and recipient accounts cannot be the same.");
      return false;
    }

    if (!amount || transferAmount <= 0) {
      setError("Please enter a valid transfer amount greater than ₹0.");
      return false;
    }

    if (transferAmount > selectedAccountBalance) {
      setError(
        `Insufficient balance. Available: ₹${selectedAccountBalance.toLocaleString(
          "en-IN"
        )}, Requested: ₹${transferAmount.toLocaleString("en-IN")}`
      );
      return false;
    }

    return true;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmTransfer = async () => {
    try {
      setProcessing(true);
      setError("");

      const idempotencyKey = `${Date.now()}-${crypto.randomUUID()}`;

      const response = await api.post("/transaction", {
        fromAccount,
        toAccount: toAccount.trim(),
        amount: transferAmount,
        idempotencyKey,
      });

      setTransaction(response.data.transaction);
      setShowConfirmation(false);
      setSuccess(true);
    } catch (err) {
      console.error("Transaction failed:", err);
      setShowConfirmation(false);
      setError(
        err.response?.data?.message ||
          "Transaction failed. Please check the recipient account and try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleNewTransfer = () => {
    setSuccess(false);
    setTransaction(null);
    setToAccount("");
    setAmount("");
    setNote("");
    setError("");
    fetchAccounts();
  };

  const handleCopyTxId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => {
      setCopiedId(false);
    }, 2000);
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
  if (success && transaction) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 text-center shadow-2xl sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
            <CheckCircle2 size={36} />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-white">
            Transfer Completed!
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            The funds have been transferred and recorded on the double-entry ledger.
          </p>

          {/* Receipt Breakdown Box */}
          <div className="mt-6 rounded-2xl border border-white/5 bg-slate-950/80 p-5 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs text-slate-400">Amount Sent</span>
              <span className="text-xl font-bold text-white">
                ₹{transferAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="space-y-3 pt-4 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Transaction ID</span>
                <div className="flex items-center gap-1.5 font-mono text-slate-200">
                  <span className="max-w-[200px] truncate">{transaction._id}</span>
                  <button
                    onClick={() => handleCopyTxId(transaction._id)}
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

              <div className="flex justify-between gap-2">
                <span className="text-slate-500">From Account</span>
                <span className="font-mono text-slate-200">{fromAccount}</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-slate-500">To Account</span>
                <span className="font-mono text-slate-200">{toAccount}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-400">
                  COMPLETED
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Transfer Fee</span>
                <span className="font-semibold text-emerald-400">₹0.00 (Free)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleNewTransfer}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500"
            >
              <Send size={16} />
              Make Another Transfer
            </button>

            <Link
              to={`/transactions/${transaction._id}`}
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

  // ================= MAIN SEND FORM =================
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Send Money
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Transfer money instantly and securely between bank accounts.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Transfer Form Card */}
      <form
        onSubmit={handleContinue}
        className="space-y-6 rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl sm:p-8"
      >
        {/* Source Account Selector */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              From Account
            </label>
            <span className="text-xs text-slate-400">
              Available:{" "}
              <strong className="text-emerald-400">
                ₹{selectedAccountBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>

          <div className="relative">
            <WalletCards
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <select
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-950 py-3.5 pl-11 pr-10 text-sm font-medium text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {accounts.length === 0 && (
                <option value="">No active accounts available</option>
              )}
              {accounts.map((acc, index) => (
                <option key={acc._id} value={acc._id} className="bg-slate-900">
                  Account #{index + 1} (•••• {acc._id.slice(-6)}) — ₹
                  {(balances[acc._id] || 0).toLocaleString("en-IN")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipient Account Input & Quick Account Chips */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Recipient Account ID
          </label>

          <input
            type="text"
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            placeholder="Paste destination Account ID (e.g. 660f7e...)"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 font-mono text-sm text-white placeholder:font-sans placeholder:text-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          {/* Quick Select: Self accounts */}
          {accounts.length > 1 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span>Or choose your account:</span>
              {accounts
                .filter((acc) => acc._id !== fromAccount)
                .map((acc, idx) => (
                  <button
                    key={acc._id}
                    type="button"
                    onClick={() => setToAccount(acc._id)}
                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-blue-400 transition hover:bg-white/10 hover:text-blue-300"
                  >
                    Account #{idx + 2} (••••{acc._id.slice(-4)})
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Amount Input & Quick Chips */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Transfer Amount
            </label>
            {transferAmount > 0 && (
              <span
                className={`text-xs ${
                  remainingBalance >= 0 ? "text-slate-400" : "font-bold text-red-400"
                }`}
              >
                Remaining: ₹
                {remainingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 py-3.5 pl-10 pr-4 text-xl font-bold text-white placeholder:text-slate-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Quick amount chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt.toString())}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white"
              >
                +₹{amt.toLocaleString("en-IN")}
              </button>
            ))}
            {selectedAccountBalance > 0 && (
              <button
                type="button"
                onClick={() => setAmount(selectedAccountBalance.toString())}
                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/20"
              >
                Max Balance
              </button>
            )}
          </div>
        </div>

        {/* Transfer Note */}
        <div>
          <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
            <span>Transfer Note</span>
            <span className="font-normal normal-case text-slate-500">Optional</span>
          </label>
          <input
            type="text"
            maxLength={100}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Rent, Freelance Payment, Personal..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Submit Continue Button */}
        <button
          type="submit"
          disabled={accounts.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={17} />
          Review & Send Transfer
          <ArrowRight size={17} />
        </button>
      </form>

      {/* ================= CONFIRMATION MODAL ================= */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Confirm Transfer
                </h3>
                <p className="text-xs text-slate-400">
                  Please verify the transaction details
                </p>
              </div>
              <button
                type="button"
                onClick={() => !processing && setShowConfirmation(false)}
                disabled={processing}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-5 rounded-2xl border border-white/5 bg-slate-950 p-4 text-center">
              <span className="text-xs text-slate-500">Transfer Amount</span>
              <p className="mt-1 text-3xl font-bold tracking-tight text-white">
                ₹{transferAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">From</span>
                <span className="max-w-[200px] truncate font-mono text-slate-200">
                  {fromAccount}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">To</span>
                <span className="max-w-[200px] truncate font-mono text-slate-200">
                  {toAccount}
                </span>
              </div>
              {note && (
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Note</span>
                  <span className="text-slate-200">{note}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/5 pt-2">
                <span className="text-slate-500">Fee</span>
                <span className="font-semibold text-emerald-400">₹0.00 (Free)</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={processing}
                onClick={() => setShowConfirmation(false)}
                className="flex-1 rounded-xl border border-white/10 bg-slate-800 py-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleConfirmTransfer}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:opacity-60"
              >
                {processing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Authorizing...
                  </>
                ) : (
                  <>
                    Confirm & Send
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendMoney;