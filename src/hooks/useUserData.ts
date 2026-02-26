import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type DepositRow = Tables<'deposits'>;
type WithdrawalRow = Tables<'withdrawals'>;

interface DepositWithPlan extends DepositRow {
  plan_name?: string;
  roi_percentage?: number;
}

/* =========================
   USER STATS (ADMIN-DRIVEN)
   ========================= */
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
      // 🔥 Pull admin-controlled fields
      const { data: deposits, error: depositError } = await supabase
        .from('deposits')
        .select('amount, status, profit, current_balance')
        .eq('user_id', user.id);

      if (depositError) throw depositError;

      const confirmed = (deposits || []).filter(d => d.status === 'confirmed');

      const totalDeposit = confirmed.reduce(
        (sum, d) => sum + Number(d.amount || 0),
        0
      );

      // USE admin profit (not ROI math)
      const totalProfit = confirmed.reduce(
        (sum, d) => sum + Number((d as any).profit || 0),
        0
      );

      // USE admin-edited balance
      const balanceFromDeposits = confirmed.reduce(
        (sum, d) =>
          sum + Number((d as any).current_balance ?? d.amount ?? 0),
        0
      );

      const { data: withdrawals, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select('amount, status')
        .eq('user_id', user.id);

      if (withdrawalError) throw withdrawalError;

      const totalWithdrawal = (withdrawals || [])
        .filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + Number(w.amount || 0), 0);

      const totalBalance = balanceFromDeposits - totalWithdrawal;

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

  useEffect(() => {
    fetchStats();

    if (!user) return;

    // 🔥 REALTIME sync when admin edits deposits
    const channel = supabase
      .channel('user-deposits-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deposits',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { stats, isLoading, refetch: fetchStats };
}

/* =========================
   USER DEPOSITS (REALTIME)
   ========================= */
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

      const enriched: DepositWithPlan[] = (depositsData || []).map(deposit => {
        const plan = deposit.plan_id ? plansMap.get(deposit.plan_id) : null;
        return {
          ...deposit,
          plan_name: plan?.name || 'N/A',
          roi_percentage: plan?.roi_percentage || 0,
        };
      });

      setDeposits(enriched);
    } catch (error) {
      console.error('Error fetching user deposits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();

    if (!user) return;

    // 🔥 Realtime: reflect admin increase/decrease instantly
    const channel = supabase
      .channel('user-deposits-table-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deposits',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchDeposits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { deposits, isLoading, refetch: fetchDeposits };
        }
