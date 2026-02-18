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
import { supabase } from "@/integrations/supabase/client";

const AdminUsers = () => {
  const { users, userDeposits, userWithdrawals, isLoading, updateUserStatus, refetch } = useAdminUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 🔥 NEW STATES
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editBalance, setEditBalance] = useState(0);
  const [editReferral, setEditReferral] = useState(0);

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (user.status || 'active').toLowerCase() === statusFilter;

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

  // 🔥 UPDATE USER FUNCTION
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        balance: editBalance,
        referral_bonus: editReferral,
      })
      .eq("user_id", selectedUser.user_id);

    if (error) {
      toast.error("Failed to update user");
    } else {
      toast.success("User updated successfully");
      setSelectedUser(null);
      refetch();
    }
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

        {/* Header */}
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>

        {/* Users Table */}
        <div className="dashboard-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Country</th>
                  <th>Joined</th>
                  <th>Total Deposits</th>
                  <th>Withdrawals</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <p>{user.full_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </td>

                    <td>{user.country || "N/A"}</td>

                    <td>
                      {user.created_at
                        ? format(new Date(user.created_at), "yyyy-MM-dd")
                        : "N/A"}
                    </td>

                    <td>${(userDeposits[user.user_id] || 0).toLocaleString()}</td>
                    <td>${(userWithdrawals[user.user_id] || 0).toLocaleString()}</td>

                    <td>{user.status || "active"}</td>

                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          {/* 🔥 UPDATED VIEW DETAILS */}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setEditBalance(user.balance || 0);
                              setEditReferral(user.referral_bonus || 0);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View / Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => handleSendEmail(user.email)}>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user.user_id, "suspended")}
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
        </div>

        {/* 🔥 EDIT MODAL */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg w-full max-w-md space-y-4">

              <h2 className="text-xl font-bold">Edit User</h2>

              <div>
                <label className="text-sm">Full Name</label>
                <Input value={selectedUser.full_name || ""} disabled />
              </div>

              <div>
                <label className="text-sm">Email</label>
                <Input value={selectedUser.email} disabled />
              </div>

              <div>
                <label className="text-sm">Balance</label>
                <Input
                  type="number"
                  value={editBalance}
                  onChange={(e) => setEditBalance(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="text-sm">Referral Bonus</label>
                <Input
                  type="number"
                  value={editReferral}
                  onChange={(e) => setEditReferral(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser}>
                  Save Changes
                </Button>
              </div>

            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
