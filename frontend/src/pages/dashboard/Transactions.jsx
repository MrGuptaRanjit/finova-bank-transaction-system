import { useEffect, useState, useMemo, useCallback } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Search,
  Download,
  ChevronRight,
  Send,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const Transactions = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [directionFilter, setDirectionFilter] = useState("ALL"); // ALL | RECEIVED | SENT
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | COMPLETED | PENDING | FAILED
  const [sortBy, setSortBy] = useState("NEWEST"); // NEWEST | OLDEST | HIGHEST | LOWEST

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/transaction");
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError(
        err.response?.data?.message || "Unable to load transaction records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filtered and Sorted list
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Direction filter
        if (directionFilter === "RECEIVED" && tx.direction !== "RECEIVED") {
          return false;
        }
        if (directionFilter === "SENT" && tx.direction !== "SENT") {
          return false;
        }

        // Status filter
        if (statusFilter !== "ALL" && tx.status !== statusFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const idMatch = tx._id?.toLowerCase().includes(q);
          const fromMatch = tx.fromAccount?.toLowerCase().includes(q);
          const toMatch = tx.toAccount?.toLowerCase().includes(q);
          const amountMatch = tx.amount?.toString().includes(q);
          if (!idMatch && !fromMatch && !toMatch && !amountMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "NEWEST") {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === "OLDEST") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortBy === "HIGHEST") {
          return Number(b.amount || 0) - Number(a.amount || 0);
        }
        if (sortBy === "LOWEST") {
          return Number(a.amount || 0) - Number(b.amount || 0);
        }
        return 0;
      });
  }, [transactions, directionFilter, statusFilter, searchQuery, sortBy]);

  // Summary Metrics
  const stats = useMemo(() => {
    let received = 0;
    let sent = 0;

    transactions.forEach((tx) => {
      if (tx.status === "COMPLETED") {
        const amt = Number(tx.amount) || 0;
        if (tx.direction === "RECEIVED") received += amt;
        if (tx.direction === "SENT") sent += amt;
      }
    });

    return {
      totalReceived: received,
      totalSent: sent,
      netFlow: received - sent,
      totalCount: transactions.length,
    };
  }, [transactions]);

  // Export CSV Statement
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = [
      "Transaction ID",
      "Direction",
      "Amount (INR)",
      "Status",
      "From Account",
      "To Account",
      "Date",
    ];

    const rows = filteredTransactions.map((tx) => [
      `"${tx._id}"`,
      `"${tx.direction || "N/A"}"`,
      tx.amount,
      `"${tx.status}"`,
      `"${tx.fromAccount}"`,
      `"${tx.toAccount}"`,
      `"${new Date(tx.createdAt).toISOString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Finova_Statement_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-800" />
        <div className="h-40 animate-pulse rounded-3xl border border-white/10 bg-slate-900" />
        <div className="h-96 animate-pulse rounded-3xl border border-white/10 bg-slate-900" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Transactions & Statement
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time ledger audit history, search, and CSV export.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTransactions}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
          >
            <Download size={14} />
            Export CSV
          </button>

          <Link
            to="/send-money"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            <Send size={14} />
            Send Money
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Received
          </span>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            +₹
            {stats.totalReceived.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total Sent
          </span>
          <p className="mt-2 text-2xl font-bold text-white">
            -₹
            {stats.totalSent.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Net Cash Flow
          </span>
          <p
            className={`mt-2 text-2xl font-bold ${
              stats.netFlow >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {stats.netFlow >= 0 ? "+" : "-"}₹
            {Math.abs(stats.netFlow).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            All Records
          </span>
          <p className="mt-2 text-2xl font-bold text-blue-400">
            {stats.totalCount} Transfers
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl">
        {/* Direction Tabs & Search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 rounded-2xl border border-white/10 bg-slate-950 p-1">
            {[
              { label: "All Activity", value: "ALL" },
              { label: "Money Received", value: "RECEIVED" },
              { label: "Money Sent", value: "SENT" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setDirectionFilter(tab.value)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  directionFilter === tab.value
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative flex-1 md:max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, account, amount..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500"
            />
          </div>
        </div>

        {/* Secondary Filters: Status & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="HIGHEST">Highest Amount</option>
              <option value="LOWEST">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List / Table */}
      {filteredTransactions.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
          <p className="text-base font-bold text-white">No transactions found</p>
          <p className="mt-1 text-xs text-slate-400">
            {searchQuery || directionFilter !== "ALL" || statusFilter !== "ALL"
              ? "Try adjusting your search terms or active filters."
              : "Your account has no transactions yet. Make your first transfer to see activity."}
          </p>
          {transactions.length === 0 && (
            <Link
              to="/send-money"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              <Send size={14} />
              Send Money Now
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
          {/* Desktop Table Header */}
          <div className="hidden grid-cols-12 border-b border-white/10 bg-slate-950/40 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 md:grid">
            <div className="col-span-4">Type & Transaction ID</div>
            <div className="col-span-3">Transfer Details</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Date & Time</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {filteredTransactions.map((tx) => {
              const isReceived = tx.direction === "RECEIVED";
              const isCompleted = tx.status === "COMPLETED";
              const isPending = tx.status === "PENDING";

              return (
                <div
                  key={tx._id}
                  onClick={() => navigate(`/transactions/${tx._id}`)}
                  className="group flex cursor-pointer flex-col gap-3 p-5 transition-colors hover:bg-white/[0.03] md:grid md:grid-cols-12 md:items-center md:px-6 md:py-4"
                >
                  {/* Type & ID */}
                  <div className="flex items-center gap-3.5 md:col-span-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        isReceived
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {isReceived ? (
                        <ArrowDownLeft size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">
                        {isReceived ? "Money Received" : "Money Sent"}
                      </p>
                      <p className="font-mono text-xs text-slate-500">
                        {tx._id}
                      </p>
                    </div>
                  </div>

                  {/* Transfer Details / Accounts */}
                  <div className="space-y-0.5 text-xs md:col-span-3">
                    <p className="text-slate-400">
                      From: <span className="font-mono text-slate-300">••••{tx.fromAccount?.slice(-6)}</span>
                    </p>
                    <p className="text-slate-400">
                      To: <span className="font-mono text-slate-300">••••{tx.toAccount?.slice(-6)}</span>
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between md:col-span-2 md:block">
                    <span className="text-xs text-slate-500 md:hidden">Amount:</span>
                    <p
                      className={`text-base font-bold ${
                        isReceived ? "text-emerald-400" : "text-white"
                      }`}
                    >
                      {isReceived ? "+" : "-"}₹
                      {Number(tx.amount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between md:col-span-1 md:block">
                    <span className="text-xs text-slate-500 md:hidden">Status:</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        isCompleted
                          ? "bg-emerald-500/10 text-emerald-400"
                          : isPending
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>

                  {/* Date & Link */}
                  <div className="flex items-center justify-between text-xs text-slate-400 md:col-span-2 md:justify-end md:gap-2">
                    <span className="md:hidden">Timestamp:</span>
                    <span>{formatDate(tx.createdAt)}</span>
                    <ChevronRight
                      size={16}
                      className="hidden text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-white md:block"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;