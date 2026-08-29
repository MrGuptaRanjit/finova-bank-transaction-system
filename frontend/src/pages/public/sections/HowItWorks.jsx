import { UserPlus, CreditCard, Send } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Create Your Account",
      description:
        "Sign up in less than 30 seconds with email verification and instant access to your banking portal.",
    },
    {
      number: "02",
      icon: CreditCard,
      title: "Manage Bank Accounts",
      description:
        "Open personal ledger accounts, check live derived balances, and receive account IDs with 1-click copy.",
    },
    {
      number: "03",
      icon: Send,
      title: "Transfer & Track Instantly",
      description:
        "Send money with zero fees, generate digital receipts, and download full statement records.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative border-t border-white/5 bg-slate-950 py-24 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
            Frictionless Onboarding
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Start banking in three simple steps.
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-400 sm:text-lg">
            Everything is designed to keep your digital banking experience fluid, secure, and straightforward.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          {/* Connecting line - desktop */}
          <div className="absolute left-[16.67%] right-[16.67%] top-10 hidden h-px bg-gradient-to-r from-blue-500/20 via-blue-500/40 to-blue-500/20 md:block" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center backdrop-blur-xl transition hover:border-blue-500/30"
              >
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/30">
                  <Icon size={24} />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-md">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold text-white">
                  {step.title}
                </h3>

                <p className="mt-3 text-xs leading-6 text-slate-400">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
