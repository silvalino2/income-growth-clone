import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAdmin, authReady, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login"
  );

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany",
    "France", "Singapore", "Nigeria", "South Africa", "India", "China",
    "Japan", "Brazil", "Mexico", "Spain", "Italy", "Netherlands", "Sweden"
  ];

  // ✅ Redirect only after auth is ready and user info is fully loaded
  useEffect(() => {
    if (!authReady) return;

    if (user && isAdmin !== null) {
      if (isAdmin) navigate("/admin", { replace: true });
      else navigate("/dashboard", { replace: true });
    }
  }, [user, isAdmin, authReady, navigate]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  const { error, user: supaUser } = await signIn(loginData.email, loginData.password);

  if (error || !supaUser) {
    toast.error(error?.message || "Login failed");
    setIsLoading(false);
    return;
  }

  // Fetch profile immediately after login
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", supaUser.id)
    .single();

  if (profileError || !profile) {
    toast.error("Failed to fetch profile");
    setIsLoading(false);
    return;
  }

  // Update AuthContext state
  setUser(profile);
  setIsAdmin(profile.is_admin ?? false);
  setAuthReady(true);

  toast.success("Login successful!");

  // Redirect immediately based on role
  if (profile.is_admin) navigate("/admin", { replace: true });
  else navigate("/dashboard", { replace: true });

  setIsLoading(false);
};

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(
      registerData.email,
      registerData.password,
      `${registerData.firstName} ${registerData.lastName}`.trim(),
      registerData.country,
      registerData.phone
    );

    if (error) toast.error(error.message || "Registration failed");
    else {
      toast.success("Registration successful! Please login.");
      setMode("login");
      setLoginData({ email: registerData.email, password: "" });
    }

    setIsLoading(false);
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Back to home */}
      <Link to="/" className="absolute top-4 left-4 flex items-center gap-2 text-primary">
        <ArrowLeft className="w-5 h-5" />
        <span>HOME</span>
      </Link>

      {/* Login Section */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 ${mode === "register" ? "hidden lg:flex" : "flex"}`}>
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold mb-8">Login</h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Input
                type="email"
                placeholder="Email"
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
                placeholder="Password"
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

            <Button 
              type="submit" 
              className="btn-hero w-full py-6 text-lg uppercase tracking-wider"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Login"}
            </Button>

            <p className="text-center text-sm">
              Don't have an account?{" "}
              <button type="button" onClick={() => setMode("register")} className="text-primary">
                Register
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Register Section */}
      <div className={`w-full lg:w-1/2 items-center justify-center p-8 bg-card/50 ${mode === "register" ? "flex" : "hidden lg:flex"}`}>
        <div className="w-full max-w-lg">
          <h1 className="text-4xl font-bold mb-8">Register</h1>

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

            <Button type="submit" disabled={isLoading} className="w-full py-6 text-lg uppercase tracking-wider">
              {isLoading ? "Loading..." : "Register"}
            </Button>

            <p className="text-center text-sm">
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("login")} className="text-primary">
                Login
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
