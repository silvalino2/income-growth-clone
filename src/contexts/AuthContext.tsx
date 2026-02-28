import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    country: string,
    phone: string
  ) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(null);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      setIsAdmin(data?.is_admin ?? false);
    };

    checkAdmin();
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    country: string,
    phone: string
  ) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error && data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        country,
        phone,
        is_admin: false,
      });
    }

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, isLoading, signIn, signUp }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
