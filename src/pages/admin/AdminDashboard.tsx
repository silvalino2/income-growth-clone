import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAdminStats,
  useAdminDeposits,
  useAdminUsers,
} from "@/hooks/useAdminData";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { user, isAdmin, authReady } = useAuth();
  const navigate = useNavigate();

  /* -------------------------------------------------------
     AUTH GUARD
  ------------------------------------------------------- */

  const isAllowed = useMemo(() => {
    return authReady && !!user && isAdmin;
  }, [authReady, user, isAdmin]);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    if (!isAdmin) {
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [authReady, user, isAdmin, navigate]);

  /* -------------------------------------------------------
     ONLY FETCH IF ADMIN VERIFIED
  ------------------------------------------------------- */

  const {
    stats,
    isLoading: statsLoading,
  } = useAdminStats(isAllowed);

  const {
    data: users,
    isLoading: usersLoading,
  } = useAdminUsers(isAllowed);

  const {
    data: deposits,
    isLoading: depositsLoading,
  } = useAdminDeposits(isAllowed);

  /* -------------------------------------------------------
     LOADING STATE
  ------------------------------------------------------- */

  if (!authReady || !isAllowed) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (statsLoading || usersLoading || depositsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Loading dashboard...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  /* -------------------------------------------------------
     SAFE DATA
  ------------------------------------------------------- */

  const recentUsers = users?.slice(0, 5) ?? [];
  const recentDeposits = deposits?.slice(0, 4) ?? [];

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        {/* Stats */}
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

        {/* Recent Users */}
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
                {recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name || "Unknown"}</td>
                    <td>{u.email}</td>
                    <td>
                      {u.created_at
                        ? format(new Date(u.created_at), "yyyy-MM-dd")
                        : "N/A"}
                    </td>
                    <td>${Number(u.balance || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Deposits */}
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
                {recentDeposits.map((d) => (
                  <tr key={d.id}>
                    <td>{d.user_name}</td>
                    <td>${Number(d.amount)}</td>
                    <td>{d.plan_name}</td>
                    <td>
                      {d.created_at
                        ? format(new Date(d.created_at), "yyyy-MM-dd")
                        : "N/A"}
                    </td>
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
