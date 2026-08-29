import {
  Eye,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
const SecuritySection = () => {
  return (
    <div>
       <section
        id="security"
        className="overflow-hidden bg-slate-950 py-24 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* Left Content */}
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                <ShieldCheck size={22} />
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">
                Security first
              </p>

              <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Your banking experience should feel secure by design.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
                From authenticated access to transaction tracking,
                every important part of the application is designed
                around protecting your account and making activity
                easy to understand.
              </p>
            </div>

            {/* Right Security Cards */}
            <div className="grid gap-4 sm:grid-cols-2">

              {/* Card 1 */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 transition-colors duration-300 hover:bg-white/[0.08]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <LockKeyhole size={21} />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white">
                  Protected access
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Authentication controls access to private banking
                  functionality and account information.
                </p>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 transition-colors duration-300 hover:bg-white/[0.08]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck size={21} />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white">
                  Secure workflow
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Important banking actions are handled through
                  authenticated application flows.
                </p>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 transition-colors duration-300 hover:bg-white/[0.08]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <ReceiptText size={21} />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white">
                  Transaction visibility
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Review transaction records so you can clearly
                  understand your account activity.
                </p>
              </div>

              {/* Card 4 */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 transition-colors duration-300 hover:bg-white/[0.08]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <Eye size={21} />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white">
                  Clear activity
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Account activity is presented clearly instead of
                  hiding important transaction information.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SecuritySection
