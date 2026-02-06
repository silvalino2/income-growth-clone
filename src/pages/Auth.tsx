import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login form
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Register form
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "register") {
      setMode("register");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(loginData.email, loginData.password);
    
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Please confirm your email address before logging in");
      } else {
        toast.error(error.message || "Login failed");
      }
    } else {
      toast.success("Login successful!");
      // Navigation will be handled by the useEffect above
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    const fullName = `${registerData.firstName} ${registerData.lastName}`.trim();
    
    const { error } = await signUp(
      registerData.email,
      registerData.password,
      fullName,
      registerData.country,
      registerData.phone
    );
    
    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please log in.");
      } else {
        toast.error(error.message || "Registration failed");
      }
    } else {
      toast.success("Registration successful! Please check your email to confirm your account.");
      setMode("login");
      setLoginData({ email: registerData.email, password: "" });
    }
    
    setIsLoading(false);
  };

  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany",
    "France", "Singapore", "Nigeria", "South Africa", "India", "China",
    "Japan", "Brazil", "Mexico", "Spain", "Italy", "Netherlands", "Sweden"
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Back to home */}
      <Link 
        to="/" 
        className="absolute top-4 left-4 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">HOME</span>
      </Link>

      {/* Login Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-heading font-bold mb-8">Login</h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Input
                type="email"
                placeholder="email"
                className="input-dark pl-4 pr-10 py-6 text-lg"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
              />
              {loginData.email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {loginData.email.includes("@") ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="password"
                className="input-dark pl-4 pr-10 py-6 text-lg"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  rememberMe ? "border-primary bg-primary" : "border-primary"
                }`}
              >
                {rememberMe && <CheckCircle className="w-4 h-4 text-primary-foreground" />}
              </button>
              <span className="text-foreground/80">Remember me</span>
            </div>

            <Button 
              type="submit" 
              className="btn-hero w-full py-6 text-lg uppercase tracking-wider"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Submit"}
            </Button>

            <p className="text-center">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Forgot your password?
              </a>
            </p>
          </form>
        </div>
      </div>

      {/* Register Section */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-8 bg-card/50">
        <div className="w-full max-w-lg">
          <h1 className="text-4xl font-heading font-bold mb-8">Register</h1>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Firstname"
                className="input-dark py-4 placeholder:text-primary/70"
                value={registerData.firstName}
                onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                required
              />
              <Input
                placeholder="Lastname"
                className="input-dark py-4 placeholder:text-primary/70"
                value={registerData.lastName}
                onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                required
              />
            </div>

            <Input
              type="email"
              placeholder="Email"
              className="input-dark py-4 placeholder:text-primary/70"
              value={registerData.email}
              onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                className="input-dark w-full py-4 px-4 rounded-md text-primary/70 bg-input border border-border"
                value={registerData.country}
                onChange={(e) => setRegisterData({...registerData, country: e.target.value})}
                required
              >
                <option value="">Country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <Input
                type="tel"
                placeholder="Phone"
                className="input-dark py-4 placeholder:text-primary/70"
                value={registerData.phone}
                onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="password"
                placeholder="Password"
                className="input-dark py-4 placeholder:text-primary/70"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                required
              />
              <Input
                type="password"
                placeholder="Confirm"
                className="input-dark py-4 placeholder:text-primary/70"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                required
              />
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our privacy policy.
            </p>

            <Button 
              type="submit" 
              className="btn-hero w-full py-6 text-lg uppercase tracking-wider"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Submit"}
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile Register Toggle */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Don't have an account? Register" : "Already have an account? Login"}
        </Button>
      </div>
    </div>
  );
};

export default Auth;
