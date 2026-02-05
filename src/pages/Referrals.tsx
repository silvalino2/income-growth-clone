import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

const referrals = [
  { id: 1, name: "Mike Johnson", email: "mike@example.com", date: "2024-01-15", deposits: "$500.00", commission: "$50.00", status: "Active" },
  { id: 2, name: "Sarah Wilson", email: "sarah@example.com", date: "2024-01-18", deposits: "$1,000.00", commission: "$100.00", status: "Active" },
  { id: 3, name: "Tom Davis", email: "tom@example.com", date: "2024-01-20", deposits: "$0.00", commission: "$0.00", status: "Pending" },
];

const Referrals = () => {
  const referralCode = "REF-JOHN2024";
  const referralLink = `https://income-growth.com/register?ref=${referralCode}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Referral Program</h1>
          <p className="text-muted-foreground">Invite friends and earn 10% commission on their deposits.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="dashboard-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Referrals</p>
                <p className="text-2xl font-heading font-bold">3</p>
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Commission</p>
                <p className="text-2xl font-heading font-bold">$150.00</p>
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-info/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Active Referrals</p>
                <p className="text-2xl font-heading font-bold">2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="dashboard-card bg-gradient-to-r from-primary/20 to-primary/5 border-primary/30">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-heading font-semibold mb-2">Your Referral Link</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Share this link with your friends to earn 10% commission on their deposits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <code className="bg-background px-4 py-2 rounded-lg text-sm">
                    {referralCode}
                  </code>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(referralCode, "Referral code")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="btn-hero"
                onClick={() => copyToClipboard(referralLink, "Referral link")}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ url: referralLink, title: "Join INCOME-GROWTH" });
                  } else {
                    copyToClipboard(referralLink, "Referral link");
                  }
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="dashboard-card">
          <h2 className="text-xl font-heading font-semibold mb-6">Your Referrals</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left py-3 px-4 rounded-l-lg">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Joined</th>
                  <th className="text-left py-3 px-4">Total Deposits</th>
                  <th className="text-left py-3 px-4">Your Commission</th>
                  <th className="text-left py-3 px-4 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id} className="table-row">
                    <td className="py-4 px-4 font-medium">{referral.name}</td>
                    <td className="py-4 px-4 text-muted-foreground">{referral.email}</td>
                    <td className="py-4 px-4 text-muted-foreground">{referral.date}</td>
                    <td className="py-4 px-4">{referral.deposits}</td>
                    <td className="py-4 px-4 text-success">{referral.commission}</td>
                    <td className="py-4 px-4">
                      <span className={`status-badge ${
                        referral.status === "Active" ? "status-active" : "status-pending"
                      }`}>
                        {referral.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Referrals;
