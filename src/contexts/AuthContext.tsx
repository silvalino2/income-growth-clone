import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: any | null;
  isAdmin: boolean | null;
  authReady: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    country: string,
    phone: string
  ) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: null,
  authReady: false,
  isLoading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch profile by user ID
  const fetchUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setUser(data);
      setIsAdmin(data.is_admin ?? false);
    } catch (err) {
      console.error("Fetch user error:", err);
      setUser(null);
      setIsAdmin(false);
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };

      if (data.user) await fetchUser(data.user.id);
      return { error: null };
    } catch (err) {
      console.error("SignIn error:", err);
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    country: string,
    phone: string
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error };

      if (data.user) {
        // Insert profile in your table
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName,
          email,
          country,
          phone,
          is_admin: false
        });
        if (profileError) return { error: profileError };
      }

      return { error: null };
    } catch (err) {
      console.error("SignUp error:", err);
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(null);
    } catch (err) {
      console.error("SignOut error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ On mount, check if user is already logged in
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (session?.user) {
        await fetchUser(session.user.id);
      }

      setAuthReady(true);
    };

    getSession();

    // Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchUser(session.user.id);
      else {
        setUser(null);
        setIsAdmin(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, authReady, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
