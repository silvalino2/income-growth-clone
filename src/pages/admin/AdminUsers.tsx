import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MoreVertical, 
  Eye, 
  Ban, 
  CheckCircle, 
  Trash2,
  Mail,
  UserPlus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";
import { useAdminUsers } from "@/hooks/useAdminData";
import { format } from "date-fns";

const AdminUsers = () => {
  const { users, userDeposits, userWithdrawals, isLoading, updateUserStatus, refetch } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || (user.status || 'active').toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const result = await updateUserStatus(userId, newStatus);
    if (result.success) {
      toast.success(`User status updated to ${newStatus}`);
    } else {
      toast.error("Failed to update user status");
    }
  };

  const handleSendEmail = (email: string) => {
    toast.success(`Email dialog opened for ${email}`);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage all registered users on the platform.</p>
          </div>
          <Button className="btn-hero">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search users..."
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
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="dashboard-card text-center">
            <p className="text-2xl font-heading font-bold">{users.length}</p>
            <p className="text-muted-foreground text-sm">Total Users</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-heading font-bold text-primary">
              {users.filter(u => (u.status || 'active') === "active").length}
            </p>
            <p className="text-muted-foreground text-sm">Active</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-heading font-bold text-warning">
              {users.filter(u => u.status === "pending").length}
            </p>
            <p className="text-muted-foreground text-sm">Pending</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-heading font-bold text-destructive">
              {users.filter(u => u.status === "suspended").length}
            </p>
            <p className="text-muted-foreground text-sm">Suspended</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="dashboard-card">
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users found</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="text-left py-3 px-4 rounded-l-lg">User</th>
                    <th className="text-left py-3 px-4">Country</th>
                    <th className="text-left py-3 px-4">Joined</th>
                    <th className="text-left py-3 px-4">Total Deposits</th>
                    <th className="text-left py-3 px-4">Withdrawals</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4 rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="table-row">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{user.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{user.country || 'N/A'}</td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {user.created_at ? format(new Date(user.created_at), 'yyyy-MM-dd') : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-success">
                        ${(userDeposits[user.user_id] || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-warning">
                        ${(userWithdrawals[user.user_id] || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`status-badge ${
                          (user.status || 'active') === "active" ? "status-active" :
                          user.status === "pending" ? "status-pending" :
                          "status-inactive"
                        }`}>
                          {user.status || 'active'}
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
                            <DropdownMenuItem onClick={() => toast.info("View user details")}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendEmail(user.email)}>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            {(user.status || 'active') !== "active" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(user.user_id, "active")}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {user.status !== "suspended" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(user.user_id, "suspended")}>
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => toast.info("Delete user")}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
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

export default AdminUsers;
