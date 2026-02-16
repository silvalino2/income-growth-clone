import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean; // if true, only admins can access
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, isAdmin, authReady } = useAuth();
  const navigate = useNavigate();

  // Wait until auth is ready
  if (!authReady) return null;

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (adminOnly && !isAdmin) {
    navigate("/dashboard");
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
