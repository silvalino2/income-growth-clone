import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpCircle, 
  ArrowDownCircle,
  DollarSign,
  Users,
  Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserStats, useUserDeposits } from "@/hooks/useUserData";
import { format } from "date-fns";

const Dashboard = () => {
  const { profile } = useAuth();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { deposits, isLoading: depositsLoading } = useUserDeposits();

  const activeInvestments = deposits.filter(d => d.status === 'confirmed');
  const recentTransactions = deposits.slice(0, 5);

  const statsData = [
    { label: "Total Balance", value: `$${stats.balance.toFixed(2)}`, icon: Wallet, color: "text-primary" },
    // profit isn't tracked by hook, show 0 or calculate via deposits if needed
    { label: "Total Profit", value: `$0.00`, icon: TrendingUp, color: "text-success" },
    { label: "Total Deposit", value: `$${stats.totalDeposits.toFixed(2)}`, icon: ArrowUpCircle, color: "text-info" },
    { label: "Total Withdrawal", value: `$${stats.totalWithdrawals.toFixed(2)}`, icon: ArrowDownCircle, color: "text-warning" },
  ];

  const displayName = profile?.full_name?.split(' ')[0] || 'Investor';

  if (statsLoading || depositsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Welcome back, {displayName}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your investments today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat) => (
            <div key={stat.label} className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-heading font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Active Investments */}
        <div className="dashboard-card">
          <h2 className="text-xl font-heading font-semibold mb-6">Active Investments</h2>
          <div className="overflow-x-auto">
            {activeInvestments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No active investments. Make a deposit to get started!</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="text-left py-3 px-4 rounded-l-lg">Plan</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">ROI</th>
                    <th className="text-left py-3 px-4">Earned</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeInvestments.map((inv) => {
                    const earned = Number(inv.amount) * ((inv.roi_percentage || 0) / 100);
                    return (
                      <tr key={inv.id} className="table-row">
                        <td className="py-4 px-4 font-medium text-primary">{inv.plan_name}</td>
                        <td className="py-4 px-4">${Number(inv.amount).toLocaleString()}</td>
                        <td className="py-4 px-4 text-success">{inv.roi_percentage}%</td>
                        <td className="py-4 px-4 text-success">${earned.toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {inv.created_at ? format(new Date(inv.created_at), 'yyyy-MM-dd') : 'N/A'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="status-badge status-active">Active</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="dashboard-card">
          <h2 className="text-xl font-heading font-semibold mb-6">Recent Transactions</h2>
          <div className="overflow-x-auto">
            {recentTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No transactions yet.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="text-left py-3 px-4 rounded-l-lg">Type</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Plan</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="table-row">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <ArrowUpCircle className="w-4 h-4 text-info" />
                          Deposit
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">${Number(tx.amount).toLocaleString()}</td>
                      <td className="py-4 px-4 text-primary">{tx.plan_name}</td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {tx.created_at ? format(new Date(tx.created_at), 'yyyy-MM-dd') : 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`status-badge ${
                          tx.status === "confirmed" 
                            ? "status-active" 
                            : "status-pending"
                        }`}>
                          {tx.status === 'confirmed' ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Referral Banner */}
        <div className="dashboard-card bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-semibold">Invite Friends & Earn</h3>
                <p className="text-muted-foreground text-sm">Get 10% commission on every referral deposit</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <code className="bg-background px-4 py-2 rounded-lg text-sm">
                {profile?.referral_code || 'REF-CODE'}
              </code>
              <button 
                className="btn-hero text-sm px-4 py-2"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(profile?.referral_code || '');
                  }
                }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
