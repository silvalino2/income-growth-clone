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
      // ===============================
      // 1️⃣ GET CONFIRMED DEPOSITS
      // ===============================
      const { data: deposits, error: depositError } = await supabase
        .from('deposits')
        .select('amount, status, profit, current_balance')
        .eq('user_id', user.id);

      if (depositError) throw depositError;

      const confirmedDeposits: DepositRow[] =
        (deposits || []).filter(
          (d) => d.status === 'confirmed'
        );

      // ===============================
      // 2️⃣ CALCULATE TOTAL DEPOSIT
      // ===============================
      const totalDeposit = confirmedDeposits.reduce(
        (sum, d) => sum + Number(d.amount || 0),
        0
      );

      // ===============================
      // 3️⃣ USE STORED PROFIT (ADMIN CONTROLLED)
      // ===============================
      const totalProfit = confirmedDeposits.reduce(
        (sum, d) => sum + Number(d.profit || 0),
        0
      );

      // ===============================
      // 4️⃣ USE STORED CURRENT BALANCE
      // (THIS FIXES SKYROCKET + DECREASE ISSUE)
      // ===============================
      const balanceFromDeposits = confirmedDeposits.reduce(
        (sum, d) =>
          sum + Number(d.current_balance ?? d.amount ?? 0),
        0
      );

      // ===============================
      // 5️⃣ GET APPROVED WITHDRAWALS
      // ===============================
      const { data: withdrawals, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select('amount, status')
        .eq('user_id', user.id);

      if (withdrawalError) throw withdrawalError;

      const totalWithdrawal = (withdrawals || [])
        .filter((w) => w.status === 'approved')
        .reduce((sum, w) => sum + Number(w.amount || 0), 0);

      // ===============================
      // 6️⃣ FINAL BALANCE
      // ===============================
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

    // 🔥 REALTIME: LISTEN FOR ADMIN CHANGES ON DEPOSITS
    const depositChannel = supabase
      .channel('deposits-realtime')
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

    // 🔥 REALTIME: LISTEN FOR WITHDRAWAL CHANGES
    const withdrawalChannel = supabase
      .channel('withdrawals-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawals',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(depositChannel);
      supabase.removeChannel(withdrawalChannel);
    };
  }, [user]);

  return { stats, isLoading, refetch: fetchStats };
        }
