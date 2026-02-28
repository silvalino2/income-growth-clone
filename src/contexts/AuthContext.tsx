import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: any | null;
  profile: any | null;
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
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: null,
  authReady: false,
  isLoading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // helper: load profile and role
  const loadProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data);
      setIsAdmin(data?.role === "admin");
    } catch (err) {
      console.error("AuthContext loadProfile error:", err);
      setIsAdmin(false); // treat as non-admin on error
    }
  };

  // initialize session on mount
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      }
      setAuthReady(true);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(null);
        }
        setAuthReady(true);
      }
    );

    return () => listener?.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    await loadProfile(user.id);
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data.session?.user) {
      setUser(data.session.user);
      await loadProfile(data.session.user.id);
    }
    setIsLoading(false);
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    country?: string,
    phone?: string
  ) => {
    setIsLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });
    if (!error && data.user) {
      // create profile record immediately so other parts can rely on it
      try {
        const profilePayload: any = {
          id: data.user.id,
          full_name: fullName,
          role: "user",
        };
        if (country) profilePayload.country = country;
        if (phone) profilePayload.phone = phone;
        await supabase.from("profiles").insert(profilePayload);
        setProfile(profilePayload);
        setUser(data.user);
        setIsAdmin(false);
      } catch (err) {
        console.error("AuthContext signup profile error:", err);
      }
    }
    setIsLoading(false);
    return { error };
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAdmin(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        authReady,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
