import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Users, 
  ArrowUpCircle, 
  ArrowDownCircle,
  TrendingUp,
  DollarSign,
  UserPlus,
  Activity
} from "lucide-react";
import { useAdminStats, useAdminDeposits, useAdminUsers } from "@/hooks/useAdminData";
import { format } from "date-fns";

const AdminDashboard = () => {
  const { stats, isLoading: statsLoading } = useAdminStats();
  const { users, isLoading: usersLoading } = useAdminUsers();
  const { deposits, isLoading: depositsLoading } = useAdminDeposits();

  const recentUsers = users.slice(0, 5);
  const recentDeposits = deposits.slice(0, 4);

  const statsData = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-primary", change: "+12%" },
    { label: "Active Deposits", value: `$${stats.activeDeposits.toLocaleString()}`, icon: ArrowUpCircle, color: "text-info", change: "+8%" },
    { label: "Total Withdrawals", value: `$${stats.totalWithdrawals.toLocaleString()}`, icon: ArrowDownCircle, color: "text-warning", change: "+15%" },
    { label: "Platform Revenue", value: `$${stats.platformRevenue.toLocaleString()}`, icon: DollarSign, color: "text-success", change: "+23%" },
  ];

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

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform performance and user activity.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat) => (
            <div key={stat.label} className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-sm text-success bg-success/10 px-2 py-1 rounded">
                  {stat.change}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-heading font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Activity Cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="dashboard-card flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{stats.newUsersToday}</p>
              <p className="text-muted-foreground text-sm">New users today</p>
            </div>
          </div>
          <div className="dashboard-card flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-info/20 flex items-center justify-center">
              <Activity className="w-7 h-7 text-info" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{stats.activeInvestments}</p>
              <p className="text-muted-foreground text-sm">Active investments</p>
            </div>
          </div>
          <div className="dashboard-card flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{stats.pendingWithdrawals}</p>
              <p className="text-muted-foreground text-sm">Pending withdrawals</p>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold">Recent Users</h2>
            <a href="/admin/users" className="text-primary text-sm hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            {recentUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users yet</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="text-left py-3 px-4 rounded-l-lg">User</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Joined</th>
                    <th className="text-left py-3 px-4">Balance</th>
                    <th className="text-left py-3 px-4 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="table-row">
                      <td className="py-4 px-4 font-medium">{user.full_name || 'Unknown'}</td>
                      <td className="py-4 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {user.created_at ? format(new Date(user.created_at), 'yyyy-MM-dd') : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-primary">${Number(user.balance || 0).toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className={`status-badge ${
                          user.status === "active" ? "status-active" :
                          user.status === "pending" ? "status-pending" :
                          "status-inactive"
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Deposits */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold">Recent Deposits</h2>
            <a href="/admin/deposits" className="text-primary text-sm hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            {recentDeposits.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No deposits yet</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="text-left py-3 px-4 rounded-l-lg">User</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Plan</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeposits.map((deposit) => (
                    <tr key={deposit.id} className="table-row">
                      <td className="py-4 px-4 font-medium">{deposit.user_name}</td>
                      <td className="py-4 px-4 text-success">${Number(deposit.amount).toLocaleString()}</td>
                      <td className="py-4 px-4 text-primary">{deposit.plan_name}</td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {deposit.created_at ? format(new Date(deposit.created_at), 'yyyy-MM-dd') : 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`status-badge ${
                          deposit.status === "confirmed" ? "status-active" : "status-pending"
                        }`}>
                          {deposit.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
