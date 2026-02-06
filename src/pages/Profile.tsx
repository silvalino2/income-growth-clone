import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, Shield, Camera } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    country: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        country: profile.country || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('user_id', user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully!");
      await refreshProfile();
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const joinDate = profile?.created_at 
    ? format(new Date(profile.created_at), 'MMMM d, yyyy')
    : 'Unknown';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information.</p>
          </div>
          <Button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={isEditing ? "btn-hero" : ""}
            variant={isEditing ? "default" : "outline"}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="dashboard-card text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <User className="w-16 h-16 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-heading font-bold mb-1">{displayName}</h2>
            <p className="text-muted-foreground mb-4">{user?.email}</p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-primary">Verified Investor</span>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-muted-foreground text-sm">Member since</p>
              <p className="font-medium">{joinDate}</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2 dashboard-card">
            <h3 className="text-xl font-heading font-semibold mb-6">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  disabled={!isEditing}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="input-dark pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="input-dark pl-10"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">Country</label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  disabled={!isEditing}
                  className="input-dark"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="btn-hero" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
