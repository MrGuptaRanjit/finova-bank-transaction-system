import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  WalletCards,
  ArrowDownToLine,
  Send,
  ArrowLeftRight,
  User,
  LogOut,
} from "lucide-react";

import Logo from "../components/ui/Logo";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import MobileNav from "../components/layout/MobileNav";
import NotificationDropdown from "../components/layout/NotificationDropdown";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Accounts",
      path: "/accounts",
      icon: WalletCards,
    },
    {
      name: "Deposit Funds",
      path: "/deposit",
      icon: ArrowDownToLine,
    },
    {
      name: "Send Money",
      path: "/send-money",
      icon: Send,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: ArrowLeftRight,
    },
  ];

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-slate-900 lg:flex lg:flex-col">

        {/* Logo */}
        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <Logo light />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/10 p-4">

          {/* Profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-500/10 text-blue-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <User size={19} />
            <span>Profile</span>
          </NavLink>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>

        </div>
      </aside>

      {/* ==================== MAIN AREA ==================== */}
      <div className="lg:pl-64">

        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-slate-950/90 px-6 backdrop-blur">

          {/* Welcome */}
          <div>
            <p className="text-sm text-slate-400">
              Welcome back
            </p>

            <p className="font-semibold text-white">
              {user?.name || "User"}
            </p>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">

            {/* Notifications */}
            <NotificationDropdown />

            {/* User information */}
            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-white">
                  {user?.name || "User"}
                </p>

                <p className="text-xs text-slate-500">
                  {user?.email || ""}
                </p>
              </div>

              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-sm font-semibold text-blue-400">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

            </div>

          </div>
        </header>

        {/* Page content */}
        <main className="p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>

      </div>

      {/* ==================== MOBILE NAVIGATION ==================== */}
      <MobileNav />

    </div>
  );
};

export default DashboardLayout;