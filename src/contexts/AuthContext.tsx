import { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  user: any | null;
  isAdmin: boolean | null;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
    country?: string,
    phone?: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: null,
  authReady: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const navigate = useNavigate();

  // --------------------------
  // Sign In
  // --------------------------
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      // session is valid, fetch profile
      const profileResp = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user?.id)
        .single();

      const role = profileResp.data?.role;
      const adminFlag = role === "admin";

      setUser(data.user);
      setIsAdmin(adminFlag);
      setAuthReady(true);

      // Navigate after login
      if (adminFlag) navigate("/admin");
      else navigate("/dashboard");

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // --------------------------
  // Sign Up
  // --------------------------
  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    country?: string,
    phone?: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, country, phone },
        },
      });

      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  // --------------------------
  // Sign Out
  // --------------------------
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(null);
    setAuthReady(true);
    navigate("/auth");
  };

  // --------------------------
  // On page load, check session
  // --------------------------
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // fetch profile to get isAdmin
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then((resp) => {
            const role = resp.data?.role;
            setIsAdmin(role === "admin");
            setAuthReady(true);
          })
          .catch(() => setAuthReady(true));
      } else {
        setAuthReady(true);
      }
    });
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        authReady,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
