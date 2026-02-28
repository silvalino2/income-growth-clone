import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

/* =========================================================
   TYPES
========================================================= */

type Profile = Tables<"profiles">;
type Deposit = Tables<"deposits">;
type Withdrawal = Tables<"withdrawals">;
type Plan = Tables<"investment_plans">;
type PlatformSettings = Tables<"platform_settings">;

/* =========================================================
   SAFE HELPER
========================================================= */

const safeNumber = (value: unknown) => Number(value ?? 0);

/* =========================================================
   ADMIN STATS
========================================================= */

export function useAdminStats(isAllowed?: boolean) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDeposits: 0,
    totalWithdrawals: 0,
    totalProfit: 0,
    pendingWithdrawals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(false);

  const fetchStats = useCallback(async () => {
    if (!isAllowed) return;
    if (typeof window === "undefined") return; // client-only

    try {
      setIsLoading(true);

      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { data: deposits } = await supabase
        .from("deposits")
        .select("amount, current_balance, profit, status");

      const { data: withdrawals } = await supabase
        .from("withdrawals")
        .select("amount, status");

      const confirmedDeposits = deposits?.filter(d => d.status === "confirmed") ?? [];
      const approvedWithdrawals = withdrawals?.filter(w => w.status === "approved") ?? [];
      const pendingWithdrawals = withdrawals?.filter(w => w.status === "pending").length ?? 0;

      if (mounted.current) {
        setStats({
          totalUsers: totalUsers ?? 0,
          activeDeposits: confirmedDeposits.reduce(
            (sum, d) => sum + safeNumber(d.current_balance ?? d.amount),
            0
          ),
          totalProfit: confirmedDeposits.reduce((sum, d) => sum + safeNumber(d.profit), 0),
          totalWithdrawals: approvedWithdrawals.reduce((sum, w) => sum + safeNumber(w.amount), 0),
          pendingWithdrawals,
        });
      }
    } catch (err) {
      console.error("Admin stats error:", err);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, [isAllowed]);

  useEffect(() => {
    mounted.current = true;
    fetchStats();
    return () => {
      mounted.current = false;
    };
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats };
}

/* =========================================================
   GENERIC FETCH HOOK
========================================================= */

function useAdminTable<T extends Tables<string>>(table: string, isAllowed?: boolean) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(false);

  const fetchData = useCallback(async () => {
    if (!isAllowed) return;
    if (typeof window === "undefined") return; // client-only

    try {
      setIsLoading(true);
      const { data } = await supabase.from(table).select("*").order("created_at", { ascending: false });
      if (mounted.current) setData(data ?? []);
    } catch (err) {
      console.error(`Admin ${table} error:`, err);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, [table, isAllowed]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    return () => {
      mounted.current = false;
    };
  }, [fetchData]);

  return { data, isLoading, refetch: fetchData };
}

/* =========================================================
   SPECIFIC HOOKS USING GENERIC
========================================================= */

export const useAdminUsers = (isAllowed?: boolean) => {
  const { data, isLoading, refetch } = useAdminTable<Profile>("profiles", isAllowed);

  const updateUserStatus = async (userId: string, newStatus: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("user_id", userId);
    if (!error) await refetch();
    return { success: !error, error };
  };

  // placeholder maps; more complex aggregates can be added later
  const userDeposits: Record<string, number> = {};
  const userWithdrawals: Record<string, number> = {};

  return {
    users: data || [],
    userDeposits,
    userWithdrawals,
    isLoading,
    updateUserStatus,
    refetch,
  };
};

export const useAdminDeposits = (isAllowed?: boolean) => {
  const { data, isLoading, refetch } = useAdminTable<Deposit>("deposits", isAllowed);

  const updateDepositStatus = async (depositId: string, newStatus: string) => {
    const { error } = await supabase
      .from("deposits")
      .update({ status: newStatus })
      .eq("id", depositId);
    if (!error) await refetch();
    return { success: !error, error };
  };

  return {
    deposits: data || [],
    isLoading,
    updateDepositStatus,
    refetch,
  };
};

export const useAdminWithdrawals = (isAllowed?: boolean) => {
  const { data, isLoading, refetch } = useAdminTable<Withdrawal>("withdrawals", isAllowed);

  const updateWithdrawalStatus = async (withdrawalId: string, newStatus: string) => {
    const { error } = await supabase
      .from("withdrawals")
      .update({ status: newStatus })
      .eq("id", withdrawalId);
    if (!error) await refetch();
    return { success: !error, error };
  };

  return {
    withdrawals: data || [],
    isLoading,
    updateWithdrawalStatus,
    refetch,
  };
};

export const useAdminPlans = (isAllowed?: boolean) => {
  const { data, isLoading, refetch } = useAdminTable<Plan>("investment_plans", isAllowed);

  const updatePlan = async (planId: string, updates: Partial<Plan>) => {
    const { error } = await supabase
      .from("investment_plans")
      .update(updates)
      .eq("id", planId);
    if (!error) await refetch();
    return { success: !error, error };
  };

  const deletePlan = async (planId: string) => {
    const { error } = await supabase
      .from("investment_plans")
      .delete()
      .eq("id", planId);
    if (!error) await refetch();
    return { success: !error, error };
  };

  const createPlan = async (plan: Partial<Plan>) => {
    const { error } = await supabase
      .from("investment_plans")
      .insert(plan);
    if (!error) await refetch();
    return { success: !error, error };
  };

  return {
    plans: data || [],
    isLoading,
    updatePlan,
    deletePlan,
    createPlan,
    refetch,
  };
};

/* =========================================================
   PLATFORM SETTINGS
========================================================= */

export function usePlatformSettings(isAllowed?: boolean) {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(false);

  const fetchSettings = useCallback(async () => {
    if (!isAllowed) return;
    if (typeof window === "undefined") return; // client-only

    try {
      setIsLoading(true);
      const { data } = await supabase.from("platform_settings").select("*").single();
      if (mounted.current) setSettings(data ?? null);
    } catch (err) {
      console.error("Platform settings error:", err);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, [isAllowed]);

  useEffect(() => {
    mounted.current = true;
    fetchSettings();
    return () => {
      mounted.current = false;
    };
  }, [fetchSettings]);

const updateSetting = async (key: string, value: any) => {
    try {
      const updatePayload: any = {};
      updatePayload[key] = value;
      const { error } = await supabase
        .from("platform_settings")
        .update(updatePayload);
      if (error) throw error;
      await fetchSettings();
      return { success: true, error: null };
    } catch (err) {
      console.error("updateSetting error:", err);
      return { success: false, error: err };
    }
  };

  return { settings, isLoading, refetch: fetchSettings, updateSetting };
      }
