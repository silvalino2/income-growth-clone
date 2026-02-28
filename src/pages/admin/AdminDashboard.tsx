import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminStats, useAdminDeposits, useAdminUsers } from "@/hooks/useAdminData";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { user, isAdmin, authReady } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admins once auth is ready
  useMemo(() => {
    if (!authReady) return;
    if (!user) return navigate("/auth", { replace: true });
    if (!isAdmin) return navigate("/dashboard", { replace: true });
  }, [authReady, user, isAdmin, navigate]);

  // Only allow hooks to fetch when admin verified
  const isAllowed = authReady && user && isAdmin;

  const { stats, isLoading: statsLoading } = useAdminStats(isAllowed);
  const { data: users, isLoading: usersLoading } = useAdminUsers(isAllowed);
  const { data: deposits, isLoading: depositsLoading } = useAdminDeposits(isAllowed);

  if (!authReady || !isAllowed) return null; // wait until we know admin
  if (statsLoading || usersLoading || depositsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const recentUsers = users?.slice(0, 5) ?? [];
  const recentDeposits = deposits?.slice(0, 4) ?? [];

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
            <p>Platform Profit</p>
            <p>${stats.totalProfit}</p>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="dashboard-card">
          <h2 className="mb-4 font-semibold">Recent Users</h2>
          {recentUsers.length === 0 ? (
            <p>No users yet</p>
          ) : (
            <table className="w-full text-sm">
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
          <h2 className="mb-4 font-semibold">Recent Deposits</h2>
          {recentDeposits.length === 0 ? (
            <p>No deposits yet</p>
          ) : (
            <table className="w-full text-sm">
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
