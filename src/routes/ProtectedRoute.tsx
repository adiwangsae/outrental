import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../store";

export default function ProtectedRoute({ role }: { role?: "admin" | "customer" }) {
  const { user, token } = useStore();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (role) {
    const userRole = user.role.toLowerCase();
    const isAdminRole = userRole === "admin" || userRole === "super_admin" || userRole === "demo_admin";
    const isCustomerRole = userRole === "customer" || userRole === "demo_customer";

    if (role === "admin" && !isAdminRole) {
      return <Navigate to="/" replace />;
    }
    if (role === "customer" && !isCustomerRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
