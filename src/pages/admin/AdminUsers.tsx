import AdminLayout from "@/components/admin/AdminLayout"; import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input"; import { MoreVertical, Eye, Ban, Mail } from "lucide-react"; import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"; import { toast } from "sonner"; import { useState } from "react"; import { useAdminUsers } from "@/hooks/useAdminData"; import { format } from "date-fns"; import { supabase } from "@/integrations/supabase/client";

const AdminUsers = () => { const { users, userDeposits, userWithdrawals, isLoading, updateUserStatus, refetch, } = useAdminUsers();

const [searchQuery, setSearchQuery] = useState(""); const [selectedUser, setSelectedUser] = useState<any>(null);

// IMPORTANT: This is now percentage, NOT raw balance const [profitPercentage, setProfitPercentage] = useState<number>(0); const [editReferral, setEditReferral] = useState<number>(0);

const filteredUsers = users.filter((user) => { const matchesSearch = (user.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());

return matchesSearch;

});

const handleStatusChange = async (userId: string, newStatus: string) => { const result = await updateUserStatus(userId, newStatus); if (result.success) { toast.success(User status updated to ${newStatus}); refetch(); } else { toast.error("Failed to update user status"); } };

const handleSendEmail = (email: string) => { toast.success(Email dialog opened for ${email}); };

/**

FIXED BALANCE LOGIC (CRITICAL)

Never mutates existing balance


Always calculates from principal (total deposits)


Supports both + and - percentage safely */ const handleUpdateUser = async () => { if (!selectedUser) return;



try {
  const principal = userDeposits[selectedUser.user_id] || 0;

  // Deterministic calculation
  const newBalance = principal * (1 + profitPercentage / 100);

  const { error } = await supabase
    .from("profiles")
    .update({
      balance: newBalance,
      profit_percentage: profitPercentage,
      referral_bonus: editReferral,
    })
    .eq("user_id", selectedUser.user_id);

  if (error) {
    toast.error("Failed to update user balance");
    return;
  }

  toast.success("User balance updated correctly");
  setSelectedUser(null);
  refetch();
} catch (err) {
  toast.error("Unexpected error updating user");
}

};

if (isLoading) { return ( <AdminLayout> <div className="flex items-center justify-center h-64"> <div className="text-center"> <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" /> <p className="text-muted-foreground">Loading users...</p> </div> </div> </AdminLayout> ); }

return ( <AdminLayout> <div className="space-y-8"> {/* Header */} <div className="flex justify-between items-center"> <h1 className="text-3xl font-bold">User Management</h1>

<Input
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />
    </div>

    {/* Users Table */}
    <div className="dashboard-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="p-3">User</th>
              <th className="p-3">Country</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Total Deposits</th>
              <th className="p-3">Withdrawals</th>
              <th className="p-3">Current Balance</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3">
                  <p className="font-medium">
                    {user.full_name || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </td>

                <td className="p-3">{user.country || "N/A"}</td>

                <td className="p-3">
                  {user.created_at
                    ? format(new Date(user.created_at), "yyyy-MM-dd")
                    : "N/A"}
                </td>

                <td className="p-3 font-semibold text-green-600">
                  ${(
                    userDeposits[user.user_id] || 0
                  ).toLocaleString()}
                </td>

                <td className="p-3">
                  ${(
                    userWithdrawals[user.user_id] || 0
                  ).toLocaleString()}
                </td>

                <td className="p-3 font-bold text-primary">
                  ${(user.balance || 0).toLocaleString()}
                </td>

                <td className="p-3">
                  {user.status || "active"}
                </td>

                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user);
                          setProfitPercentage(
                            user.profit_percentage || 0
                          );
                          setEditReferral(user.referral_bonus || 0);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Adjust Profit %
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handleSendEmail(user.email)}
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

    {/* EDIT MODAL */}
    {selectedUser && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card p-6 rounded-lg w-full max-w-md space-y-4">
          <h2 className="text-xl font-bold">Adjust User Profit</h2>

          <div>
            <label className="text-sm">Full Name</label>
            <Input value={selectedUser.full_name || ""} disabled />
          </div>

          <div>
            <label className="text-sm">Email</label>
            <Input value={selectedUser.email} disabled />
          </div>

          <div>
            <label className="text-sm font-semibold">
              Profit Percentage (%)
            </label>
            <Input
              type="number"
              value={profitPercentage}
              onChange={(e) =>
                setProfitPercentage(Number(e.target.value))
              }
              placeholder="e.g. 10 or -10"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Uses total deposits as base. Supports increase and decrease.
            </p>
          </div>

          <div>
            <label className="text-sm">Referral Bonus</label>
            <Input
              type="number"
              value={editReferral}
              onChange={(e) =>
                setEditReferral(Number(e.target.value))
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setSelectedUser(null)}
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

); };

export default AdminUsers;
