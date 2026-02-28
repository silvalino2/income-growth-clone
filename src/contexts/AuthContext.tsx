import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Listen to auth state changes
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch isAdmin from profiles
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsAdmin(null);
        setAuthReady(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setIsAdmin(!!data?.is_admin);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setIsAdmin(false);
      } finally {
        setAuthReady(true);
      }
    };

    fetchProfile();
  }, [user]);

  // Auth functions
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) setUser(data.user ?? null);
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    country?: string,
    phone?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
      // Insert profile row
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName ?? "",
        country: country ?? "",
        phone: phone ?? "",
        is_admin: false, // normal users
      });
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, authReady, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
