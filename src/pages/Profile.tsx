import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, Shield, Camera } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    country: "United States",
    address: "123 Investment St, New York, NY 10001",
    joinDate: "January 10, 2024"
  });

  const handleSave = () => {
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

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
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="dashboard-card text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <User className="w-16 h-16 text-primary" />
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary-foreground" />
                </button>
              )}
            </div>
            <h2 className="text-2xl font-heading font-bold mb-1">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-muted-foreground mb-4">{profile.email}</p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-primary">Verified Investor</span>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-muted-foreground text-sm">Member since</p>
              <p className="font-medium">{profile.joinDate}</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2 dashboard-card">
            <h3 className="text-xl font-heading font-semibold mb-6">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <Input
                  value={profile.firstName}
                  onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                  disabled={!isEditing}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <Input
                  value={profile.lastName}
                  onChange={(e) => setProfile({...profile, lastName: e.target.value})}
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
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    disabled={!isEditing}
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
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    disabled={!isEditing}
                    className="input-dark pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <Input
                  value={profile.country}
                  onChange={(e) => setProfile({...profile, country: e.target.value})}
                  disabled={!isEditing}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    disabled={!isEditing}
                    className="input-dark pl-10"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="btn-hero">
                  Save Changes
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
