import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreVertical,
  Eye,
  Ban,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminUsers } from "@/hooks/useAdminData";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const AdminUsers = () => {
  const { user, isAdmin, authReady } = useAuth();
  const isAllowed = authReady && user && isAdmin === true;

  const {
    users,
    userDeposits,
    userWithdrawals,
    isLoading,
    updateUserStatus,
    setUserBalance,
    refetch,
  } = useAdminUsers(isAllowed);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editBalance, setEditBalance] = useState<number>(0);

  // Filter users
  const filteredUsers = users.filter((u: any) => {
    const matchesSearch =
      (u.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (u.status || "active").toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Update status
  const handleStatusChange = async (userId: string, newStatus: string) => {
    const result = await updateUserStatus(userId, newStatus);
    if (result.success) {
      toast.success(`User status updated to ${newStatus}`);
      refetch();
    } else {
      toast.error("Failed to update user status");
    }
  };

  // Send email (mock)
  const handleSendEmail = (email: string) => {
    toast.success(`Email dialog opened for ${email}`);
  };

  // Update balance
  const handleUpdateBalance = async () => {
    if (!selectedUser) return;
    const value = Number(editBalance) || 0;
    const result = await setUserBalance(selectedUser.user_id, value);
    if (result.success) {
      toast.success("User balance updated successfully");
      setSelectedUser(null);
      refetch();
    } else {
      toast.error("Failed to update balance");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading users...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Users Table */}
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Joined</th>
                <th>Total Deposits</th>
                <th>Withdrawals</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u: any) => (
                <tr key={u.user_id}>
                  <td>
                    <p className="font-medium">{u.name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </td>

                  <td>
                    {u.created_at
                      ? format(new Date(u.created_at), "yyyy-MM-dd")
                      : "N/A"}
                  </td>

                  <td>${(userDeposits[u.user_id] || 0).toLocaleString()}</td>
                  <td>${(userWithdrawals[u.user_id] || 0).toLocaleString()}</td>
                  <td>${u.balance?.toLocaleString() || 0}</td>

                  <td className="capitalize">{u.status || "active"}</td>

                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(u);
                            setEditBalance(u.balance || 0);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View / Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleSendEmail(u.email)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleStatusChange(u.user_id, "suspended")}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Balance Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg w-full max-w-md space-y-4">
              <h2 className="text-xl font-bold">Edit User Balance</h2>

              <div>
                <label className="text-sm">Full Name</label>
                <Input value={selectedUser.name || ""} disabled />
              </div>

              <div>
                <label className="text-sm">Email</label>
                <Input value={selectedUser.email || ""} disabled />
              </div>

              <div>
                <label className="text-sm">Balance</label>
                <Input
                  type="number"
                  value={editBalance}
                  onChange={(e) => setEditBalance(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateBalance}>Save Changes</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
