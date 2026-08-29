import {
  ArrowRight,
  TrendingUp,
  WalletCards,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const FeaturesSection = () => {
  return (
    <section id="features" className="relative bg-slate-950 py-24 sm:py-28">
      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section heading */}
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
            Engineered For Speed & Accuracy
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Everything you need to manage your money.
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-400 sm:text-lg">
            A high-performance banking experience built with double-entry cryptographic ledger architecture, instant transfers, and total transaction transparency.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {/* Account Management */}
          <div className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
              <WalletCards size={22} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-white">
              Multi-Account Management
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Open multiple bank accounts in seconds, monitor live ledger-derived balances, and organize your finances seamlessly.
            </p>

            <Link
              to="/accounts"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Explore accounts
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Transfers */}
          <div className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 transition-colors duration-300 group-hover:bg-emerald-600 group-hover:text-white">
              <Zap size={22} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-white">
              Instant Zero-Fee Transfers
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Send money between accounts through an atomic transfer workflow protected by idempotency keys and session locking.
            </p>

            <Link
              to="/send-money"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
            >
              Send funds
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Transactions */}
          <div className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 transition-colors duration-300 group-hover:bg-purple-600 group-hover:text-white">
              <TrendingUp size={22} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-white">
              Full Statement & Audit
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Search, filter, and inspect detailed digital receipts for every transaction, or export your complete statements to CSV.
            </p>

            <Link
              to="/transactions"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-400 transition hover:text-purple-300"
            >
              View statement
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
