import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowUpCircle, Clock, CheckCircle } from "lucide-react";
import { useUserDeposits, useUserStats } from "@/hooks/useUserData";
import { format } from "date-fns";

const Deposits = () => {
  const { deposits, isLoading } = useUserDeposits();
  const { stats } = useUserStats();

  const activeDeposits = deposits.filter(d => d.status === 'confirmed');
  const pendingDeposits = deposits.filter(d => d.status === 'pending');

  const totalProfit = deposits.reduce((sum, d) => {
    if (d.status === 'confirmed') {
      return sum + Number(d.amount) * ((d.roi_percentage || 0) / 100);
    }
    return sum;
  }, 0);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading deposits...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">My Deposits</h1>
          <p className="text-muted-foreground">View all your investment deposits and their status.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="dashboard-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-info/20 flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Deposited</p>
                <p className="text-2xl font-heading font-bold">${stats.totalDeposits.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Active Deposits</p>
                <p className="text-2xl font-heading font-bold">{activeDeposits.length}</p>
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Profit</p>
                <p className="text-2xl font-heading font-bold">${totalProfit.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deposits Table */}
        <div className="dashboard-card">
          <h2 className="text-xl font-heading font-semibold mb-6">Deposit History</h2>
          <div className="overflow-x-auto">
            {deposits.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No deposits yet. Make your first investment!</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="text-left py-3 px-4 rounded-l-lg">Plan</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">ROI</th>
                    <th className="text-left py-3 px-4">Profit</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4 rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit) => {
                    const profit = deposit.status === 'confirmed' 
                      ? Number(deposit.amount) * ((deposit.roi_percentage || 0) / 100)
                      : 0;
                    
                    return (
                      <tr key={deposit.id} className="table-row">
                        <td className="py-4 px-4 font-medium text-primary">{deposit.plan_name}</td>
                        <td className="py-4 px-4">${Number(deposit.amount).toLocaleString()}</td>
                        <td className="py-4 px-4 text-success">{deposit.roi_percentage}%</td>
                        <td className="py-4 px-4 text-success">${profit.toFixed(2)}</td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {deposit.created_at ? format(new Date(deposit.created_at), 'yyyy-MM-dd') : 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`status-badge ${
                            deposit.status === "confirmed" ? "status-active" :
                            deposit.status === "pending" ? "status-pending" :
                            "status-inactive"
                          }`}>
                            {deposit.status === 'confirmed' ? 'Active' : 
                             deposit.status === 'pending' ? 'Pending' : 'Rejected'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Deposits;
