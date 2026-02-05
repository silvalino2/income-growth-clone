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

const stats = [
  { label: "Total Balance", value: "$5,230.00", icon: Wallet, color: "text-primary" },
  { label: "Total Profit", value: "$1,430.00", icon: TrendingUp, color: "text-success" },
  { label: "Total Deposit", value: "$3,800.00", icon: ArrowUpCircle, color: "text-info" },
  { label: "Total Withdrawal", value: "$0.00", icon: ArrowDownCircle, color: "text-warning" },
];

const recentTransactions = [
  { id: 1, type: "Deposit", amount: "$500.00", status: "Completed", date: "2024-01-15", plan: "BASIC" },
  { id: 2, type: "Profit", amount: "$75.00", status: "Credited", date: "2024-01-16", plan: "BASIC" },
  { id: 3, type: "Deposit", amount: "$1,000.00", status: "Completed", date: "2024-01-18", plan: "SILVER" },
  { id: 4, type: "Profit", amount: "$150.00", status: "Credited", date: "2024-01-19", plan: "SILVER" },
  { id: 5, type: "Deposit", amount: "$2,300.00", status: "Pending", date: "2024-01-20", plan: "SILVER" },
];

const activeInvestments = [
  { plan: "BASIC", amount: "$500.00", roi: "30%", earned: "$75.00", duration: "48hrs", status: "Active" },
  { plan: "SILVER", amount: "$1,000.00", roi: "50%", earned: "$150.00", duration: "72hrs", status: "Active" },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Welcome back, John!</h1>
          <p className="text-muted-foreground">Here's what's happening with your investments today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
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
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left py-3 px-4 rounded-l-lg">Plan</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">ROI</th>
                  <th className="text-left py-3 px-4">Earned</th>
                  <th className="text-left py-3 px-4">Duration</th>
                  <th className="text-left py-3 px-4 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeInvestments.map((inv, index) => (
                  <tr key={index} className="table-row">
                    <td className="py-4 px-4 font-medium text-primary">{inv.plan}</td>
                    <td className="py-4 px-4">{inv.amount}</td>
                    <td className="py-4 px-4 text-success">{inv.roi}</td>
                    <td className="py-4 px-4 text-success">{inv.earned}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {inv.duration}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="status-badge status-active">{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="dashboard-card">
          <h2 className="text-xl font-heading font-semibold mb-6">Recent Transactions</h2>
          <div className="overflow-x-auto">
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
                        {tx.type === "Deposit" ? (
                          <ArrowUpCircle className="w-4 h-4 text-info" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-success" />
                        )}
                        {tx.type}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium">{tx.amount}</td>
                    <td className="py-4 px-4 text-primary">{tx.plan}</td>
                    <td className="py-4 px-4 text-muted-foreground">{tx.date}</td>
                    <td className="py-4 px-4">
                      <span className={`status-badge ${
                        tx.status === "Completed" || tx.status === "Credited" 
                          ? "status-active" 
                          : "status-pending"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                REF-JOHN2024
              </code>
              <button 
                className="btn-hero text-sm px-4 py-2"
                onClick={() => navigator.clipboard.writeText("REF-JOHN2024")}
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
