import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
    <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
  </div>
);

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
};

export default ProtectedRoute;
