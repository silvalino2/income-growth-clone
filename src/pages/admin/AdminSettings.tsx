import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, Globe, Mail, Bell, Shield, Wallet, Save } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: "INCOME-GROWTH.COM",
    siteEmail: "service@income-growth.com",
    supportPhone: "+19545738063",
    address: "288/290 Torquay Rd, Paignton Devon",
    minWithdrawal: 50,
    maxWithdrawal: 50000,
    referralCommission: 10,
    maintenanceMode: false,
    emailNotifications: true,
    autoApproveDeposits: false,
    twoFactorRequired: false,
  });

  const [wallets, setWallets] = useState({
    bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    ethereum: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    usdt: "TXkVbVBRvF5ZGH6hKMH3snZvZJUq8cNvJT",
  });

  const handleSaveGeneral = () => {
    toast.success("General settings saved successfully!");
  };

  const handleSaveWallets = () => {
    toast.success("Wallet addresses updated successfully!");
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Platform Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings and preferences.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-heading font-semibold">General Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Site Name</label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Support Email</label>
                <Input
                  type="email"
                  value={settings.siteEmail}
                  onChange={(e) => setSettings({...settings, siteEmail: e.target.value})}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Support Phone</label>
                <Input
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <Textarea
                  value={settings.address}
                  onChange={(e) => setSettings({...settings, address: e.target.value})}
                  className="input-dark"
                />
              </div>
              <Button onClick={handleSaveGeneral} className="btn-hero w-full">
                <Save className="w-4 h-4 mr-2" />
                Save General Settings
              </Button>
            </div>
          </div>

          {/* Wallet Settings */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-warning" />
              </div>
              <h2 className="text-xl font-heading font-semibold">Payment Wallets</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bitcoin Address</label>
                <Input
                  value={wallets.bitcoin}
                  onChange={(e) => setWallets({...wallets, bitcoin: e.target.value})}
                  className="input-dark font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ethereum Address</label>
                <Input
                  value={wallets.ethereum}
                  onChange={(e) => setWallets({...wallets, ethereum: e.target.value})}
                  className="input-dark font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">USDT (TRC20) Address</label>
                <Input
                  value={wallets.usdt}
                  onChange={(e) => setWallets({...wallets, usdt: e.target.value})}
                  className="input-dark font-mono text-sm"
                />
              </div>
              <Button onClick={handleSaveWallets} className="btn-hero w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Wallet Settings
              </Button>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-success" />
              </div>
              <h2 className="text-xl font-heading font-semibold">Financial Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Min Withdrawal ($)</label>
                  <Input
                    type="number"
                    value={settings.minWithdrawal}
                    onChange={(e) => setSettings({...settings, minWithdrawal: parseInt(e.target.value)})}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Withdrawal ($)</label>
                  <Input
                    type="number"
                    value={settings.maxWithdrawal}
                    onChange={(e) => setSettings({...settings, maxWithdrawal: parseInt(e.target.value)})}
                    className="input-dark"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Referral Commission (%)</label>
                <Input
                  type="number"
                  value={settings.referralCommission}
                  onChange={(e) => setSettings({...settings, referralCommission: parseInt(e.target.value)})}
                  className="input-dark"
                />
              </div>
              <Button onClick={() => toast.success("Financial settings saved!")} className="btn-hero w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Financial Settings
              </Button>
            </div>
          </div>

          {/* System Settings */}
          <div className="dashboard-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-info" />
              </div>
              <h2 className="text-xl font-heading font-semibold">System Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Temporarily disable the platform</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Send email alerts for transactions</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Auto-Approve Deposits</p>
                  <p className="text-sm text-muted-foreground">Automatically confirm deposits</p>
                </div>
                <Switch
                  checked={settings.autoApproveDeposits}
                  onCheckedChange={(checked) => setSettings({...settings, autoApproveDeposits: checked})}
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">Require 2FA for Admin</p>
                  <p className="text-sm text-muted-foreground">Force two-factor authentication</p>
                </div>
                <Switch
                  checked={settings.twoFactorRequired}
                  onCheckedChange={(checked) => setSettings({...settings, twoFactorRequired: checked})}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
