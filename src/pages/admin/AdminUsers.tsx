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
    refetch,
  } = useAdminUsers(isAllowed);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editReferral, setEditReferral] = useState<number>(0);

  // Filter logic (FIXED)
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch =
      (user.full_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (user.email?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      );

    const matchesStatus =
      statusFilter === "all" ||
      (user.status || "active").toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (
    userId: string,
    newStatus: string
  ) => {
    const result = await updateUserStatus(userId, newStatus);
    if (result.success) {
      toast.success(`User status updated to ${newStatus}`);
      refetch();
    } else {
      toast.error("Failed to update user status");
    }
  };

  const handleSendEmail = (email: string) => {
    toast.success(`Email dialog opened for ${email}`);
  };

  // ADMIN UPDATE USER (CLEAN & SAFE)
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    const balanceValue = Number(editBalance) || 0;
    const referralValue = Number(editReferral) || 0;

    const { error } = await supabase
      .from("profiles")
      .update({
        balance: balanceValue,
        referral_bonus: referralValue,
      })
      .eq("user_id", selectedUser.user_id);

    if (error) {
      console.error(error);
      toast.error("Failed to update user");
      return;
    }

    toast.success("User updated successfully");
    setSelectedUser(null);
    refetch(); // VERY IMPORTANT to refresh dashboard values
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
          <h1 className="text-3xl font-bold">
            User Management
          </h1>

          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="max-w-sm"
          />
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
                {filteredUsers.map((user: any) => (
                  <tr key={user.id}>
                    <td>
                      <p className="font-medium">
                        {user.full_name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </td>

                    <td>{user.country || "N/A"}</td>

                    <td>
                      {user.created_at
                        ? format(
                            new Date(user.created_at),
                            "yyyy-MM-dd"
                          )
                        : "N/A"}
                    </td>

                    <td>
                      $
                      {(
                        userDeposits[user.user_id] || 0
                      ).toLocaleString()}
                    </td>

                    <td>
                      $
                      {(
                        userWithdrawals[user.user_id] || 0
                      ).toLocaleString()}
                    </td>

                    <td>
                      <span className="capitalize">
                        {user.status || "active"}
                      </span>
                    </td>

                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setEditBalance(
                                user.balance || 0
                              );
                              setEditReferral(
                                user.referral_bonus || 0
                              );
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View / Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              handleSendEmail(user.email)
                            }
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(
                                user.user_id,
                                "suspended"
                              )
                            }
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

        {/* EDIT USER MODAL */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg w-full max-w-md space-y-4">
              <h2 className="text-xl font-bold">
                Edit User
              </h2>

              <div>
                <label className="text-sm">
                  Full Name
                </label>
                <Input
                  value={
                    selectedUser.full_name || ""
                  }
                  disabled
                />
              </div>

              <div>
                <label className="text-sm">
                  Email
                </label>
                <Input
                  value={selectedUser.email}
                  disabled
                />
              </div>

              <div>
                <label className="text-sm">
                  Balance
                </label>
                <Input
                  type="number"
                  value={editBalance}
                  onChange={(e) =>
                    setEditBalance(
                      Number(e.target.value)
                    )
                  }
                />
              </div>

              <div>
                <label className="text-sm">
                  Referral Bonus
                </label>
                <Input
                  type="number"
                  value={editReferral}
                  onChange={(e) =>
                    setEditReferral(
                      Number(e.target.value)
                    )
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setSelectedUser(null)
                  }
                >
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
