import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: any | null;
  isAdmin: boolean | null;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
    country?: string,
    phone?: string
  ) => Promise<{ error: any | null }>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: null,
  authReady: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  signUp: async () => ({ error: null }),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Handle Supabase auth state change
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) setUser(data.session.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setIsAdmin(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch profile and determine admin role
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsAdmin(null);
        setAuthReady(true);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setIsAdmin(profile?.is_admin ?? false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setIsAdmin(false);
      } finally {
        setAuthReady(true);
      }
    };

    fetchProfile();
  }, [user]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.user) setUser(data.user);
    return { error };
  };

  // Sign up function
  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    country?: string,
    phone?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, country, phone, is_admin: false } },
    });
    if (data?.user) setUser(data.user);
    return { error };
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, authReady, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
