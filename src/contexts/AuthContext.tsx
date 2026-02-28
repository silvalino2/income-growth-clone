import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: any | null;
  isAdmin: boolean;
  authReady: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const ADMIN_EMAIL = "admin@income-growth.org"; // 🔥 CHANGE THIS TO YOUR ADMIN EMAIL

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  authReady: false,
  isLoading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Listen for auth changes
  useEffect(() => {
  const getSession = async () => {
    const { data } = await supabase.auth.getSession();

    if (data.session?.user) {
      setUser(data.session.user);
      setIsAdmin(data.session.user.email === ADMIN_EMAIL);
    }

    setAuthReady(true);
  };

  getSession();

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      setUser(session.user);
      setIsAdmin(session.user.email === ADMIN_EMAIL);
    } else {
      setUser(null);
      setIsAdmin(false);
    }

    setAuthReady(true);
  });

  return () => listener.subscription.unsubscribe();
}, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        setUser(data.user);
        setIsAdmin(data.user.email === ADMIN_EMAIL);
      }

      return { error: null };
    } catch (err) {
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error };
    } catch (err) {
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, authReady, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
