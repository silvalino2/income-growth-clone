import { Shield, Award, Building } from "lucide-react";
import licenseImg from "@/assets/license.jpg";

const Stats = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Company info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <span className="font-heading text-xl font-semibold">Registered Company</span>
            </div>
            
            <p className="text-muted-foreground mb-8 leading-relaxed">
              We are legal company registered in Singapore. You can check our company registration information.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="stat-card">
                <p className="text-3xl font-heading font-bold text-primary mb-2">
                  $26,005,400
                </p>
                <p className="text-muted-foreground text-sm">Total Deposit</p>
              </div>
              <div className="stat-card">
                <p className="text-3xl font-heading font-bold text-primary mb-2">
                  $780M+
                </p>
                <p className="text-muted-foreground text-sm">Total Withdrawal</p>
              </div>
            </div>

            <div className="card-dark">
              <div className="flex items-center gap-4 mb-4">
                <Award className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-heading font-semibold">Company Name</p>
                  <p className="text-muted-foreground text-sm">INCOME-GROWTH.ORG</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-heading font-semibold">Certificate Number</p>
                  <p className="text-primary text-lg font-mono">#146940555</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - License image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
              <img 
                src={licenseImg}
                alt="Financial Growths License"
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -z-10 top-8 left-8 w-full h-full bg-primary/10 rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
