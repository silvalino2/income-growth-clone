import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";export function useAdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [userBalances, setUserBalances] = useState<Record<string, number>>({});
  const [userProfits, setUserProfits] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const calculateBalance = (
    deposits: number,
    withdrawals: number,
    percentage: number
  ) => {
    const net = deposits - withdrawals;

    // Apply percentage correctly (supports increase AND decrease)
    const profitAmount = (net * percentage) / 100;
    const finalBalance = net + profitAmount;

    // Prevent weird float inflation
    return Number(finalBalance.toFixed(2));
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch users with profit percentage
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // 2. Fetch confirmed deposits
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('user_id, amount, status');

      if (depositsError) throw depositsError;

      // 3. Fetch approved withdrawals
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('user_id, amount, status');

      if (withdrawalsError) throw withdrawalsError;

      const depositMap: Record<string, number> = {};
      const withdrawalMap: Record<string, number> = {};
      const balanceMap: Record<string, number> = {};
      const profitMap: Record<string, number> = {};

      // Sum confirmed deposits per user
      deposits?.forEach((d) => {
        if (d.status === 'confirmed') {
          depositMap[d.user_id] =
            (depositMap[d.user_id] || 0) + Number(d.amount);
        }
      });

      // Sum approved withdrawals per user
      withdrawals?.forEach((w) => {
        if (w.status === 'approved') {
          withdrawalMap[w.user_id] =
            (withdrawalMap[w.user_id] || 0) + Number(w.amount);
        }
      });

      // Calculate REAL balance using percentage (ADMIN CONTROLLED)
      profiles?.forEach((user) => {
        const depositsTotal = depositMap[user.user_id] || 0;
        const withdrawalsTotal = withdrawalMap[user.user_id] || 0;
        const percentage = Number(user.profit_percentage || 0);

        const net = depositsTotal - withdrawalsTotal;
        const profitValue = (net * percentage) / 100;
        const finalBalance = calculateBalance(
          depositsTotal,
          withdrawalsTotal,
          percentage
        );

        balanceMap[user.user_id] = finalBalance;
        profitMap[user.user_id] = Number(profitValue.toFixed(2));
      });

      setUsers(profiles || []);
      setUserBalances(balanceMap);
      setUserProfits(profitMap);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // 🔴 REAL-TIME SYNC (THIS FIXES "NOT REFLECTING" ISSUE)
    const channel = supabase
      .channel('admin-users-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchUsers()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deposits' },
        () => fetchUsers()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'withdrawals' },
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('user_id', userId);

      if (error) throw error;

      await fetchUsers(); // instant refresh
      return { success: true };
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, error };
    }
  };

  return {
    users,
    userBalances, // ✅ USE THIS IN DASHBOARD
    userProfits,  // ✅ SHOW CURRENT PROFIT
    isLoading,
    updateUserStatus,
    refetch: fetchUsers,
  };
}
