import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useAdminPlans } from "@/hooks/useAdminData";

const AdminPlans = () => {
  const { user, isAdmin, authReady } = useAuth();
  const isAllowed = authReady && user && isAdmin === true;

  const { plans, isLoading, updatePlan, deletePlan, createPlan } = useAdminPlans(isAllowed);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPlan, setEditedPlan] = useState<{
    name: string;
    roi_percentage: number;
    duration_days: number;
    min_amount: number;
    max_amount: number;
    is_active: boolean;
  } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    roi_percentage: 10,
    duration_days: 7,
    min_amount: 100,
    max_amount: 1000,
  });

  const handleEdit = (plan: typeof plans[0]) => {
    setEditingId(plan.id);
    setEditedPlan({
      name: plan.name,
      roi_percentage: plan.roi_percentage,
      duration_days: plan.duration_days,
      min_amount: plan.min_amount,
      max_amount: plan.max_amount,
      is_active: plan.is_active ?? true,
    });
  };

  const handleSave = async () => {
    if (editedPlan && editingId) {
      const result = await updatePlan(editingId, editedPlan);
      if (result.success) {
        toast.success("Plan updated successfully");
        setEditingId(null);
        setEditedPlan(null);
      } else {
        toast.error("Failed to update plan");
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedPlan(null);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean | null) => {
    const result = await updatePlan(id, { is_active: !currentStatus });
    if (result.success) {
      toast.success("Plan status updated");
    } else {
      toast.error("Failed to update plan status");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deletePlan(id);
    if (result.success) {
      toast.success("Plan deleted");
    } else {
      toast.error("Failed to delete plan");
    }
  };

  const handleAddPlan = async () => {
    const result = await createPlan({
      ...newPlan,
      is_active: true,
    });
    if (result.success) {
      toast.success("Plan created successfully");
      setShowAddForm(false);
      setNewPlan({
        name: '',
        roi_percentage: 10,
        duration_days: 7,
        min_amount: 100,
        max_amount: 1000,
      });
    } else {
      toast.error("Failed to create plan");
    }
  };

  const formatPeriod = (days: number) => {
    if (days === 1) return "Every 24hrs";
    if (days < 7) return `Every ${days * 24}hrs`;
    if (days === 7) return "Every week";
    return `Every ${days} days`;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading plans...</p>
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
            <h1 className="text-3xl font-heading font-bold mb-2">Investment Plans</h1>
            <p className="text-muted-foreground">Manage investment plans and their ROI settings.</p>
          </div>
          <Button className="btn-hero" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Plan
          </Button>
        </div>

        {/* Add Plan Form */}
        {showAddForm && (
          <div className="dashboard-card ring-2 ring-primary">
            <h3 className="font-heading font-bold text-lg mb-4">Add New Plan</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Plan Name</label>
                <Input
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  className="input-dark"
                  placeholder="e.g., DIAMOND"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ROI (%)</label>
                <Input
                  type="number"
                  value={newPlan.roi_percentage}
                  onChange={(e) => setNewPlan({ ...newPlan, roi_percentage: parseFloat(e.target.value) })}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Duration (days)</label>
                <Input
                  type="number"
                  value={newPlan.duration_days}
                  onChange={(e) => setNewPlan({ ...newPlan, duration_days: parseInt(e.target.value) })}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Min Amount ($)</label>
                <Input
                  type="number"
                  value={newPlan.min_amount}
                  onChange={(e) => setNewPlan({ ...newPlan, min_amount: parseFloat(e.target.value) })}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Max Amount ($)</label>
                <Input
                  type="number"
                  value={newPlan.max_amount}
                  onChange={(e) => setNewPlan({ ...newPlan, max_amount: parseFloat(e.target.value) })}
                  className="input-dark"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddPlan} className="bg-primary">
                <Save className="w-4 h-4 mr-1" /> Create Plan
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline">
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <div className="dashboard-card text-center py-12">
            <p className="text-muted-foreground">No investment plans yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`dashboard-card ${!plan.is_active ? "opacity-60" : ""} ${
                  editingId === plan.id ? "ring-2 ring-primary" : ""
                }`}
              >
                {editingId === plan.id && editedPlan ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Plan Name</label>
                      <Input
                        value={editedPlan.name}
                        onChange={(e) => setEditedPlan({ ...editedPlan, name: e.target.value })}
                        className="input-dark"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">ROI (%)</label>
                        <Input
                          type="number"
                          value={editedPlan.roi_percentage}
                          onChange={(e) => setEditedPlan({ ...editedPlan, roi_percentage: parseFloat(e.target.value) })}
                          className="input-dark"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Duration (days)</label>
                        <Input
                          type="number"
                          value={editedPlan.duration_days}
                          onChange={(e) => setEditedPlan({ ...editedPlan, duration_days: parseInt(e.target.value) })}
                          className="input-dark"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Min Deposit ($)</label>
                        <Input
                          type="number"
                          value={editedPlan.min_amount}
                          onChange={(e) => setEditedPlan({ ...editedPlan, min_amount: parseFloat(e.target.value) })}
                          className="input-dark"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Max Deposit ($)</label>
                        <Input
                          type="number"
                          value={editedPlan.max_amount}
                          onChange={(e) => setEditedPlan({ ...editedPlan, max_amount: parseFloat(e.target.value) })}
                          className="input-dark"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm" className="flex-1 bg-primary">
                        <Save className="w-4 h-4 mr-1" /> Save
                      </Button>
                      <Button onClick={handleCancel} size="sm" variant="outline" className="flex-1">
                        <X className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading font-bold text-xl text-primary">{plan.name}</h3>
                      <span className={`status-badge ${plan.is_active ? "status-active" : "status-inactive"}`}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    
                    <div className="text-center py-4 border-y border-border mb-4">
                      <p className="text-5xl font-heading font-bold text-primary mb-1">{plan.roi_percentage}%</p>
                      <p className="text-muted-foreground text-sm">{formatPeriod(plan.duration_days)}</p>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min Deposit:</span>
                        <span className="font-medium">${plan.min_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Deposit:</span>
                        <span className="font-medium">${plan.max_amount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleEdit(plan)} 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                      >
                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button 
                        onClick={() => handleToggleActive(plan.id, plan.is_active)} 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                      >
                        {plan.is_active ? "Disable" : "Enable"}
                      </Button>
                      <Button 
                        onClick={() => handleDelete(plan.id)} 
                        size="sm" 
                        variant="outline"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPlans;
