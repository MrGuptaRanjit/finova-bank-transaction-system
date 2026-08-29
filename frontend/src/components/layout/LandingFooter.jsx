import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../ui/Logo";

const LandingFooter = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo light />

            <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
              A modern digital banking platform for managing accounts,
              transferring money, and keeping track of your transactions.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Product
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="#features"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="#how-it-works"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  How it works
                </a>
              </li>

              <li>
                <a
                  href="#security"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-white">
              Account
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  to="/login"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Sign in
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="text-sm text-slate-400 transition-colors hover:text-white"
                >
                  Create account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col gap-5 border-t border-slate-800 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © 2026 Finova. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <span className="text-xs text-slate-500">
              Secure banking experience
            </span>

            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <ShieldCheck size={14} />
              Protected
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;