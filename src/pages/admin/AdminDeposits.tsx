import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { useAdminDeposits } from "@/hooks/useAdminData";
import { format } from "date-fns";

const AdminDeposits = () => {
  const { user, isAdmin, authReady } = useAuth();
  const isAllowed = authReady && user && isAdmin === true;

  const { deposits, isLoading, updateDepositStatus } = useAdminDeposits(isAllowed);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = (deposit.user_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (deposit.user_email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || (deposit.status || 'pending').toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (depositId: string, newStatus: string) => {
    const result = await updateDepositStatus(depositId, newStatus);
    if (result.success) {
      toast.success(`Deposit ${newStatus.toLowerCase()}`);
    } else {
      toast.error("Failed to update deposit status");
    }
  };

  const totalPending = deposits.filter(d => d.status === "pending").length;
  const totalConfirmed = deposits
    .filter(d => d.status === "confirmed")
    .reduce((sum, d) => sum + Number(d.amount), 0);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading deposits...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
              {deposits.filter(d => d.status === "confirmed").length}
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
            {filteredDeposits.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No deposits found</p>
            ) : (
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
                          <p className="font-medium">{deposit.user_name}</p>
                          <p className="text-sm text-muted-foreground">{deposit.user_email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-success font-semibold">${Number(deposit.amount).toLocaleString()}</td>
                      <td className="py-4 px-4 text-primary">{deposit.plan_name}</td>
                      <td className="py-4 px-4">{deposit.payment_method}</td>
                      <td className="py-4 px-4">
                        <code className="text-xs bg-secondary px-2 py-1 rounded">
                          {deposit.transaction_hash ? `${deposit.transaction_hash.slice(0, 8)}...` : 'N/A'}
                        </code>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-sm">
                        {deposit.created_at ? format(new Date(deposit.created_at), 'yyyy-MM-dd HH:mm') : 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`status-badge ${
                          deposit.status === "confirmed" ? "status-active" :
                          deposit.status === "pending" ? "status-pending" :
                          "status-inactive"
                        }`}>
                          {deposit.status || 'pending'}
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
                            {deposit.status === "pending" && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(deposit.id, "confirmed")}>
                                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                                  Confirm Deposit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(deposit.id, "rejected")}>
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
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDeposits;
