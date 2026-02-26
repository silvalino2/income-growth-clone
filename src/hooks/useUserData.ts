import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type DepositRow = Tables<'deposits'>;
type InvestmentPlan = Tables<'investment_plans'>;
type PlatformWallet = Tables<'platform_wallets'>;

interface DepositWithPlan extends DepositRow {
  plan_name?: string;
  roi_percentage?: number;
}

// ----------------------------
// User Deposits Hook
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

      const plansMap = new Map(plansData?.map(p => [p.id, p]) || []);

      const enrichedDeposits: DepositWithPlan[] = (depositsData || []).map(deposit => {
        const plan = deposit.plan_id ? plansMap.get(deposit.plan_id) : null;
        return {
          ...deposit,
          plan_name: plan?.name || 'N/A',
          roi_percentage: plan?.roi_percentage || 0,
        };
      });

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

  return { deposits, isLoading, refetch: fetchDeposits };
}

// ----------------------------
// User Stats Hook
// ----------------------------
export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalDeposit: 0,
    totalWithdrawal: 0,
    totalProfit: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const { data: depositsData, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalDeposit = depositsData?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const totalWithdrawal = depositsData?.reduce((sum, d) => sum + Number(d.withdrawal_amount || 0), 0) || 0;
      const totalProfit = depositsData?.reduce((sum, d) => sum + (Number(d.amount) * ((d.roi_percentage || 0) / 100)), 0) || 0;
      const totalBalance = totalDeposit + totalProfit - totalWithdrawal;

      setStats({ totalBalance, totalDeposit, totalWithdrawal, totalProfit });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return { stats, isLoading, refetch: fetchStats };
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
      const { data, error } = await supabase.from('platform_wallets').select('*');
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
