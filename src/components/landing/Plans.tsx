import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "STARTER",
    percentage: "15%",
    period: "Every 24hrs",
    range: "$50 - $499",
    featured: false
  },
  {
    name: "BASIC",
    percentage: "30%",
    period: "Every 48hrs",
    range: "$500 - $3999",
    featured: false
  },
  {
    name: "SILVER",
    percentage: "50%",
    period: "Every 72hrs",
    range: "$4000 - $9999",
    featured: true
  },
  {
    name: "GOLD",
    percentage: "80%",
    period: "Every 92hrs",
    range: "$10,000 - $20,000",
    featured: false
  },
  {
    name: "REAL ESTATE",
    percentage: "100%",
    period: "Every 5 days",
    range: "$21,000 - UNLIMITED",
    featured: false
  }
];

const Plans = () => {
  return (
    <section id="plans" className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="section-heading mb-4">
            Our Investment Packages
          </h2>
          <p className="section-subheading">
            Grow your money with our stable and profitable packages that suits you best!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {plans.map((plan, index) => (
            <div 
              key={plan.name}
              className={plan.featured ? "pricing-card-featured" : "pricing-card"}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.featured && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              )}
              
              <h3 className="font-heading font-bold text-xl mb-6 text-primary">
                {plan.name}
              </h3>
              
              <div className="mb-4">
                <span className="text-5xl font-heading font-bold">{plan.percentage}</span>
              </div>
              
              <p className="text-muted-foreground text-sm mb-2">
                {plan.period}
              </p>
              
              <p className="text-foreground font-medium mb-8">
                {plan.range}
              </p>

              <Link to="/auth?mode=register">
                <Button 
                  className={plan.featured 
                    ? "btn-hero w-full animate-glow-pulse" 
                    : "btn-hero w-full"
                  }
                >
                  Invest Now
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Plans;
