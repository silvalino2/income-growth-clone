import { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: any | null;
  isAdmin: boolean | null;
  authReady: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: null,
  authReady: false,
  isLoading: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setUser(data);
      setIsAdmin(data.is_admin ?? false); // ensure boolean
    } catch (err) {
      console.error("Fetch user error:", err);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setAuthReady(true);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) return { error };

      if (data.user) {
        await fetchUser(data.user.id);
      }

      return { error: null };
    } catch (err) {
      console.error("Sign in error:", err);
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(null);
      setAuthReady(true);
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, authReady, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
