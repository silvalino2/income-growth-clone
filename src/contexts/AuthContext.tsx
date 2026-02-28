import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: any | null;
  isAdmin: boolean | null;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: null,
  authReady: false,
  signIn: async () => ({ error: "Not implemented" }),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // fetch user profile and admin role
  const fetchProfile = async (u: any) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", u.id)
        .single();

      if (error) throw error;
      setIsAdmin(profile?.role === "admin");
    } catch (err) {
      console.error("fetchProfile error:", err);
      setIsAdmin(false);
    } finally {
      setAuthReady(true);
    }
  };

  // init auth state on mount
  useEffect(() => {
    const session = supabase.auth.session();
    if (session?.user) {
      setUser(session.user);
      fetchProfile(session.user);
    } else {
      setAuthReady(true);
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user);
      } else {
        setUser(null);
        setIsAdmin(null);
        setAuthReady(true);
      }
    });

    return () => listener?.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthReady(false);
    const { user: u, error } = await supabase.auth.signIn({ email, password });
    if (u) await fetchProfile(u);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(null);
    setAuthReady(true);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, authReady, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
