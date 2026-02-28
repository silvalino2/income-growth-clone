import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type DepositRow = Tables<'deposits'>;
type InvestmentPlan = Tables<'investment_plans'>;
type PlatformWallet = Tables<'platform_wallets'>;
type WithdrawalRow = Tables<'withdrawals'>;

interface DepositWithPlan extends DepositRow {
  plan_name?: string;
  roi_percentage?: number;
}

interface UserStats {
  totalDeposits: number;
  totalWithdrawals: number;
  activeDeposits: number;
  balance: number;
}

// ----------------------------
// User Stats Hook (FIXES DASHBOARD ERROR)
// ----------------------------
export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    activeDeposits: 0,
    balance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch deposits
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id);

      if (depositsError) throw depositsError;

      // Fetch withdrawals
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id);

      if (withdrawalsError) throw withdrawalsError;

      const totalDeposits =
        deposits?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0;

      const totalWithdrawals =
        withdrawals?.reduce((sum, w) => sum + Number(w.amount || 0), 0) || 0;

      const activeDeposits =
        deposits?.filter((d) => d.status === 'active').length || 0;

      const balance = totalDeposits - totalWithdrawals;

      setStats({
        totalDeposits,
        totalWithdrawals,
        activeDeposits,
        balance,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats };
}

// ----------------------------
// User Deposits Hook (ADMIN EDIT REFLECTION)
// ----------------------------
export function useUserDeposits() {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<DepositWithPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeposits = async () => {
    if (!user) return;

    try {
      const { data: depositsData, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: plansData } = await supabase
        .from('investment_plans')
        .select('id, name, roi_percentage');

      const plansMap = new Map(
        plansData?.map((p) => [p.id, p]) || []
      );

      const enrichedDeposits: DepositWithPlan[] = (depositsData || []).map(
        (deposit) => {
          const plan = deposit.plan_id
            ? plansMap.get(deposit.plan_id)
            : null;

          return {
            ...deposit,
            plan_name: plan?.name || 'N/A',
            roi_percentage: plan?.roi_percentage || 0,
          };
        }
      );

      setDeposits(enrichedDeposits);
    } catch (error) {
      console.error('Error fetching user deposits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [user]);

  const createDeposit = async (
    planId: string,
    amount: number,
    method: string
  ) => {
    if (!user) return { success: false, error: 'not authenticated' };
    try {
      const { error } = await supabase.from('deposits').insert({
        user_id: user.id,
        plan_id: planId,
        amount,
        method,
        status: 'pending',
      });
      if (error) throw error;
      await fetchDeposits();
      return { success: true, error: null };
    } catch (err) {
      console.error('createDeposit error:', err);
      return { success: false, error: err };
    }
  };

  return { deposits, isLoading, refetch: fetchDeposits, createDeposit };
}

// ----------------------------
// User Withdrawals Hook (FIXES VERCEL BUILD ERROR)
// ----------------------------
export function useUserWithdrawals() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWithdrawals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [user]);

  const createWithdrawal = async (
    amount: number,
    address: string,
    method: string
  ) => {
    if (!user) return { success: false, error: 'not authenticated' };
    try {
      const { error } = await supabase.from('withdrawals').insert({
        user_id: user.id,
        amount,
        address,
        method,
        status: 'pending',
      });
      if (error) throw error;
      await fetchWithdrawals();
      return { success: true, error: null };
    } catch (err) {
      console.error('createWithdrawal error:', err);
      return { success: false, error: err };
    }
  };

  return { withdrawals, isLoading, refetch: fetchWithdrawals, createWithdrawal };
}

// ----------------------------
// Investment Plans Hook
// ----------------------------
export function useInvestmentPlans() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('investment_plans')
        .select('*')
        .order('min_amount', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching investment plans:', error);
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
// Platform Wallets Hook
// ----------------------------
export function usePlatformWallets() {
  const [wallets, setWallets] = useState<PlatformWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_wallets')
        .select('*');

      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error('Error fetching platform wallets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  return { wallets, isLoading, refetch: fetchWallets };
        }
