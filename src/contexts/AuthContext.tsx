import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextProps {
  user: any | null;
  isAdmin: boolean | null;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
    country?: string,
    phone?: string
  ) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
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

  // Initialize Supabase auth state
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        fetchUser(data.session.user.id);
      }
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(null);
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  // Fetch user profile from "profiles" table
  const fetchUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Fetch user error:", error);
        setUser(null);
        setIsAdmin(false);
        return;
      }

      setUser(data);
      setIsAdmin(data.is_admin ?? false); // default false if column missing
    } catch (err) {
      console.error("Fetch user exception:", err);
      setUser(null);
      setIsAdmin(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (data.session?.user) {
        await fetchUser(data.session.user.id);
      }
      return { error };
    } catch (err) {
      console.error("SignIn error:", err);
      return { error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    country?: string,
    phone?: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName ?? "",
          email,
          country: country ?? "",
          phone: phone ?? "",
          is_admin: false, // default false
        });
      }
      return { error };
    } catch (err) {
      console.error("SignUp error:", err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(null);
    } catch (err) {
      console.error("SignOut error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, authReady, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
