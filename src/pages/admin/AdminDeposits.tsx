import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, XCircle, Eye, MoreVertical, DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const initialDeposits = [
  { id: 1, user: "John Doe", email: "john@example.com", amount: "$2,500", plan: "SILVER", method: "Bitcoin", txHash: "bc1q...7x8k", date: "2024-01-20 14:32", status: "Pending" },
  { id: 2, user: "Sarah Wilson", email: "sarah@example.com", amount: "$5,000", plan: "GOLD", method: "Ethereum", txHash: "0x1a2...3b4c", date: "2024-01-20 12:15", status: "Confirmed" },
  { id: 3, user: "Emily Davis", email: "emily@example.com", amount: "$750", plan: "BASIC", method: "USDT", txHash: "TXk...vJT", date: "2024-01-19 18:45", status: "Confirmed" },
  { id: 4, user: "Alex Turner", email: "alex@example.com", amount: "$100", plan: "STARTER", method: "Bitcoin", txHash: "bc1q...9y0z", date: "2024-01-19 09:20", status: "Pending" },
  { id: 5, user: "Lisa Chen", email: "lisa@example.com", amount: "$4,500", plan: "SILVER", method: "Ethereum", txHash: "0x5d6...7e8f", date: "2024-01-18 16:55", status: "Confirmed" },
  { id: 6, user: "James Smith", email: "james@example.com", amount: "$15,000", plan: "GOLD", method: "Bitcoin", txHash: "bc1q...1a2b", date: "2024-01-18 11:30", status: "Rejected" },
  { id: 7, user: "Anna Miller", email: "anna@example.com", amount: "$3,200", plan: "BASIC", method: "USDT", txHash: "TXk...wKL", date: "2024-01-17 20:10", status: "Confirmed" },
];

const AdminDeposits = () => {
  const [deposits, setDeposits] = useState(initialDeposits);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = deposit.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deposit.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || deposit.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (depositId: number, newStatus: string) => {
    setDeposits(deposits.map(deposit => 
      deposit.id === depositId ? { ...deposit, status: newStatus } : deposit
    ));
    toast.success(`Deposit ${newStatus.toLowerCase()}`);
  };

  const totalPending = deposits.filter(d => d.status === "Pending").length;
  const totalConfirmed = deposits.filter(d => d.status === "Confirmed")
    .reduce((sum, d) => sum + parseFloat(d.amount.replace(/[$,]/g, "")), 0);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Deposit Management</h1>
          <p className="text-muted-foreground">Review and manage user deposit requests.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="dashboard-card text-center">
            <p className="text-2xl font-heading font-bold">{deposits.length}</p>
            <p className="text-muted-foreground text-sm">Total Deposits</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-heading font-bold text-warning">{totalPending}</p>
            <p className="text-muted-foreground text-sm">Pending Review</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-heading font-bold text-success">${totalConfirmed.toLocaleString()}</p>
            <p className="text-muted-foreground text-sm">Confirmed Total</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-heading font-bold text-primary">
              {deposits.filter(d => d.status === "Confirmed").length}
            </p>
            <p className="text-muted-foreground text-sm">Confirmed Count</p>
          </div>
        </div>

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
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Deposits Table */}
        <div className="dashboard-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left py-3 px-4 rounded-l-lg">User</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Plan</th>
                  <th className="text-left py-3 px-4">Method</th>
                  <th className="text-left py-3 px-4">TX Hash</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4 rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeposits.map((deposit) => (
                  <tr key={deposit.id} className="table-row">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{deposit.user}</p>
                        <p className="text-sm text-muted-foreground">{deposit.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-success font-semibold">{deposit.amount}</td>
                    <td className="py-4 px-4 text-primary">{deposit.plan}</td>
                    <td className="py-4 px-4">{deposit.method}</td>
                    <td className="py-4 px-4">
                      <code className="text-xs bg-secondary px-2 py-1 rounded">{deposit.txHash}</code>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-sm">{deposit.date}</td>
                    <td className="py-4 px-4">
                      <span className={`status-badge ${
                        deposit.status === "Confirmed" ? "status-active" :
                        deposit.status === "Pending" ? "status-pending" :
                        "status-inactive"
                      }`}>
                        {deposit.status}
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
                          <DropdownMenuItem onClick={() => toast.info("View transaction details")}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {deposit.status === "Pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(deposit.id, "Confirmed")}>
                                <CheckCircle className="w-4 h-4 mr-2 text-success" />
                                Confirm Deposit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(deposit.id, "Rejected")}>
                                <XCircle className="w-4 h-4 mr-2 text-destructive" />
                                Reject Deposit
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => toast.info("Add bonus to user")}>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Add Bonus
                          </DropdownMenuItem>
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

export default AdminDeposits;
