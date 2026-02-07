import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-hero-gradient" />
      
      {/* Hexagonal pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="hexagons" width="10" height="10" patternUnits="userSpaceOnUse">
              <polygon 
                points="5,0 10,2.5 10,7.5 5,10 0,7.5 0,2.5" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="0.3"
                className="text-primary/30"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      {/* Circuit board lines decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute top-1/3 right-0 w-1/4 h-px bg-gradient-to-l from-transparent via-primary/40 to-transparent" />
        <div className="absolute bottom-1/3 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center pt-20">
        <p className="text-muted-foreground text-lg mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Maximize Your Financial Success with INCOME-GROWTH.ORG
        </p>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Begin Your Journey to Wealth<br />
          with <span className="text-primary">INCOME-GROWTH.ORG</span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Link to="/auth?mode=register">
            <Button className="btn-hero">
              Sign Up
            </Button>
          </Link>
          <a href="#about">
            <Button variant="outline" className="btn-hero-outline">
              Learn More
            </Button>
          </a>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
