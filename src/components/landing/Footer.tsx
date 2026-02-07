import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-1 h-4 bg-primary-foreground rounded-full" />
                <div className="w-1 h-6 bg-primary-foreground rounded-full" />
                <div className="w-1 h-3 bg-primary-foreground rounded-full" />
              </div>
            </div>
            <span className="font-heading font-bold text-lg">INCOME-GROWTH</span>
          </Link>

          {/* Copyright */}
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} INCOME-GROWTH.ORG. All rights reserved.
          </p>

          {/* CTA */}
          <Link to="/auth?mode=register">
            <Button className="btn-hero">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
