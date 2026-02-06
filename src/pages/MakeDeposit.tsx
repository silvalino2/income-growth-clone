import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Bitcoin, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useInvestmentPlans, useUserDeposits, usePlatformWallets } from "@/hooks/useUserData";

const MakeDeposit = () => {
  const { plans, isLoading: plansLoading } = useInvestmentPlans();
  const { createDeposit } = useUserDeposits();
  const { wallets, isLoading: walletsLoading } = usePlatformWallets();
  
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const paymentMethods = [
    { id: "btc", name: "Bitcoin", icon: Bitcoin, address: wallets.btc },
    { id: "eth", name: "Ethereum", icon: Wallet, address: wallets.eth },
    { id: "usdt", name: "USDT (TRC20)", icon: Wallet, address: wallets.usdt },
  ];

  const handleContinue = async () => {
    if (step === 1 && selectedPlanId) {
      setStep(2);
    } else if (step === 2 && amount) {
      const numAmount = parseFloat(amount);
      if (selectedPlan) {
        if (numAmount < selectedPlan.min_amount) {
          toast.error(`Minimum deposit for ${selectedPlan.name} is $${selectedPlan.min_amount}`);
          return;
        }
        if (numAmount > selectedPlan.max_amount) {
          toast.error(`Maximum deposit for ${selectedPlan.name} is $${selectedPlan.max_amount}`);
          return;
        }
      }
      setStep(3);
    } else if (step === 3 && selectedPayment) {
      setIsSubmitting(true);
      const result = await createDeposit(
        selectedPlanId!,
        parseFloat(amount),
        selectedPayment.toUpperCase()
      );
      
      if (result.success) {
        toast.success("Deposit request submitted! Please send the payment to complete.");
        setStep(4);
      } else {
        toast.error("Failed to submit deposit request");
      }
      setIsSubmitting(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard!");
  };

  if (plansLoading || walletsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Make a Deposit</h1>
          <p className="text-muted-foreground">Choose a plan and make your investment.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-16 sm:w-24 h-1 mx-2 ${
                  step > s ? "bg-primary" : "bg-secondary"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Plan */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold">Select Investment Plan</h2>
            {plans.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No investment plans available at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      selectedPlanId === plan.id 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <h3 className="font-heading font-bold text-lg text-primary mb-2">{plan.name}</h3>
                    <p className="text-3xl font-bold mb-2">{plan.roi_percentage}%</p>
                    <p className="text-muted-foreground text-sm">Every {plan.duration_days} days</p>
                    <p className="text-sm mt-2">
                      ${plan.min_amount.toLocaleString()} - ${plan.max_amount.toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
            <Button 
              onClick={handleContinue} 
              disabled={!selectedPlanId}
              className="btn-hero"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Enter Amount */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold">Enter Deposit Amount</h2>
            <div className="dashboard-card max-w-md">
              <p className="text-muted-foreground mb-4">
                Plan: <span className="text-primary font-semibold">{selectedPlan?.name}</span>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                  <Input
                    type="number"
                    placeholder={`Min: $${selectedPlan?.min_amount}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-dark text-2xl py-6"
                  />
                </div>
                {amount && selectedPlan && (
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <p className="text-muted-foreground text-sm">Expected Return:</p>
                    <p className="text-2xl font-heading font-bold text-success">
                      ${(parseFloat(amount) * (selectedPlan.roi_percentage / 100)).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleContinue} disabled={!amount} className="btn-hero">Continue</Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Select Payment Method */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold">Select Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    selectedPayment === method.id 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <method.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <p className="font-semibold">{method.name}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button 
                onClick={handleContinue} 
                disabled={!selectedPayment || isSubmitting} 
                className="btn-hero"
              >
                {isSubmitting ? "Submitting..." : "Continue"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Payment Instructions */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold">Complete Your Payment</h2>
            <div className="dashboard-card">
              <div className="text-center mb-6">
                <p className="text-muted-foreground mb-2">Send exactly</p>
                <p className="text-4xl font-heading font-bold text-primary">${amount}</p>
                <p className="text-muted-foreground mt-2">
                  to the {paymentMethods.find(m => m.id === selectedPayment)?.name} address below
                </p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg mb-6">
                <p className="text-xs text-muted-foreground mb-2">Wallet Address:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm break-all">
                    {paymentMethods.find(m => m.id === selectedPayment)?.address}
                  </code>
                  <Button 
                    size="sm" 
                    onClick={() => copyAddress(paymentMethods.find(m => m.id === selectedPayment)?.address || "")}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div className="bg-warning/10 border border-warning/30 p-4 rounded-lg">
                <p className="text-warning text-sm">
                  <strong>Important:</strong> After sending the payment, it may take 10-30 minutes to confirm. 
                  Your deposit will be activated automatically once confirmed by an admin.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MakeDeposit;
