import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "#about" },
    { 
      name: "Services", 
      href: "#services",
      dropdown: [
        { name: "Forex Investment", href: "#forex" },
        { name: "Stock Investment", href: "#stocks" },
        { name: "Digital Currency", href: "#crypto" },
        { name: "Real Estate", href: "#realestate" },
        { name: "Commodities", href: "#commodities" },
      ]
    },
    { name: "Our Plans", href: "#plans" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                {link.dropdown ? (
                  <button 
                    className="nav-link flex items-center gap-1"
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                  >
                    {link.name}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                ) : (
                  <a href={link.href} className="nav-link">
                    {link.name}
                  </a>
                )}
                
                {link.dropdown && isServicesOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl py-2"
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                  >
                    {link.dropdown.map((item) => (
                      <a 
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-secondary/50 transition-colors"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="nav-link">
                Login
              </Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button className="btn-hero text-sm px-6 py-2">
                Signup
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  className="nav-link py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Link to="/auth">
                  <Button variant="ghost" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link to="/auth?mode=register">
                  <Button className="btn-hero w-full">
                    Signup
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
