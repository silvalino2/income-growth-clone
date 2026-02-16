import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Users, ArrowUpCircle, ArrowDownCircle, TrendingUp, DollarSign, UserPlus, Activity } from "lucide-react";
import { useAdminStats, useAdminDeposits, useAdminUsers } from "@/hooks/useAdminData";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { user, isAdmin, authReady } = useAuth();
  const navigate = useNavigate();

  const { stats, isLoading: statsLoading } = useAdminStats();
  const { users, isLoading: usersLoading } = useAdminUsers();
  const { deposits, isLoading: depositsLoading } = useAdminDeposits();

  // 🔒 Admin protection
  useEffect(() => {
    if (!authReady) return;
    if (!user) navigate("/auth");
    else if (!isAdmin) navigate("/dashboard");
  }, [user, isAdmin, authReady, navigate]);

  if (!authReady) return null; // wait until auth context is ready

  if (statsLoading || usersLoading || depositsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const recentUsers = users.slice(0, 5);
  const recentDeposits = deposits.slice(0, 4);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="dashboard-card">
            <p>Total Users</p>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="dashboard-card">
            <p>Active Deposits</p>
            <p>${stats.activeDeposits}</p>
          </div>
          <div className="dashboard-card">
            <p>Total Withdrawals</p>
            <p>${stats.totalWithdrawals}</p>
          </div>
          <div className="dashboard-card">
            <p>Platform Revenue</p>
            <p>${stats.platformRevenue}</p>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="dashboard-card">
          <h2>Recent Users</h2>
          {recentUsers.length === 0 ? (
            <p>No users yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id}>
                    <td>{u.full_name || "Unknown"}</td>
                    <td>{u.email}</td>
                    <td>{u.created_at ? format(new Date(u.created_at), "yyyy-MM-dd") : "N/A"}</td>
                    <td>${Number(u.balance || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Deposits Table */}
        <div className="dashboard-card">
          <h2>Recent Deposits</h2>
          {recentDeposits.length === 0 ? (
            <p>No deposits yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Plan</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentDeposits.map(d => (
                  <tr key={d.id}>
                    <td>{d.user_name}</td>
                    <td>${Number(d.amount)}</td>
                    <td>{d.plan_name}</td>
                    <td>{d.created_at ? format(new Date(d.created_at), "yyyy-MM-dd") : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
              </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
