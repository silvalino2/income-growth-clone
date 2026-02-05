import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Lock, Bell, Shield, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [notifications, setNotifications] = useState({
    email: true,
    deposit: true,
    withdrawal: true,
    referral: false,
    news: false
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    toast.success("Password updated successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  const handleNotificationSave = () => {
    toast.success("Notification preferences saved!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Change Password */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-heading font-semibold">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    className="input-dark pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="input-dark"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  className="input-dark"
                  required
                />
              </div>
              <Button type="submit" className="btn-hero">
                Update Password
              </Button>
            </form>
          </div>

          {/* Notification Settings */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-info" />
              </div>
              <h2 className="text-xl font-heading font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email updates</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Deposit Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when deposits are confirmed</p>
                </div>
                <Switch
                  checked={notifications.deposit}
                  onCheckedChange={(checked) => setNotifications({...notifications, deposit: checked})}
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Withdrawal Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when withdrawals are processed</p>
                </div>
                <Switch
                  checked={notifications.withdrawal}
                  onCheckedChange={(checked) => setNotifications({...notifications, withdrawal: checked})}
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Referral Notifications</p>
                  <p className="text-sm text-muted-foreground">Get notified when referrals sign up</p>
                </div>
                <Switch
                  checked={notifications.referral}
                  onCheckedChange={(checked) => setNotifications({...notifications, referral: checked})}
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Newsletter</p>
                  <p className="text-sm text-muted-foreground">Receive news and updates</p>
                </div>
                <Switch
                  checked={notifications.news}
                  onCheckedChange={(checked) => setNotifications({...notifications, news: checked})}
                />
              </div>
              <Button onClick={handleNotificationSave} className="btn-hero w-full">
                Save Preferences
              </Button>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="dashboard-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-warning" />
            </div>
            <h2 className="text-xl font-heading font-semibold">Security</h2>
          </div>

          <div className="bg-warning/10 border border-warning/30 p-4 rounded-lg flex gap-4">
            <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
            <div>
              <p className="font-medium text-warning mb-1">Enable Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground mb-3">
                Add an extra layer of security to your account by enabling 2FA. 
                This feature will be available soon.
              </p>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
