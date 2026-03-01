// src/hooks/useAdminData.ts

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

/* ========================================================
   TYPE DEFINITIONS
======================================================== */

type UserProfile = Tables<"profiles">;
type DepositRow = Tables<"deposits">;
type WithdrawalRow = Tables<"withdrawals">;
type InvestmentPlan = Tables<"investment_plans">;
type PlatformSettingsRow = Tables<"platform_settings">;

export interface SafeUser extends UserProfile {
  totalDeposits: number;
  totalWithdrawals: number;
}

export interface DepositWithPlan extends DepositRow {
  plan_name: string;
  roi_percentage: number;
}

export interface AdminStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activeDeposits: number;
  totalBalance: number;
}

/* ========================================================
   USERS
======================================================== */

export function useAdminUsers(isAllowed?: boolean) {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!isAllowed) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const [
        { data: profilesData, error: profileError },
        { data: depositsData },
        { data: withdrawalsData },
      ] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("deposits").select("user_id, amount"),
        supabase.from("withdrawals").select("user_id, amount"),
      ]);

      if (profileError) throw profileError;

      const depositMap: Record<string, number> = {};
      const withdrawalMap: Record<string, number> = {};

      (depositsData || []).forEach((d) => {
        depositMap[d.user_id] =
          (depositMap[d.user_id] || 0) + Number(d.amount ?? 0);
      });

      (withdrawalsData || []).forEach((w) => {
        withdrawalMap[w.user_id] =
          (withdrawalMap[w.user_id] || 0) + Number(w.amount ?? 0);
      });

      const enrichedUsers: SafeUser[] = (profilesData || []).map((user) => ({
        ...user,
        totalDeposits: depositMap[user.user_id] || 0,
        totalWithdrawals: withdrawalMap[user.user_id] || 0,
      }));

      setUsers(enrichedUsers);
    } catch (err) {
      console.error("useAdminUsers error:", err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAllowed]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("user_id", userId);

      if (error) throw error;

      await fetchUsers();
      return { success: true };
    } catch (err) {
      console.error("updateUserStatus error:", err);
      return { success: false };
    }
  };

  return {
    users,
    isLoading,
    refetch: fetchUsers,
    updateUserStatus,
  };
}

/* ========================================================
   DEPOSITS
======================================================== */

export function useAdminDeposits() {
  const [deposits, setDeposits] = useState<DepositWithPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeposits = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data: depositsData, error } = await supabase
        .from("deposits")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: plansData } = await supabase
        .from("investment_plans")
        .select("id, name, roi_percentage");

      const planMap = new Map(
        (plansData || []).map((p) => [p.id, p])
      );

      const enriched: DepositWithPlan[] = (depositsData || []).map((d) => {
        const plan = d.plan_id ? planMap.get(d.plan_id) : null;

        return {
          ...d,
          plan_name: plan?.name ?? "N/A",
          roi_percentage: Number(plan?.roi_percentage ?? 0),
        };
      });

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

/* ========================================================
   WITHDRAWALS
======================================================== */

export function useAdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWithdrawals = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setWithdrawals(data || []);
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

/* ========================================================
   INVESTMENT PLANS
======================================================== */

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

/* ========================================================
   PLATFORM SETTINGS
======================================================== */

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

/* ========================================================
   ADMIN STATS
======================================================== */

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
      const [
        { data: users },
        { data: deposits },
        { data: withdrawals },
      ] = await Promise.all([
        supabase.from("profiles").select("id"),
        supabase.from("deposits").select("amount, status"),
        supabase.from("withdrawals").select("amount"),
      ]);

      const totalUsers = users?.length ?? 0;

      const totalDeposits =
        deposits?.reduce((sum, d) => sum + Number(d.amount ?? 0), 0) ?? 0;

      const totalWithdrawals =
        withdrawals?.reduce((sum, w) => sum + Number(w.amount ?? 0), 0) ?? 0;

      const activeDeposits =
        deposits?.filter((d) => d.status === "active").length ?? 0;

      setStats({
        totalUsers,
        totalDeposits,
        totalWithdrawals,
        activeDeposits,
        totalBalance: totalDeposits - totalWithdrawals,
      });
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

/* ========================================================
   LEGACY EXPORTS (SAFE FOR DEPLOYMENT)
======================================================== */

export const useAdminPlans = useAdminInvestmentPlans;
export const useAdminUsersLegacy = useAdminUsers;
export const useAdminDepositsLegacy = useAdminDeposits;
export const useAdminWithdrawalsLegacy = useAdminWithdrawals;
export const usePlatformSettingsLegacy = usePlatformSettings;
