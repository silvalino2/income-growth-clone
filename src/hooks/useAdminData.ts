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
  totalDeposits: number;
  lastLogin: string;
}

interface DepositWithPlan extends DepositRow {
  plan_name: string;
  roi_percentage: number;
}

interface AdminStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activeDeposits: number;
  totalBalance: number;
}

// ========================================================
// USERS
// ========================================================

export function useAdminUsers() {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        console.error("Profiles error:", error);
        setUsers([]);
        return;
      }

      const { data: depositsData } = await supabase
        .from("deposits")
        .select("user_id, amount");

      const depositsMap = new Map<string, number>();

      (depositsData || []).forEach((d) => {
        const prev = depositsMap.get(d.user_id) || 0;
        depositsMap.set(d.user_id, prev + Number(d.amount ?? 0));
      });

      const safeUsers: SafeUser[] = (profilesData || []).map((u) => ({
        ...u,
        totalDeposits: Number(depositsMap.get(u.id) ?? 0),
        lastLogin:
          typeof u.last_sign_in_at === "string" && u.last_sign_in_at.length > 0
            ? u.last_sign_in_at
            : "Never",
      }));

      setUsers(safeUsers);
    } catch (err) {
      console.error("Unexpected error:", err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    refetch: fetchUsers,
  };
}

// ========================================================
// DEPOSITS
// ========================================================

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

      if (error) {
        console.error(error);
        setDeposits([]);
        return;
      }

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
      console.error(err);
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
// WITHDRAWALS
// ========================================================

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

      if (error) {
        console.error(error);
        setWithdrawals([]);
        return;
      }

      setWithdrawals(data || []);
    } catch (err) {
      console.error(err);
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
// INVESTMENT PLANS
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

      if (error) {
        console.error(error);
        setPlans([]);
        return;
      }

      setPlans(data || []);
    } catch (err) {
      console.error(err);
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
// PLATFORM SETTINGS
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

      if (error) {
        console.error(error);
        setSettings(null);
        return;
      }

      setSettings(data);
    } catch (err) {
      console.error(err);
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
// ADMIN STATS
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
      console.error(err);
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
// EXPORT ALIASES (VERY IMPORTANT FOR DEPLOYMENT)
// ========================================================

export const useAdminPlans = useAdminInvestmentPlans;
export const useAdminUsersLegacy = useAdminUsers;
export const useAdminDepositsLegacy = useAdminDeposits;
export const useAdminWithdrawalsLegacy = useAdminWithdrawals;
export const usePlatformSettingsLegacy = usePlatformSettings;
