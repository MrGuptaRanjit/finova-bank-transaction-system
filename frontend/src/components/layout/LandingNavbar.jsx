import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../ui/Logo";
import Button from "../ui/Button";

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
        <nav className="flex items-center justify-between">
          <Logo light />

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              How it works
            </a>

            <a
              href="#security"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Security
            </a>

            <Link
              to="/login"
              className="text-sm font-semibold text-white transition-colors hover:text-blue-300"
            >
              Sign in
            </Link>

            <Button to="/register" variant="light" className="px-5 py-2.5">
              Get started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 md:hidden"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-1">
              <a
                href="#features"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                How it works
              </a>

              <a
                href="#security"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                Security
              </a>

              <div className="my-2 border-t border-white/10" />

              <Link
                to="/login"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
              >
                Sign in
              </Link>

              <Button
                to="/register"
                variant="light"
                className="mt-1 w-full"
              >
                Get started
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default LandingNavbar;