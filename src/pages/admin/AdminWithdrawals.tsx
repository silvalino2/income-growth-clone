import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { useAdminWithdrawals } from "@/hooks/useAdminData";
import { format } from "date-fns";

const AdminWithdrawals = () => {
  const { user, isAdmin, authReady } = useAuth();
  const isAllowed = authReady && user && isAdmin === true;

  const { withdrawals, isLoading, updateWithdrawalStatus } = useAdminWithdrawals(isAllowed);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = (withdrawal.user_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (withdrawal.user_email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || (withdrawal.status || 'pending').toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (withdrawalId: string, newStatus: string) => {
    const result = await updateWithdrawalStatus(withdrawalId, newStatus);
    if (result.success) {
      toast.success(`Withdrawal ${newStatus.toLowerCase()}`);
    } else {
      toast.error("Failed to update withdrawal status");
    }
  };

  const pendingTotal = withdrawals
    .filter(w => w.status === "pending")
    .reduce((sum, w) => sum + Number(w.amount), 0);

  const completedTotal = withdrawals
    .filter(w => w.status === "approved")
    .reduce((sum, w) => sum + Number(w.amount), 0);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading withdrawals...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

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
              {withdrawals.filter(w => w.status === "pending").length}
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
        {withdrawals.filter(w => w.status === "pending").length > 0 && (
          <div className="bg-warning/10 border border-warning/30 p-4 rounded-lg flex gap-4">
            <AlertCircle className="w-6 h-6 text-warning flex-shrink-0" />
            <div>
              <p className="font-medium text-warning mb-1">
                {withdrawals.filter(w => w.status === "pending").length} pending withdrawal(s) require attention
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
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Withdrawals Table */}
        <div className="dashboard-card">
          <div className="overflow-x-auto">
            {filteredWithdrawals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No withdrawals found</p>
            ) : (
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
                          <p className="font-medium">{withdrawal.user_name}</p>
                          <p className="text-sm text-muted-foreground">{withdrawal.user_email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-warning font-semibold">${Number(withdrawal.amount).toLocaleString()}</td>
                      <td className="py-4 px-4">{withdrawal.payment_method}</td>
                      <td className="py-4 px-4">
                        <code className="text-xs bg-secondary px-2 py-1 rounded break-all max-w-[150px] block truncate">
                          {withdrawal.wallet_address}
                        </code>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-sm">
                        {withdrawal.created_at ? format(new Date(withdrawal.created_at), 'yyyy-MM-dd HH:mm') : 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`status-badge ${
                          withdrawal.status === "approved" ? "status-active" :
                          withdrawal.status === "pending" ? "status-pending" :
                          "status-inactive"
                        }`}>
                          {withdrawal.status || 'pending'}
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
                              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                navigator.clipboard.writeText(withdrawal.wallet_address);
                              }
                              toast.success("Address copied!");
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              Copy Address
                            </DropdownMenuItem>
                            {withdrawal.status === "pending" && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(withdrawal.id, "approved")}>
                                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                                  Mark as Paid
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(withdrawal.id, "rejected")}>
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
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminWithdrawals;
