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

  // redirect logic as side effect
  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    if (adminOnly) {
      // wait until we know if the user is admin
      if (isAdmin === false) {
        navigate("/dashboard");
      }
    }
  }, [authReady, user, isAdmin, adminOnly, navigate]);

  if (!authReady) return null;
  if (!user) return null;
  if (adminOnly && isAdmin === null) return null; // still checking
  if (adminOnly && isAdmin === false) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
