import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

interface AuthContextType {
  user: any | null;
  isAdmin: boolean | null;
  authReady: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    country?: string,
    phone?: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load session on mount
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        await fetchAdminStatus(data.session.user.id);
      }
      setAuthReady(true);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchAdminStatus(session.user.id);
        } else {
          setUser(null);
          setIsAdmin(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchAdminStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles") // <-- your table
      .select("is_admin")
      .eq("user_id", userId) // <-- adjust to your PK column
      .single();

    if (error) {
      console.error("Error fetching admin status:", error);
      setIsAdmin(false);
    } else {
      setIsAdmin(data?.is_admin || false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.user) {
      setUser(data.user);
      await fetchAdminStatus(data.user.id);
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
    const { data, error } = await supabase.auth.signUp(
      { email, password },
      { data: { full_name: fullName, country, phone } }
    );

    if (data?.user) {
      // Insert into profiles table with is_admin=false
      await supabase.from("profiles").insert({
        user_id: data.user.id,
        full_name: fullName,
        country,
        phone,
        is_admin: false
      });
    }
    setIsLoading(false);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(null);
    navigate("/auth", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, authReady, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
