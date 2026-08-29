import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const FinalCTA = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-5 py-20 sm:px-8 sm:py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-900/60 via-slate-900 to-slate-950 px-6 py-14 text-center shadow-2xl backdrop-blur-xl sm:px-12 sm:py-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300">
          <Sparkles size={14} className="text-blue-400" />
          Zero Fees • Real-Time Transfers
        </div>

        <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Take full control of your banking today.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
          Join Finova to create your digital accounts, make instant transfers, and experience next-generation financial transparency.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 font-bold text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-500"
          >
            Create an Account
            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-bold text-white transition hover:bg-white/10"
          >
            Sign In to Portal
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
