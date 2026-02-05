import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, ArrowDownCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const withdrawalHistory = [
  { id: 1, amount: "$250.00", method: "Bitcoin", address: "bc1q...fjhx", date: "2024-01-10", status: "Completed" },
  { id: 2, amount: "$500.00", method: "USDT", address: "TXkV...vJT", date: "2024-01-15", status: "Pending" },
];

const Withdraw = () => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("btc");
  const [address, setAddress] = useState("");

  const availableBalance = 1430.00;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (numAmount < 50) {
      toast.error("Minimum withdrawal is $50");
      return;
    }
    if (numAmount > availableBalance) {
      toast.error("Insufficient balance");
      return;
    }
    if (!address) {
      toast.error("Please enter your wallet address");
      return;
    }

    toast.success("Withdrawal request submitted! Processing may take 24-48 hours.");
    setAmount("");
    setAddress("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Withdraw Funds</h1>
          <p className="text-muted-foreground">Request a withdrawal to your wallet.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <div className="dashboard-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center">
                <Wallet className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Available Balance</p>
                <p className="text-3xl font-heading font-bold">${availableBalance.toFixed(2)}</p>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-dark"
                  min={50}
                  max={availableBalance}
                />
                <p className="text-xs text-muted-foreground mt-1">Minimum: $50</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="input-dark w-full py-3 px-4 rounded-md bg-input border border-border"
                >
                  <option value="btc">Bitcoin (BTC)</option>
                  <option value="eth">Ethereum (ETH)</option>
                  <option value="usdt">USDT (TRC20)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Wallet Address</label>
                <Input
                  type="text"
                  placeholder="Enter your wallet address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div className="bg-info/10 border border-info/30 p-4 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <p className="text-sm text-info">
                  Withdrawal requests are processed within 24-48 hours. Please ensure your wallet address is correct.
                </p>
              </div>

              <Button type="submit" className="btn-hero w-full">
                Request Withdrawal
              </Button>
            </form>
          </div>

          {/* Withdrawal History */}
          <div className="dashboard-card">
            <h2 className="text-xl font-heading font-semibold mb-6">Withdrawal History</h2>
            <div className="space-y-4">
              {withdrawalHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ArrowDownCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No withdrawals yet</p>
                </div>
              ) : (
                withdrawalHistory.map((withdrawal) => (
                  <div key={withdrawal.id} className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-heading font-bold">{withdrawal.amount}</span>
                      <span className={`status-badge ${
                        withdrawal.status === "Completed" ? "status-active" : "status-pending"
                      }`}>
                        {withdrawal.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{withdrawal.method}</span>
                      <span>{withdrawal.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {withdrawal.address}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Withdraw;
