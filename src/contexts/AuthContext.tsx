import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: any | null;
  isAdmin: boolean;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  authReady: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // 🔹 Fetch user role
  const fetchRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (!error && data?.role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  // 🔹 Initialize auth state once
  useEffect(() => {
    const session = supabase.auth.session();

    if (session?.user) {
      setUser(session.user);
      fetchRole(session.user.id).finally(() => setAuthReady(true));
    } else {
      setAuthReady(true);
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchRole(session.user.id);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        setAuthReady(true);
      }
    );

    return () => {
      listener?.unsubscribe();
    };
  }, []);

  // 🔹 Login
  const signIn = async (email: string, password: string) => {
    const { user, error } = await supabase.auth.signIn({
      email,
      password,
    });

    if (user) {
      setUser(user);
      await fetchRole(user.id);
    }

    return { error };
  };

  // 🔹 Logout
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        authReady,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
