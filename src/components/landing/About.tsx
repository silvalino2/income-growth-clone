import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, LineChart, Bitcoin } from "lucide-react";
import aboutTradingImg from "@/assets/about-trading.jpg";

const features = [
  {
    icon: TrendingUp,
    title: "Investment Solutions",
    description: "Whether you're planning for retirement, wealth accumulation, or risk management, our team is dedicated to maximizing your returns while minimizing risks."
  },
  {
    icon: BarChart3,
    title: "Option Trading Opportunities",
    description: "Dive into the exciting world of options trading with INCOME-GROWTH.ORG. Enhance your portfolio with the power of options trading."
  },
  {
    icon: LineChart,
    title: "Market Analysis",
    description: "Stay ahead of the curve with our in-depth market analysis. Real-time insights, enabling you to make informed decisions in an ever-evolving financial landscape."
  },
  {
    icon: Bitcoin,
    title: "Crypto Asset Management",
    description: "INCOME-GROWTH.ORG Investment helps investors in steering their funds in high performing asset tokens across exchanges."
  }
];

const About = () => {
  return (
    <section id="about" className="py-24 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-border">
              <img 
                src={aboutTradingImg}
                alt="Investment Trading"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div>
            <h2 className="section-heading mb-6">
              About Us
            </h2>
            <div className="w-20 h-1 bg-primary mb-6" />
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Welcome to INCOME-GROWTH.ORG, a leading financial trading firm dedicated to helping our clients achieve their financial goals. With a steadfast commitment to excellence, we utilize our deep market expertise and experience to offer top-tier strategic guidance and tailored investment solutions.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              At INCOME-GROWTH.ORG, we understand that every client has unique financial goals and needs. That's why our team of experienced professionals is committed to providing personalized strategies tailored to your specific situation.
            </p>
          </div>
        </div>

        {/* Features section */}
        <div className="text-center mb-12">
          <h2 className="section-heading mb-4">
            Your Financial Future Starts Now
          </h2>
          <p className="section-subheading">
            Harness the Power of Expert Insights and Personalized Guidance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="card-dark text-center hover:border-primary/50 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/auth?mode=register">
            <Button className="btn-hero">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About;
