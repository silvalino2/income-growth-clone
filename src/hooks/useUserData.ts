import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type DepositRow = Tables<'deposits'>;
type WithdrawalRow = Tables<'withdrawals'>;
type InvestmentPlan = Tables<'investment_plans'>;

interface DepositWithPlan extends DepositRow {
  plan_name?: string;
  roi_percentage?: number;
}

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalProfit: 0,
    totalDeposit: 0,
    totalWithdrawal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // Get user's deposits
        const { data: deposits } = await supabase
          .from('deposits')
          .select('amount, status, plan_id')
          .eq('user_id', user.id);

        // Get plans for ROI calculation
        const { data: plans } = await supabase
          .from('investment_plans')
          .select('id, roi_percentage');

        const plansMap = new Map(plans?.map(p => [p.id, p.roi_percentage]) || []);

        const confirmedDeposits = deposits?.filter(d => d.status === 'confirmed') || [];
        const totalDeposit = confirmedDeposits.reduce((sum, d) => sum + Number(d.amount), 0);
        
        // Calculate profit from confirmed deposits
        const totalProfit = confirmedDeposits.reduce((sum, d) => {
          const roi = d.plan_id ? (plansMap.get(d.plan_id) || 0) : 0;
          return sum + (Number(d.amount) * (roi / 100));
        }, 0);

        // Get user's approved withdrawals
        const { data: withdrawals } = await supabase
          .from('withdrawals')
          .select('amount, status')
          .eq('user_id', user.id);

        const totalWithdrawal = withdrawals
          ?.filter(w => w.status === 'approved')
          .reduce((sum, w) => sum + Number(w.amount), 0) || 0;

        // Calculate balance
        const totalBalance = totalDeposit + totalProfit - totalWithdrawal;

        setStats({
          totalBalance,
          totalProfit,
          totalDeposit,
          totalWithdrawal,
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, isLoading };
}

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

      // Fetch plans for additional info
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
      console.error('Error fetching deposits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [user]);

  const createDeposit = async (planId: string, amount: number, paymentMethod: string, transactionHash?: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          plan_id: planId,
          amount,
          payment_method: paymentMethod,
          transaction_hash: transactionHash,
          status: 'pending',
        });

      if (error) throw error;
      await fetchDeposits();
      return { success: true };
    } catch (error) {
      console.error('Error creating deposit:', error);
      return { success: false, error };
    }
  };

  return { deposits, isLoading, createDeposit, refetch: fetchDeposits };
}

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

  const createWithdrawal = async (amount: number, walletAddress: string, paymentMethod: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount,
          wallet_address: walletAddress,
          payment_method: paymentMethod,
          status: 'pending',
        });

      if (error) throw error;
      await fetchWithdrawals();
      return { success: true };
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      return { success: false, error };
    }
  };

  return { withdrawals, isLoading, createWithdrawal, refetch: fetchWithdrawals };
}

export function useInvestmentPlans() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('investment_plans')
          .select('*')
          .eq('is_active', true)
          .order('min_amount', { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return { plans, isLoading };
}

export function usePlatformWallets() {
  const [wallets, setWallets] = useState({
    btc: '',
    eth: '',
    usdt: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('*')
          .in('key', ['btc_wallet', 'eth_wallet', 'usdt_wallet']);

        if (error) throw error;

        const walletMap: Record<string, string> = {};
        data?.forEach(item => {
          if (item.key === 'btc_wallet') walletMap.btc = item.value;
          if (item.key === 'eth_wallet') walletMap.eth = item.value;
          if (item.key === 'usdt_wallet') walletMap.usdt = item.value;
        });

        setWallets({
          btc: walletMap.btc || '',
          eth: walletMap.eth || '',
          usdt: walletMap.usdt || '',
        });
      } catch (error) {
        console.error('Error fetching wallets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallets();
  }, []);

  return { wallets, isLoading };
}
