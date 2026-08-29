import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Printer,
  Send,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";

const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");

  const fetchTransaction = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/transaction");
      const transactions = response.data?.transactions || [];

      const found = transactions.find((item) => item._id === id);

      if (!found) {
        setError("Transaction not found or you do not have permission to view it.");
      } else {
        setTransaction(found);
      }
    } catch (err) {
      console.error("Failed to load transaction details:", err);
      setError(
        err.response?.data?.message || "Failed to load transaction details."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField("");
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "medium",
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-800" />
        <div className="h-96 animate-pulse rounded-3xl border border-white/10 bg-slate-900" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
            <AlertCircle size={28} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">Transaction Not Found</h2>
          <p className="mt-2 text-sm text-slate-400">{error || "Could not find transaction details."}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={fetchTransaction}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              <RefreshCw size={16} /> Retry
            </button>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              <ArrowLeft size={16} /> Back to Transactions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isReceived = transaction.direction === "RECEIVED";
  const isCompleted = transaction.status === "COMPLETED";
  const isPending = transaction.status === "PENDING";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/transactions")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Transactions
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <Printer size={15} />
            Print Receipt
          </button>
        </div>
      </div>

      {/* Main Digital Receipt Card */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Receipt Header Banner */}
        <div className="border-b border-white/10 bg-gradient-to-b from-slate-800/40 to-slate-900/40 p-6 text-center sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/80 ring-1 ring-white/10">
            {isReceived ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <ArrowDownLeft size={26} />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <ArrowUpRight size={26} />
              </div>
            )}
          </div>

          <h1 className="mt-4 text-sm font-medium uppercase tracking-wider text-slate-400">
            {isReceived ? "Money Received" : "Money Sent"}
          </h1>

          <p
            className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${
              isReceived ? "text-emerald-400" : "text-white"
            }`}
          >
            {isReceived ? "+" : "-"}₹
            {Number(transaction.amount || 0).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold ${
                isCompleted
                  ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                  : isPending
                  ? "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20"
                  : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 size={13} />
              ) : isPending ? (
                <Clock size={13} />
              ) : (
                <AlertCircle size={13} />
              )}
              {transaction.status}
            </span>

            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <ShieldCheck size={13} className="text-blue-400" />
              Verified Ledger
            </span>
          </div>
        </div>

        {/* Receipt Details Body */}
        <div className="space-y-4 p-6 sm:p-8">
          <div className="grid gap-3 text-sm">
            {/* Transaction Reference */}
            <div className="flex flex-col justify-between gap-1 rounded-2xl border border-white/5 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
              <span className="text-xs text-slate-500">Transaction ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-200">{transaction._id}</span>
                <button
                  onClick={() => handleCopy(transaction._id, "txId")}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  title="Copy Transaction ID"
                >
                  {copiedField === "txId" ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex flex-col justify-between gap-1 rounded-2xl border border-white/5 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
              <span className="text-xs text-slate-500">Timestamp</span>
              <span className="text-xs font-medium text-slate-200">
                {formatDate(transaction.createdAt)}
              </span>
            </div>

            {/* Sender Account */}
            <div className="flex flex-col justify-between gap-1 rounded-2xl border border-white/5 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
              <span className="text-xs text-slate-500">Sender Account (From)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-200">
                  {transaction.fromAccount}
                </span>
                <button
                  onClick={() => handleCopy(transaction.fromAccount, "fromAccount")}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  title="Copy Sender Account"
                >
                  {copiedField === "fromAccount" ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Recipient Account */}
            <div className="flex flex-col justify-between gap-1 rounded-2xl border border-white/5 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
              <span className="text-xs text-slate-500">Recipient Account (To)</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-200">
                  {transaction.toAccount}
                </span>
                <button
                  onClick={() => handleCopy(transaction.toAccount, "toAccount")}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  title="Copy Recipient Account"
                >
                  {copiedField === "toAccount" ? (
                    <Check size={14} className="text-emerald-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Idempotency Key */}
            {transaction.idempotencyKey && (
              <div className="flex flex-col justify-between gap-1 rounded-2xl border border-white/5 bg-slate-950/60 p-4 sm:flex-row sm:items-center">
                <span className="text-xs text-slate-500">Idempotency Reference</span>
                <div className="flex items-center gap-2">
                  <span className="max-w-[260px] truncate font-mono text-[11px] text-slate-400">
                    {transaction.idempotencyKey}
                  </span>
                  <button
                    onClick={() => handleCopy(transaction.idempotencyKey, "idempotency")}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    {copiedField === "idempotency" ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Transfer Breakdown */}
            <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Transfer Subtotal</span>
                <span className="font-medium text-white">
                  ₹{Number(transaction.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>Network / Processing Fee</span>
                <span className="font-medium text-emerald-400">₹0.00 (Free)</span>
              </div>
              <div className="my-3 border-t border-white/10" />
              <div className="flex justify-between text-sm font-bold text-white">
                <span>Total Amount</span>
                <span>
                  ₹{Number(transaction.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/send-money"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <Send size={16} />
              Send Money Again
            </Link>

            <Link
              to="/transactions"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              All Transactions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
