import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminStats, useAdminDeposits, useAdminUsers } from "@/hooks/useAdminData";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { user, isAdmin, authReady } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!authReady) return;
    if (!user) navigate("/auth", { replace: true });
    if (isAdmin === false) navigate("/dashboard", { replace: true });
  }, [authReady, user, isAdmin, navigate]);

  if (!authReady || isAdmin === null) return null; // wait for auth

  const { stats, isLoading: statsLoading } = useAdminStats();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: deposits, isLoading: depositsLoading } = useAdminDeposits();

  if (statsLoading || usersLoading || depositsLoading) {
    return <AdminLayout>Loading dashboard...</AdminLayout>;
  }

  const recentUsers = users.slice(0, 5);
  const recentDeposits = deposits.slice(0, 4);

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="dashboard-card">Total Users: {stats.totalUsers}</div>
        <div className="dashboard-card">Active Deposits: ${stats.activeDeposits}</div>
        <div className="dashboard-card">Total Withdrawals: ${stats.totalWithdrawals}</div>
        <div className="dashboard-card">Total Profit: ${stats.totalProfit}</div>
      </div>

      {/* Recent Users */}
      <div className="dashboard-card mb-6">
        <h2 className="font-semibold mb-2">Recent Users</h2>
        {recentUsers.length === 0 ? (
          <p>No users yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Name</th>
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

      {/* Recent Deposits */}
      <div className="dashboard-card">
        <h2 className="font-semibold mb-2">Recent Deposits</h2>
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
    </AdminLayout>
  );
};

export default AdminDashboard;
