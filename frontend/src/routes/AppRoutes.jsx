import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";

import Landing from "../pages/public/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/dashboard/Dashboard";
import Profile from "../pages/dashboard/Profile";
import Accounts from "../pages/dashboard/Accounts";
import SendMoney from "../pages/dashboard/SendMoney";
import Deposit from "../pages/dashboard/Deposit";
import Transactions from "../pages/dashboard/Transactions";
import TransactionDetails from "../pages/dashboard/TransactionDetails";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}

      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= PROTECTED ROUTES ================= */}

      <Route element={<ProtectedRoute />}>
        {/* Dashboard Application Layout */}
        <Route element={<DashboardLayout />}>
          {/* /dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* /accounts */}
          <Route path="/accounts" element={<Accounts />} />

          {/* /deposit */}
          <Route path="/deposit" element={<Deposit />} />

          {/* /send-money */}
          <Route path="/send-money" element={<SendMoney />} />

          {/* /transactions */}
          <Route path="/transactions" element={<Transactions />} />

          {/* /transactions/:id */}
          <Route path="/transactions/:id" element={<TransactionDetails />} />

          {/* /profile */}
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ================= 404 CATCH-ALL ================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
