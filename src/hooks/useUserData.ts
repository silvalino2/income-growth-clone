import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type DepositRow = Tables<'deposits'>;
type WithdrawalRow = Tables<'withdrawals'>;

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
      // Fetch deposits (INCLUDING admin-updated fields)
      const { data: deposits, error: depositError } = await supabase
        .from('deposits')
        .select('amount, status, profit, current_balance')
        .eq('user_id', user.id);

      if (depositError) throw depositError;

      const confirmedDeposits = (deposits || []).filter(
        (d) => d.status === 'confirmed'
      );

      // Real deposited money
      const totalDeposit = confirmedDeposits.reduce(
        (sum, d) => sum + Number(d.amount || 0),
        0
      );

      // 🔥 Use admin-controlled profit (NOT ROI recalculation)
      const totalProfit = confirmedDeposits.reduce(
        (sum, d) => sum + Number((d as any).profit || 0),
        0
      );

      // 🔥 Use current_balance so admin increase/decrease reflects
      const balanceFromDeposits = confirmedDeposits.reduce(
        (sum, d) =>
          sum + Number((d as any).current_balance ?? d.amount ?? 0),
        0
      );

      // Fetch withdrawals
      const { data: withdrawals, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select('amount, status')
        .eq('user_id', user.id);

      if (withdrawalError) throw withdrawalError;

      const totalWithdrawal = (withdrawals || [])
        .filter((w) => w.status === 'approved')
        .reduce((sum, w) => sum + Number(w.amount || 0), 0);

      // Final balance (now reflects admin edits correctly)
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

    // 🔥 REALTIME: auto reflect admin percentage edits instantly
    const channel = supabase
      .channel('user-stats-realtime')
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
