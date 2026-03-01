// src/hooks/useAdminData.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

// ========================================================
// TYPE DEFINITIONS
// ========================================================

type UserProfile = Tables<"profiles">;
type DepositRow = Tables<"deposits">;
type WithdrawalRow = Tables<"withdrawals">;
type InvestmentPlan = Tables<"investment_plans">;
type PlatformSettingsRow = Tables<"platform_settings">;

interface SafeUser extends UserProfile {
  user_id: string;
  balance: number;
  lastLogin: string;
}

interface DepositWithUser extends DepositRow {
  user_name: string;
  user_balance: number;
  plan_name: string;
  roi_percentage: number;
}

interface WithdrawalWithUser extends WithdrawalRow {
  user_name: string;
  user_balance: number;
}

interface AdminStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activeDeposits: number;
  totalBalance: number;
}

// ========================================================
// USERS HOOK
// ========================================================

export function useAdminUsers() {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [userMap, setUserMap] = useState<Record<string, SafeUser>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, name, email, balance, last_sign_in_at");
      if (error) throw error;

      const finalUsers: SafeUser[] = (data || []).map(u => ({
        ...u,
        user_id: u.user_id || u.id,
        balance: u.balance || 0,
        lastLogin: u.last_sign_in_at || "Never",
      }));

      setUsers(finalUsers);
      setUserMap(Object.fromEntries(finalUsers.map(u => [u.user_id, u])));
    } catch (err) {
      console.error("useAdminUsers error:", err);
      setUsers([]);
      setUserMap({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const setUserBalance = async (userId: string, newBalance: number) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("user_id", userId);
      if (error) throw error;
      await fetchUsers();
      return { success: true };
    } catch (err) {
      console.error("setUserBalance error:", err);
      return { success: false };
    }
  };

  const incrementUserBalance = async (userId: string, amount: number) => {
    const user = userMap[userId];
    if (!user) return { success: false };
    return setUserBalance(userId, user.balance + amount);
  };

  const decrementUserBalance = async (userId: string, amount: number) => {
    const user = userMap[userId];
    if (!user) return { success: false };
    return setUserBalance(userId, user.balance - amount);
  };

  return {
    users,
    userMap,
    isLoading,
    refetch: fetchUsers,
    setUserBalance,
    incrementUserBalance,
    decrementUserBalance,
  };
}

// ========================================================
// DEPOSITS HOOK
// ========================================================

export function useAdminDeposits() {
  const [deposits, setDeposits] = useState<DepositWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeposits = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: depositsData, error } = await supabase
        .from("deposits")
        .select(`
          *,
          profiles(id, user_id, name, email, balance),
          investment_plans(id, name, roi_percentage)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const enriched: DepositWithUser[] = (depositsData || []).map(d => ({
        ...d,
        user_name: d.profiles?.name || d.profiles?.email || "Unknown User",
        user_balance: d.profiles?.balance || 0,
        plan_name: d.investment_plans?.name ?? "N/A",
        roi_percentage: Number(d.investment_plans?.roi_percentage ?? 0),
      }));

      setDeposits(enriched);
    } catch (err) {
      console.error("useAdminDeposits error:", err);
      setDeposits([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  return { deposits, isLoading, refetch: fetchDeposits };
}

// ========================================================
// WITHDRAWALS HOOK
// ========================================================

export function useAdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWithdrawals = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: withdrawalsData, error } = await supabase
        .from("withdrawals")
        .select(`
          *,
          profiles(id, user_id, name, email, balance)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const enriched: WithdrawalWithUser[] = (withdrawalsData || []).map(w => ({
        ...w,
        user_name: w.profiles?.name || w.profiles?.email || "Unknown User",
        user_balance: w.profiles?.balance || 0,
      }));

      setWithdrawals(enriched);
    } catch (err) {
      console.error("useAdminWithdrawals error:", err);
      setWithdrawals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  return { withdrawals, isLoading, refetch: fetchWithdrawals };
}

// ========================================================
// INVESTMENT PLANS HOOK
// ========================================================

export function useAdminInvestmentPlans() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("investment_plans")
        .select("*")
        .order("min_amount", { ascending: true });
      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      console.error("useAdminInvestmentPlans error:", err);
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, isLoading, refetch: fetchPlans };
}

// ========================================================
// PLATFORM SETTINGS HOOK
// ========================================================

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettingsRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .single();
      if (error) throw error;
      setSettings(data);
    } catch (err) {
      console.error("usePlatformSettings error:", err);
      setSettings(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, isLoading, refetch: fetchSettings };
}

// ========================================================
// ADMIN STATS HOOK
// ========================================================

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    activeDeposits: 0,
    totalBalance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const [{ data: users }, { data: deposits }, { data: withdrawals }] =
        await Promise.all([
          supabase.from("profiles").select("id, balance"),
          supabase.from("deposits").select("amount, status"),
          supabase.from("withdrawals").select("amount"),
        ]);

      const totalUsers = users?.length ?? 0;
      const totalDeposits = deposits?.reduce((sum, d) => sum + Number(d.amount ?? 0), 0) ?? 0;
      const totalWithdrawals = withdrawals?.reduce((sum, w) => sum + Number(w.amount ?? 0), 0) ?? 0;
      const activeDeposits = deposits?.filter(d => d.status === "active").length ?? 0;
      const totalBalance = users?.reduce((sum, u) => sum + Number(u.balance ?? 0), 0) ?? 0;

      setStats({ totalUsers, totalDeposits, totalWithdrawals, activeDeposits, totalBalance });
    } catch (err) {
      console.error("useAdminStats error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats };
}

// ========================================================
// EXPORT ALIASES (LEGACY)
// ========================================================

export const useAdminPlans = useAdminInvestmentPlans;
export const useAdminUsersLegacy = useAdminUsers;
export const useAdminDepositsLegacy = useAdminDeposits;
export const useAdminWithdrawalsLegacy = useAdminWithdrawals;
export const usePlatformSettingsLegacy = usePlatformSettings;
