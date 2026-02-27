import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: any | null;
  isAdmin: boolean | null;
  authReady: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: null,
  authReady: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const session = supabase.auth.session();
    if (session?.user) setUser(session.user);

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) setUser(session.user);
      else setUser(null);
    });

    return () => listener?.unsubscribe();
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
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") setIsAdmin(true);
        else setIsAdmin(false);
      } catch (err) {
        console.error("AuthContext fetchProfile error:", err);
        setIsAdmin(false);
      } finally {
        setAuthReady(true);
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, authReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
