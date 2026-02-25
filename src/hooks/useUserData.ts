import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Deposit {
  amount: number | null;
  status: string | null;
  profit?: number | null;
  current_balance?: number | null;
}

interface Withdrawal {
  amount: number | null;
  status: string | null;
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
      // Fetch deposits (includes admin-edited fields)
      const { data: deposits, error: depositError } = await supabase
        .from('deposits')
        .select('amount, status, profit, current_balance')
        .eq('user_id', user.id);

      if (depositError) throw depositError;

      const confirmedDeposits: Deposit[] =
        (deposits || []).filter(
          (d: Deposit) => d.status === 'confirmed'
        );

      // Total deposited (original money)
      const totalDeposit = confirmedDeposits.reduce(
        (sum, d) => sum + Number(d.amount || 0),
        0
      );

      // Admin-controlled profit (no recalculation)
      const totalProfit = confirmedDeposits.reduce(
        (sum, d) => sum + Number(d.profit || 0),
        0
      );

      // CRITICAL: Use current_balance so admin increase/decrease reflects
      const balanceFromDeposits = confirmedDeposits.reduce(
        (sum, d) =>
          sum + Number(
            d.current_balance !== null && d.current_balance !== undefined
              ? d.current_balance
              : d.amount || 0
          ),
        0
      );

      // Fetch withdrawals
      const { data: withdrawals, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select('amount, status')
        .eq('user_id', user.id);

      if (withdrawalError) throw withdrawalError;

      const totalWithdrawal = (withdrawals as Withdrawal[] || [])
        .filter((w) => w.status === 'approved')
        .reduce((sum, w) => sum + Number(w.amount || 0), 0);

      // Final balance (reflects admin edits properly)
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
