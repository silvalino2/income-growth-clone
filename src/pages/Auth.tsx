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

  // ✅ Redirect only when auth is ready
  useEffect(() => {
    if (!authReady) return;

    if (user) {
      if (isAdmin) navigate("/admin", { replace: true });
      else navigate("/dashboard", { replace: true });
    }
  }, [user, isAdmin, authReady, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginData.email, loginData.password);

    if (error) {
      toast.error(error.message || "Login failed");
    } else {
      toast.success("Login successful!");
      // ✅ No navigation here; the useEffect above handles it
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
      {/* Back link */}
      <Link to="/" className="absolute top-4 left-4 flex items-center gap-2 text-primary">
        <ArrowLeft className="w-5 h-5" />
        <span>HOME</span>
      </Link>

      {/* Login Form */}
      {mode === "login" && (
        <div className="flex-1 flex items-center justify-center p-8">
          <form onSubmit={handleLogin} className="w-full max-w-md space-y-6">
            <h1 className="text-4xl font-bold mb-8">Login</h1>

            <Input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full py-3">
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
      )}

      {/* Register Form */}
      {mode === "register" && (
        <div className="flex-1 flex items-center justify-center p-8">
          <form onSubmit={handleRegister} className="w-full max-w-md space-y-4">
            <h1 className="text-4xl font-bold mb-8">Register</h1>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={registerData.firstName}
                onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                required
              />
              <Input
                placeholder="Last Name"
                value={registerData.lastName}
                onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                required
              />
            </div>

            <Input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
              required
            />

            <Button type="submit" disabled={isLoading} className="w-full py-3">
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
      )}
    </div>
  );
};

export default Auth;
