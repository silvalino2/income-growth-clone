import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, XCircle, Eye, MoreVertical, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const initialWithdrawals = [
  { id: 1, user: "John Doe", email: "john@example.com", amount: "$1,500", method: "Bitcoin", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", date: "2024-01-20 16:45", status: "Pending" },
  { id: 2, user: "Sarah Wilson", email: "sarah@example.com", amount: "$3,000", method: "Ethereum", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", date: "2024-01-20 10:20", status: "Pending" },
  { id: 3, user: "Emily Davis", email: "emily@example.com", amount: "$500", method: "USDT", address: "TXkVbVBRvF5ZGH6hKMH3snZvZJUq8cNvJT", date: "2024-01-19 14:30", status: "Completed" },
  { id: 4, user: "Lisa Chen", email: "lisa@example.com", amount: "$2,100", method: "Bitcoin", address: "bc1q...9y0z", date: "2024-01-19 08:15", status: "Completed" },
  { id: 5, user: "James Smith", email: "james@example.com", amount: "$5,000", method: "Ethereum", address: "0x5d6...7e8f", date: "2024-01-18 22:00", status: "Rejected" },
  { id: 6, user: "Anna Miller", email: "anna@example.com", amount: "$1,200", method: "USDT", address: "TXk...wKL", date: "2024-01-17 17:40", status: "Completed" },
];

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = withdrawal.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         withdrawal.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || withdrawal.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (withdrawalId: number, newStatus: string) => {
    setWithdrawals(withdrawals.map(withdrawal => 
      withdrawal.id === withdrawalId ? { ...withdrawal, status: newStatus } : withdrawal
    ));
    toast.success(`Withdrawal ${newStatus.toLowerCase()}`);
  };

  const pendingTotal = withdrawals
    .filter(w => w.status === "Pending")
    .reduce((sum, w) => sum + parseFloat(w.amount.replace(/[$,]/g, "")), 0);

  const completedTotal = withdrawals
    .filter(w => w.status === "Completed")
    .reduce((sum, w) => sum + parseFloat(w.amount.replace(/[$,]/g, "")), 0);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Withdrawal Management</h1>
          <p className="text-muted-foreground">Process and manage user withdrawal requests.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="dashboard-card text-center">
            <p className="text-2xl font-heading font-bold">{withdrawals.length}</p>
            <p className="text-muted-foreground text-sm">Total Requests</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-heading font-bold text-warning">
              {withdrawals.filter(w => w.status === "Pending").length}
            </p>
            <p className="text-muted-foreground text-sm">Pending</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-heading font-bold text-warning">${pendingTotal.toLocaleString()}</p>
            <p className="text-muted-foreground text-sm">Pending Amount</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-heading font-bold text-success">${completedTotal.toLocaleString()}</p>
            <p className="text-muted-foreground text-sm">Paid Out</p>
          </div>
        </div>

        {/* Alert for Pending */}
        {withdrawals.filter(w => w.status === "Pending").length > 0 && (
          <div className="bg-warning/10 border border-warning/30 p-4 rounded-lg flex gap-4">
            <AlertCircle className="w-6 h-6 text-warning flex-shrink-0" />
            <div>
              <p className="font-medium text-warning mb-1">
                {withdrawals.filter(w => w.status === "Pending").length} pending withdrawal(s) require attention
              </p>
              <p className="text-sm text-muted-foreground">
                Total pending amount: ${pendingTotal.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by user or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-dark pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-dark px-4 py-2 rounded-md bg-input border border-border"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Withdrawals Table */}
        <div className="dashboard-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left py-3 px-4 rounded-l-lg">User</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Method</th>
                  <th className="text-left py-3 px-4">Wallet Address</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4 rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="table-row">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{withdrawal.user}</p>
                        <p className="text-sm text-muted-foreground">{withdrawal.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-warning font-semibold">{withdrawal.amount}</td>
                    <td className="py-4 px-4">{withdrawal.method}</td>
                    <td className="py-4 px-4">
                      <code className="text-xs bg-secondary px-2 py-1 rounded break-all max-w-[150px] block truncate">
                        {withdrawal.address}
                      </code>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-sm">{withdrawal.date}</td>
                    <td className="py-4 px-4">
                      <span className={`status-badge ${
                        withdrawal.status === "Completed" ? "status-active" :
                        withdrawal.status === "Pending" ? "status-pending" :
                        "status-inactive"
                      }`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(withdrawal.address);
                            toast.success("Address copied!");
                          }}>
                            <Eye className="w-4 h-4 mr-2" />
                            Copy Address
                          </DropdownMenuItem>
                          {withdrawal.status === "Pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(withdrawal.id, "Completed")}>
                                <CheckCircle className="w-4 h-4 mr-2 text-success" />
                                Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(withdrawal.id, "Rejected")}>
                                <XCircle className="w-4 h-4 mr-2 text-destructive" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default AdminWithdrawals;
