import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  DollarSign,
  UserPlus,
  Activity,
} from "lucide-react";
import {
  useAdminStats,
  useAdminDeposits,
  useAdminUsers,
} from "@/hooks/useAdminData";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { user, isAdmin, authReady } = useAuth();
  const navigate = useNavigate();

  const { stats, isLoading: statsLoading } = useAdminStats();
  const { users = [], isLoading: usersLoading } = useAdminUsers();
  const { deposits = [], isLoading: depositsLoading } = useAdminDeposits();

  // ✅ SAFE Admin Protection (No Loop)
  useEffect(() => {
    if (!authReady) return; // Wait for auth to finish

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [user, isAdmin, authReady, navigate]);

  // ✅ Always show something (no return null)
  if (!authReady) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>Checking authentication...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>Redirecting...</p>
        </div>
      </AdminLayout>
    );
  }

  if (statsLoading || usersLoading || depositsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  const recentUsers = users.slice(0, 5);
  const recentDeposits = deposits.slice(0, 4);

  const statsData = [
    {
      label: "Total Users",
      value: stats?.totalUsers?.toLocaleString() || "0",
      icon: Users,
    },
    {
      label: "Active Deposits",
      value: `$${stats?.activeDeposits?.toLocaleString() || 0}`,
      icon: ArrowUpCircle,
    },
    {
      label: "Total Withdrawals",
      value: `$${stats?.totalWithdrawals?.toLocaleString() || 0}`,
      icon: ArrowDownCircle,
    },
    {
      label: "Platform Revenue",
      value: `$${stats?.platformRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">

        <div>
          <h1 className="text-3xl font-bold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of platform activity.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat) => (
            <div key={stat.label} className="dashboard-card p-4">
              <div className="flex items-center gap-4">
                <stat.icon className="w-6 h-6" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Users */}
        <div className="dashboard-card p-4">
          <h2 className="text-lg font-semibold mb-4">
            Recent Users
          </h2>

          {recentUsers.length === 0 ? (
            <p>No users yet</p>
          ) : (
            <div className="space-y-2">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex justify-between">
                  <span>{u.full_name || "Unknown"}</span>
                  <span>
                    {u.created_at
                      ? format(new Date(u.created_at), "yyyy-MM-dd")
                      : "N/A"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Deposits */}
        <div className="dashboard-card p-4">
          <h2 className="text-lg font-semibold mb-4">
            Recent Deposits
          </h2>

          {recentDeposits.length === 0 ? (
            <p>No deposits yet</p>
          ) : (
            <div className="space-y-2">
              {recentDeposits.map((d) => (
                <div key={d.id} className="flex justify-between">
                  <span>{d.user_name}</span>
                  <span>${Number(d.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
