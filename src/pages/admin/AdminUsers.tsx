import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
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

const initialUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1 234 567 8900", country: "United States", joined: "2024-01-20", deposits: "$5,230", withdrawals: "$1,200", status: "Active" },
  { id: 2, name: "Sarah Wilson", email: "sarah@example.com", phone: "+44 789 012 3456", country: "United Kingdom", joined: "2024-01-19", deposits: "$12,450", withdrawals: "$3,500", status: "Active" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "+1 345 678 9012", country: "Canada", joined: "2024-01-18", deposits: "$0", withdrawals: "$0", status: "Pending" },
  { id: 4, name: "Emily Davis", email: "emily@example.com", phone: "+61 456 789 0123", country: "Australia", joined: "2024-01-17", deposits: "$3,800", withdrawals: "$800", status: "Active" },
  { id: 5, name: "Tom Brown", email: "tom@example.com", phone: "+49 567 890 1234", country: "Germany", joined: "2024-01-16", deposits: "$1,200", withdrawals: "$0", status: "Suspended" },
  { id: 6, name: "Lisa Chen", email: "lisa@example.com", phone: "+65 678 901 2345", country: "Singapore", joined: "2024-01-15", deposits: "$8,900", withdrawals: "$2,100", status: "Active" },
  { id: 7, name: "James Smith", email: "james@example.com", phone: "+1 789 012 3456", country: "United States", joined: "2024-01-14", deposits: "$25,000", withdrawals: "$5,000", status: "Active" },
  { id: 8, name: "Anna Miller", email: "anna@example.com", phone: "+33 890 123 4567", country: "France", joined: "2024-01-13", deposits: "$6,500", withdrawals: "$1,500", status: "Active" },
];

const AdminUsers = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (userId: number, newStatus: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    toast.success(`User status updated to ${newStatus}`);
  };

  const handleDelete = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
    toast.success("User deleted successfully");
  };

  const handleSendEmail = (email: string) => {
    toast.success(`Email dialog opened for ${email}`);
  };

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
              {users.filter(u => u.status === "Active").length}
            </p>
            <p className="text-muted-foreground text-sm">Active</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-heading font-bold text-warning">
              {users.filter(u => u.status === "Pending").length}
            </p>
            <p className="text-muted-foreground text-sm">Pending</p>
          </div>
          <div className="dashboard-card text-center">
            <p className="text-2xl font-heading font-bold text-destructive">
              {users.filter(u => u.status === "Suspended").length}
            </p>
            <p className="text-muted-foreground text-sm">Suspended</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="dashboard-card">
          <div className="overflow-x-auto">
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
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{user.country}</td>
                    <td className="py-4 px-4 text-muted-foreground">{user.joined}</td>
                    <td className="py-4 px-4 text-success">{user.deposits}</td>
                    <td className="py-4 px-4 text-warning">{user.withdrawals}</td>
                    <td className="py-4 px-4">
                      <span className={`status-badge ${
                        user.status === "Active" ? "status-active" :
                        user.status === "Pending" ? "status-pending" :
                        "status-inactive"
                      }`}>
                        {user.status}
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
                          {user.status !== "Active" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(user.id, "Active")}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          {user.status !== "Suspended" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(user.id, "Suspended")}>
                              <Ban className="w-4 h-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDelete(user.id)}
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
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
