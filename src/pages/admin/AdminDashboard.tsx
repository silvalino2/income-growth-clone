import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Users, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle,
  TrendingUp,
  DollarSign,
  UserPlus,
  Activity
} from "lucide-react";

const stats = [
  { label: "Total Users", value: "1,234", icon: Users, color: "text-primary", change: "+12%" },
  { label: "Active Deposits", value: "$856,420", icon: ArrowUpCircle, color: "text-info", change: "+8%" },
  { label: "Total Withdrawals", value: "$234,560", icon: ArrowDownCircle, color: "text-warning", change: "+15%" },
  { label: "Platform Revenue", value: "$45,230", icon: DollarSign, color: "text-success", change: "+23%" },
];

const recentUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", joined: "2024-01-20", status: "Active", balance: "$5,230" },
  { id: 2, name: "Sarah Wilson", email: "sarah@example.com", joined: "2024-01-19", status: "Active", balance: "$12,450" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", joined: "2024-01-18", status: "Pending", balance: "$0" },
  { id: 4, name: "Emily Davis", email: "emily@example.com", joined: "2024-01-17", status: "Active", balance: "$3,800" },
  { id: 5, name: "Tom Brown", email: "tom@example.com", joined: "2024-01-16", status: "Suspended", balance: "$1,200" },
];

const recentDeposits = [
  { id: 1, user: "John Doe", amount: "$2,500", plan: "SILVER", date: "2024-01-20", status: "Pending" },
  { id: 2, user: "Sarah Wilson", amount: "$5,000", plan: "GOLD", date: "2024-01-20", status: "Confirmed" },
  { id: 3, user: "Emily Davis", amount: "$750", plan: "BASIC", date: "2024-01-19", status: "Confirmed" },
  { id: 4, user: "Alex Turner", amount: "$100", plan: "STARTER", date: "2024-01-19", status: "Pending" },
];

const AdminDashboard = () => {
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
          {stats.map((stat) => (
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
              <p className="text-2xl font-heading font-bold">47</p>
              <p className="text-muted-foreground text-sm">New users today</p>
            </div>
          </div>
          <div className="dashboard-card flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-info/20 flex items-center justify-center">
              <Activity className="w-7 h-7 text-info" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">234</p>
              <p className="text-muted-foreground text-sm">Active investments</p>
            </div>
          </div>
          <div className="dashboard-card flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">15</p>
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
                    <td className="py-4 px-4 font-medium">{user.name}</td>
                    <td className="py-4 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-4 px-4 text-muted-foreground">{user.joined}</td>
                    <td className="py-4 px-4 text-primary">{user.balance}</td>
                    <td className="py-4 px-4">
                      <span className={`status-badge ${
                        user.status === "Active" ? "status-active" :
                        user.status === "Pending" ? "status-pending" :
                        "status-inactive"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Deposits */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold">Recent Deposits</h2>
            <a href="/admin/deposits" className="text-primary text-sm hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
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
                    <td className="py-4 px-4 font-medium">{deposit.user}</td>
                    <td className="py-4 px-4 text-success">{deposit.amount}</td>
                    <td className="py-4 px-4 text-primary">{deposit.plan}</td>
                    <td className="py-4 px-4 text-muted-foreground">{deposit.date}</td>
                    <td className="py-4 px-4">
                      <span className={`status-badge ${
                        deposit.status === "Confirmed" ? "status-active" : "status-pending"
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
    </AdminLayout>
  );
};

export default AdminDashboard;
