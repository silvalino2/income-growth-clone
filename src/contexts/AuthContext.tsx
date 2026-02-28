import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: any | null;
  isAdmin: boolean;
  authReady: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  authReady: false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // 1️⃣ Listen for auth changes and set session
  useEffect(() => {
    const init = async () => {
      const session = supabase.auth.session();
      if (session?.user) setUser(session.user);

      const { data: listener } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) setUser(session.user);
          else setUser(null);
        }
      );

      return () => listener?.unsubscribe();
    };
    init().then(() => setAuthReady(true));
  }, []);

  // 2️⃣ Fetch profile once user exists
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setIsAdmin(profile?.role === "admin");
      } catch (err) {
        console.error("Error fetching profile:", err);
        setIsAdmin(false);
      }
    };
    fetchProfile();
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, authReady, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
