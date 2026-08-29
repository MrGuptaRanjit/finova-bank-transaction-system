import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  WalletCards,
  ArrowDownToLine,
  Send,
  ArrowLeftRight,
} from "lucide-react";

const MobileNav = () => {
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
      name: "Deposit",
      path: "/deposit",
      icon: ArrowDownToLine,
    },
    {
      name: "Send",
      path: "/send-money",
      icon: Send,
    },
    {
      name: "History",
      path: "/transactions",
      icon: ArrowLeftRight,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-900/95 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-3 text-xs transition ${
                  isActive
                    ? "text-blue-400"
                    : "text-slate-500 hover:text-white"
                }`
              }
            >
              <Icon size={19} />

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;