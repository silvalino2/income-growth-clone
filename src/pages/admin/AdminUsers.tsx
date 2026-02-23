import AdminLayout from "@/components/admin/AdminLayout"; import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input"; import { MoreVertical, Eye, Ban, Mail, } from "lucide-react"; import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"; import { toast } from "sonner"; import { useMemo, useState } from "react"; import { useAdminUsers } from "@/hooks/useAdminData"; import { format } from "date-fns"; import { supabase } from "@/integrations/supabase/client";

interface AdminUser { id: string; user_id: string; full_name?: string; email: string; country?: string; created_at?: string; balance?: number; referral_bonus?: number; profit_percentage?: number; status?: string; }

const AdminUsers = () => { const { users, userDeposits, userWithdrawals, isLoading, updateUserStatus, refetch, } = useAdminUsers();

const [searchQuery, setSearchQuery] = useState<string>(""); const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null); const [profitPercentage, setProfitPercentage] = useState<number>(0); const [referralBonus, setReferralBonus] = useState<number>(0); const [isUpdating, setIsUpdating] = useState<boolean>(false);

const filteredUsers = useMemo(() => { return users.filter((user: AdminUser) => { const nameMatch = (user.full_name || "") .toLowerCase() .includes(searchQuery.toLowerCase());

const emailMatch = user.email
    .toLowerCase()
    .includes(searchQuery.toLowerCase());

  return nameMatch || emailMatch;
});

}, [users, searchQuery]);

const handleOpenEditModal = (user: AdminUser) => { setSelectedUser(user); setProfitPercentage(user.profit_percentage ?? 0); setReferralBonus(user.referral_bonus ?? 0); };

const handleCloseModal = () => { setSelectedUser(null); setProfitPercentage(0); setReferralBonus(0); };

const handleStatusChange = async ( userId: string, newStatus: string ) => { const result = await updateUserStatus(userId, newStatus);

if (result.success) {
  toast.success(`User status updated to ${newStatus}`);
  refetch();
} else {
  toast.error("Failed to update user status");
}

};

const handleSendEmail = (email: string) => { toast.success(Email dialog opened for ${email}); };

/**

FIXED & SAFE BALANCE UPDATE

Uses TOTAL DEPOSITS as principal


Supports both positive and negative percentage


Prevents balance inflation/stacking bugs */ const handleUpdateUser = async () => { if (!selectedUser) return;



try {
  setIsUpdating(true);

  // Principal = Total confirmed deposits
  const principal = userDeposits[selectedUser.user_id] || 0;

  // Deterministic financial formula
  const calculatedBalance =
    principal * (1 + profitPercentage / 100);

  const { error } = await supabase
    .from("profiles")
    .update({
      balance: Number(calculatedBalance.toFixed(2)),
      profit_percentage: profitPercentage,
      referral_bonus: referralBonus,
    })
    .eq("user_id", selectedUser.user_id);

  if (error) {
    console.error("Update error:", error);
    toast.error("Failed to update user balance");
    return;
  }

  toast.success("User balance updated successfully");
  handleCloseModal();
  refetch();
} catch (err) {
  console.error(err);
  toast.error("Unexpected error occurred");
} finally {
  setIsUpdating(false);
}

};

if (isLoading) { return ( <AdminLayout> <div className="flex items-center justify-center h-64"> <div className="text-center"> <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" /> <p className="text-muted-foreground">Loading users...</p> </div> </div> </AdminLayout> ); }

return ( <AdminLayout> <div className="space-y-8"> {/* Header */} <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"> <h1 className="text-3xl font-bold">User Management</h1>

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
            <tr className="text-left border-b">
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
            {filteredUsers.map((user: AdminUser) => {
              const totalDeposits =
                userDeposits[user.user_id] || 0;
              const totalWithdrawals =
                userWithdrawals[user.user_id] || 0;

              return (
                <tr key={user.id} className="border-b">
                  <td className="p-3">
                    <p className="font-semibold">
                      {user.full_name || "Unknown"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </td>

                  <td className="p-3">
                    {user.country || "N/A"}
                  </td>

                  <td className="p-3">
                    {user.created_at
                      ? format(
                          new Date(user.created_at),
                          "yyyy-MM-dd"
                        )
                      : "N/A"}
                  </td>

                  <td className="p-3 font-semibold text-green-600">
                    ${totalDeposits.toLocaleString()}
                  </td>

                  <td className="p-3 text-red-500">
                    ${totalWithdrawals.toLocaleString()}
                  </td>

                  <td className="p-3 font-bold text-primary">
                    ${(user.balance || 0).toLocaleString()}
                  </td>

                  <td className="p-3 capitalize">
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
                          onClick={() => handleOpenEditModal(user)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Adjust Profit %
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
                          Suspend User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

    {/* Edit Modal */}
    {selectedUser && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card p-6 rounded-lg w-full max-w-md space-y-5 shadow-xl">
          <h2 className="text-xl font-bold">
            Adjust User Profit
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-sm">Full Name</label>
              <Input
                value={selectedUser.full_name || ""}
                disabled
              />
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
                Balance is calculated from total deposits. Supports
                increase and decrease safely.
              </p>
            </div>

            <div>
              <label className="text-sm">Referral Bonus</label>
              <Input
                type="number"
                value={referralBonus}
                onChange={(e) =>
                  setReferralBonus(Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={handleCloseModal}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    )}
  </div>
</AdminLayout>

); };

export default AdminUsers;
