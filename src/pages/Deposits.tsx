import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ArrowUpCircle, Clock, CheckCircle } from "lucide-react";

const deposits = [
  { id: 1, plan: "STARTER", amount: "$100.00", roi: "15%", profit: "$15.00", date: "2024-01-10", status: "Completed" },
  { id: 2, plan: "BASIC", amount: "$500.00", roi: "30%", profit: "$150.00", date: "2024-01-12", status: "Completed" },
  { id: 3, plan: "BASIC", amount: "$750.00", roi: "30%", profit: "$225.00", date: "2024-01-14", status: "Active" },
  { id: 4, plan: "SILVER", amount: "$1,000.00", roi: "50%", profit: "$500.00", date: "2024-01-15", status: "Active" },
  { id: 5, plan: "SILVER", amount: "$2,300.00", roi: "50%", profit: "$0.00", date: "2024-01-20", status: "Pending" },
];

const Deposits = () => {
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
                <p className="text-2xl font-heading font-bold">$4,650.00</p>
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
                <p className="text-2xl font-heading font-bold">2</p>
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
                <p className="text-2xl font-heading font-bold">$890.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deposits Table */}
        <div className="dashboard-card">
          <h2 className="text-xl font-heading font-semibold mb-6">Deposit History</h2>
          <div className="overflow-x-auto">
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
                {deposits.map((deposit) => (
                  <tr key={deposit.id} className="table-row">
                    <td className="py-4 px-4 font-medium text-primary">{deposit.plan}</td>
                    <td className="py-4 px-4">{deposit.amount}</td>
                    <td className="py-4 px-4 text-success">{deposit.roi}</td>
                    <td className="py-4 px-4 text-success">{deposit.profit}</td>
                    <td className="py-4 px-4 text-muted-foreground">{deposit.date}</td>
                    <td className="py-4 px-4">
                      <span className={`status-badge ${
                        deposit.status === "Completed" ? "status-active" :
                        deposit.status === "Active" ? "status-pending" :
                        "status-inactive"
                      }`}>
                        {deposit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Deposits;
