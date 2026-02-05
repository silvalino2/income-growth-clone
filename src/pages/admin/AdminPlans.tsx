import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Plan {
  id: number;
  name: string;
  roi: string;
  period: string;
  minDeposit: number;
  maxDeposit: number | null;
  isActive: boolean;
}

const initialPlans: Plan[] = [
  { id: 1, name: "STARTER", roi: "15%", period: "Every 24hrs", minDeposit: 50, maxDeposit: 499, isActive: true },
  { id: 2, name: "BASIC", roi: "30%", period: "Every 48hrs", minDeposit: 500, maxDeposit: 3999, isActive: true },
  { id: 3, name: "SILVER", roi: "50%", period: "Every 72hrs", minDeposit: 4000, maxDeposit: 9999, isActive: true },
  { id: 4, name: "GOLD", roi: "80%", period: "Every 92hrs", minDeposit: 10000, maxDeposit: 20000, isActive: true },
  { id: 5, name: "REAL ESTATE", roi: "100%", period: "Every 5 days", minDeposit: 21000, maxDeposit: null, isActive: true },
];

const AdminPlans = () => {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedPlan, setEditedPlan] = useState<Plan | null>(null);

  const handleEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setEditedPlan({ ...plan });
  };

  const handleSave = () => {
    if (editedPlan) {
      setPlans(plans.map(p => p.id === editedPlan.id ? editedPlan : p));
      toast.success("Plan updated successfully");
      setEditingId(null);
      setEditedPlan(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedPlan(null);
  };

  const handleToggleActive = (id: number) => {
    setPlans(plans.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    toast.success("Plan status updated");
  };

  const handleDelete = (id: number) => {
    setPlans(plans.filter(p => p.id !== id));
    toast.success("Plan deleted");
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">Investment Plans</h1>
            <p className="text-muted-foreground">Manage investment plans and their ROI settings.</p>
          </div>
          <Button className="btn-hero">
            <Plus className="w-4 h-4 mr-2" />
            Add Plan
          </Button>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`dashboard-card ${!plan.isActive ? "opacity-60" : ""} ${
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
                      <label className="text-sm font-medium mb-1 block">ROI</label>
                      <Input
                        value={editedPlan.roi}
                        onChange={(e) => setEditedPlan({ ...editedPlan, roi: e.target.value })}
                        className="input-dark"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Period</label>
                      <Input
                        value={editedPlan.period}
                        onChange={(e) => setEditedPlan({ ...editedPlan, period: e.target.value })}
                        className="input-dark"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Min Deposit</label>
                      <Input
                        type="number"
                        value={editedPlan.minDeposit}
                        onChange={(e) => setEditedPlan({ ...editedPlan, minDeposit: parseInt(e.target.value) })}
                        className="input-dark"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Max Deposit</label>
                      <Input
                        type="number"
                        value={editedPlan.maxDeposit || ""}
                        onChange={(e) => setEditedPlan({ ...editedPlan, maxDeposit: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Unlimited"
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
                    <span className={`status-badge ${plan.isActive ? "status-active" : "status-inactive"}`}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  <div className="text-center py-4 border-y border-border mb-4">
                    <p className="text-5xl font-heading font-bold text-primary mb-1">{plan.roi}</p>
                    <p className="text-muted-foreground text-sm">{plan.period}</p>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Deposit:</span>
                      <span className="font-medium">${plan.minDeposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Deposit:</span>
                      <span className="font-medium">
                        {plan.maxDeposit ? `$${plan.maxDeposit.toLocaleString()}` : "Unlimited"}
                      </span>
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
                      onClick={() => handleToggleActive(plan.id)} 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                    >
                      {plan.isActive ? "Disable" : "Enable"}
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
      </div>
    </AdminLayout>
  );
};

export default AdminPlans;
