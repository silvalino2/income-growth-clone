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

export function useAdminStats() {
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
    if (typeof window === "undefined") return; // client-only

    try {
      setIsLoading(true);

      const { count: totalUsers } = await supabase
        .from<Profile>("profiles")
        .select("*", { count: "exact", head: true });

      const { data: deposits } = await supabase
        .from<Deposit>("deposits")
        .select("amount, current_balance, profit, status");

      const { data: withdrawals } = await supabase
        .from<Withdrawal>("withdrawals")
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
  }, []);

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

function useAdminTable<T extends Tables<string>>(table: string) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(false);

  const fetchData = useCallback(async () => {
    if (typeof window === "undefined") return; // client-only

    try {
      setIsLoading(true);
      const { data } = await supabase.from<T>(table).select("*").order("created_at", { ascending: false });
      if (mounted.current) setData(data ?? []);
    } catch (err) {
      console.error(`Admin ${table} error:`, err);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, [table]);

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

export const useAdminUsers = () => useAdminTable<Profile>("profiles");
export const useAdminDeposits = () => useAdminTable<Deposit>("deposits");
export const useAdminWithdrawals = () => useAdminTable<Withdrawal>("withdrawals");
export const useAdminPlans = () => useAdminTable<Plan>("investment_plans");

/* =========================================================
   PLATFORM SETTINGS
========================================================= */

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(false);

  const fetchSettings = useCallback(async () => {
    if (typeof window === "undefined") return; // client-only

    try {
      setIsLoading(true);
      const { data } = await supabase.from<PlatformSettings>("platform_settings").select("*").single();
      if (mounted.current) setSettings(data ?? null);
    } catch (err) {
      console.error("Platform settings error:", err);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchSettings();
    return () => {
      mounted.current = false;
    };
  }, [fetchSettings]);

  return { settings, isLoading, refetch: fetchSettings };
      }
