// src/hooks/useAdminData.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

// ----------------------------
// Type Definitions
// ----------------------------
type UserProfile = Tables<"profiles">;
type DepositRow = Tables<"deposits">;
type WithdrawalRow = Tables<"withdrawals">;
type InvestmentPlan = Tables<"investment_plans">;
type PlatformSettingsRow = Tables<"platform_settings">;

interface DepositWithPlan extends DepositRow {
  plan_name?: string;
  roi_percentage?: number;
}

interface AdminStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activeDeposits: number;
  totalBalance: number;
}

// ----------------------------
// Fetch All Users
// ----------------------------
export function useAdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, isLoading, refetch: fetchUsers };
}

// ----------------------------
// Fetch All Deposits
// ----------------------------
export function useAdminDeposits() {
  const [deposits, setDeposits] = useState<DepositWithPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeposits = async () => {
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

      const plansMap = new Map(plansData?.map((p) => [p.id, p]) || []);

      const enrichedDeposits: DepositWithPlan[] = (depositsData || []).map(
        (deposit) => {
          const plan = deposit.plan_id ? plansMap.get(deposit.plan_id) : null;
          return {
            ...deposit,
            plan_name: plan?.name || "N/A",
            roi_percentage: plan?.roi_percentage || 0,
          };
        }
      );

      setDeposits(enrichedDeposits);
    } catch (err) {
      console.error("Error fetching deposits:", err);
      setDeposits([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  return { deposits, isLoading, refetch: fetchDeposits };
}

// ----------------------------
// Fetch All Withdrawals
// ----------------------------
export function useAdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      setWithdrawals(data || []);
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
      setWithdrawals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return { withdrawals, isLoading, refetch: fetchWithdrawals };
}

// ----------------------------
// Fetch All Investment Plans
// ----------------------------
export function useAdminInvestmentPlans() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("investment_plans")
        .select("*")
        .order("min_amount", { ascending: true });
      if (error) throw error;

      setPlans(data || []);
    } catch (err) {
      console.error("Error fetching investment plans:", err);
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return { plans, isLoading, refetch: fetchPlans };
}

// ----------------------------
// Fetch Platform Settings
// ----------------------------
export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettingsRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .single();
      if (error) throw error;

      setSettings(data || null);
    } catch (err) {
      console.error("Error fetching platform settings:", err);
      setSettings(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, isLoading, refetch: fetchSettings };
}

// ----------------------------
// Fetch Admin Stats
// ----------------------------
export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    activeDeposits: 0,
    totalBalance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [{ data: usersData }, { data: depositsData }, { data: withdrawalsData }] =
        await Promise.all([
          supabase.from("profiles").select("*"),
          supabase.from("deposits").select("*"),
          supabase.from("withdrawals").select("*"),
        ]);

      const totalUsers = usersData?.length || 0;
      const totalDeposits = depositsData?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0;
      const totalWithdrawals = withdrawalsData?.reduce((sum, w) => sum + Number(w.amount || 0), 0) || 0;
      const activeDeposits = depositsData?.filter((d) => d.status === "active").length || 0;
      const totalBalance = totalDeposits - totalWithdrawals;

      setStats({ totalUsers, totalDeposits, totalWithdrawals, activeDeposits, totalBalance });
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, isLoading, refetch: fetchStats };
}

// ----------------------------
// Aliases for backward compatibility
// ----------------------------
export const useAdminPlans = useAdminInvestmentPlans;
export const useAdminUsersLegacy = useAdminUsers;
export const useAdminDepositsLegacy = useAdminDeposits;
export const useAdminWithdrawalsLegacy = useAdminWithdrawals;
