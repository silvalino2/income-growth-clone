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
    setAuthReady(true);

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
      else setUser(null);
      setAuthReady(true);
    });

    return () => listener?.unsubscribe();
  }, []);

  // Fetch role after user loads
  useEffect(() => {
    if (!user) {
      setIsAdmin(null);
      return;
    }

    const fetchRole = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setIsAdmin(profile?.role === "admin");
      } catch (err) {
        console.error("AuthContext fetchRole error:", err);
        setIsAdmin(false);
      }
    };

    fetchRole();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, authReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
