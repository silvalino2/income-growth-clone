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
    country?: string,
    phone?: string
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

  // fetch profile from Supabase
  const fetchUserProfile = async (userId: string) => {
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
      console.error("Error fetching user profile:", err);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setAuthReady(true);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };

      if (data.user) await fetchUserProfile(data.user.id);

      return { error: null };
    } catch (err) {
      console.error("Sign in error:", err);
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    country?: string,
    phone?: string
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp(
        { email, password },
        { data: { full_name: fullName, country, phone, is_admin: false } }
      );

      if (error) return { error };

      if (data.user) await fetchUserProfile(data.user.id);

      return { error: null };
    } catch (err) {
      console.error("Sign up error:", err);
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
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

  // Listen to auth state changes (automatic login persistence)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchUserProfile(session.user.id);
      else {
        setUser(null);
        setIsAdmin(null);
        setAuthReady(true);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, authReady, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
