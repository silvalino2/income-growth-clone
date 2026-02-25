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

  const fetchStats = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch user deposits including admin-updated fields
      const { data: deposits } = await supabase
        .from('deposits')
        .select('amount, status, profit, current_balance')
        .eq('user_id', user.id);

      const confirmedDeposits = (deposits || []).filter(d => d.status === 'confirmed');

      // Total deposited (confirmed)
      const totalDeposit = confirmedDeposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);

      // Use admin-controlled profit
      const totalProfit = confirmedDeposits.reduce((sum, d) => sum + Number(d.profit || 0), 0);

      // Current balance reflecting admin edits
      const totalBalance = confirmedDeposits.reduce(
        (sum, d) => sum + Number(d.current_balance ?? d.amount ?? 0),
        0
      );

      // Fetch withdrawals
      const { data: withdrawals } = await supabase
        .from('withdrawals')
        .select('amount, status')
        .eq('user_id', user.id);

      const totalWithdrawal = (withdrawals || [])
        .filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + Number(w.amount || 0), 0);

      // Final balance = admin-adjusted balance minus approved withdrawals
      setStats({
        totalBalance: totalBalance - totalWithdrawal,
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

  useEffect(() => {
    fetchStats();

    if (!user) return;

    // Realtime subscription to reflect admin changes instantly
    const channel = supabase
      .channel(`user-stats-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deposits',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { stats, isLoading, refetch: fetchStats };
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

      // Fetch plans for plan details
      const { data: plansData } = await supabase
        .from('investment_plans')
        .select('id, name, roi_percentage');

      const plansMap = new Map(plansData?.map(p => [p.id, p]) || []);

      const enrichedDeposits: DepositWithPlan[] = (depositsData || []).map(d => {
        const plan = d.plan_id ? plansMap.get(d.plan_id) : null;
        return {
          ...d,
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

    if (!user) return;

    const channel = supabase
      .channel(`user-deposits-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deposits',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchDeposits()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { deposits, isLoading, refetch: fetchDeposits };
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

    if (!user) return;

    const channel = supabase
      .channel(`user-withdrawals-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawals',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchWithdrawals()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { withdrawals, isLoading, refetch: fetchWithdrawals };
        }
