// src/hooks/useAdminData.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type UserProfile = Tables<"profiles">;
type DepositRow = Tables<"deposits">;
type WithdrawalRow = Tables<"withdrawals">;
type InvestmentPlan = Tables<"investment_plans">;

interface DepositWithPlan extends DepositRow {
  plan_name?: string;
  roi_percentage?: number;
}

interface AdminStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activeDeposits: number;
  balance: number;
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
      console.error("Error fetching all users:", err);
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
      console.error("Error fetching all deposits:", err);
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
      console.error("Error fetching all withdrawals:", err);
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
// Admin Stats Aggregator
// ----------------------------
export function useAdminStats() {
  const { users, isLoading: usersLoading } = useAdminUsers();
  const { deposits, isLoading: depositsLoading } = useAdminDeposits();
  const { withdrawals, isLoading: withdrawalsLoading } = useAdminWithdrawals();

  const totalUsers = users.length;
  const totalDeposits = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + Number(w.amount || 0), 0);
  const activeDeposits = deposits.filter((d) => d.status === "confirmed").length;
  const balance = totalDeposits - totalWithdrawals;

  const isLoading = usersLoading || depositsLoading || withdrawalsLoading;

  return {
    stats: {
      totalUsers,
      totalDeposits,
      totalWithdrawals,
      activeDeposits,
      balance,
    },
    isLoading,
  };
    }
