import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type DepositRow = Tables<'deposits'>;
type WithdrawalRow = Tables<'withdrawals'>;
type InvestmentPlan = Tables<'investment_plans'>;

interface DepositWithDetails extends DepositRow {
  user_name?: string;
  user_email?: string;
  plan_name?: string;
}

interface WithdrawalWithDetails extends WithdrawalRow {
  user_name?: string;
  user_email?: string;
}

export function useAdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDeposits: 0,
    totalWithdrawals: 0,
    platformRevenue: 0,
    newUsersToday: 0,
    activeInvestments: 0,
    pendingWithdrawals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { data: deposits } = await supabase
        .from('deposits')
        .select('amount, status, profit, current_balance');

      const activeDeposits = deposits
        ?.filter(d => d.status === 'confirmed')
        .reduce((sum, d) => sum + Number(d.current_balance ?? d.amount ?? 0), 0) || 0;

      const totalProfit = deposits
        ?.filter(d => d.status === 'confirmed')
        .reduce((sum, d) => sum + Number(d.profit ?? 0), 0) || 0;

      const { data: withdrawals } = await supabase
        .from('withdrawals')
        .select('amount, status');

      const totalWithdrawals = withdrawals
        ?.filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + Number(w.amount ?? 0), 0) || 0;

      const pendingWithdrawals = withdrawals
        ?.filter(w => w.status === 'pending').length || 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      const activeInvestments = deposits?.filter(d => d.status === 'confirmed').length || 0;

      const platformRevenue = activeDeposits * 0.1;

      setStats({
        totalUsers: totalUsers || 0,
        activeDeposits,
        totalWithdrawals,
        platformRevenue,
        newUsersToday: newUsersToday || 0,
        activeInvestments,
        pendingWithdrawals,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, totalProfit: 0, isLoading, refetch: fetchStats };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [userDeposits, setUserDeposits] = useState<Record<string, number>>({});
  const [userWithdrawals, setUserWithdrawals] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      setUsers(data || []);

      const { data: deposits } = await supabase
        .from('deposits')
        .select('user_id, amount, status, current_balance');

      const depositsMap: Record<string, number> = {};
      deposits?.forEach(d => {
        if (d.status === 'confirmed') {
          depositsMap[d.user_id] = (depositsMap[d.user_id] || 0) + Number(d.current_balance ?? d.amount ?? 0);
        }
      });
      setUserDeposits(depositsMap);

      const { data: withdrawals } = await supabase
        .from('withdrawals')
        .select('user_id, amount, status');

      const withdrawalsMap: Record<string, number> = {};
      withdrawals?.forEach(w => {
        if (w.status === 'approved') {
          withdrawalsMap[w.user_id] = (withdrawalsMap[w.user_id] || 0) + Number(w.amount ?? 0);
        }
      });
      setUserWithdrawals(withdrawalsMap);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('admin-users-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deposits' },
        () => fetchUsers().catch(console.error)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('user_id', userId);

      if (error) throw error;
      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, error };
    }
  };

  return { users, userDeposits, userWithdrawals, isLoading, updateUserStatus, refetch: fetchUsers };
}

export function useAdminDeposits() {
  const [deposits, setDeposits] = useState<DepositWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeposits = async () => {
    try {
      const { data: depositsData } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');

      const { data: plansData } = await supabase
        .from('investment_plans')
        .select('id, name');

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      const plansMap = new Map(plansData?.map(p => [p.id, p]) || []);

      const enrichedDeposits: DepositWithDetails[] = (depositsData || []).map(d => {
        const profile = profilesMap.get(d.user_id);
        const plan = d.plan_id ? plansMap.get(d.plan_id) : null;
        return {
          ...d,
          user_name: profile?.full_name || 'Unknown',
          user_email: profile?.email || 'Unknown',
          plan_name: plan?.name || 'N/A',
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
  }, []);

  const updateDepositStatus = async (depositId: string, status: string) => {
    try {
      const updateData: { status: string; confirmed_at?: string } = { status };
      if (status === 'confirmed') updateData.confirmed_at = new Date().toISOString();

      const { error } = await supabase
        .from('deposits')
        .update(updateData)
        .eq('id', depositId);

      if (error) throw error;
      await fetchDeposits();
      return { success: true };
    } catch (error) {
      console.error('Error updating deposit status:', error);
      return { success: false, error };
    }
  };

  return { deposits, isLoading, updateDepositStatus, refetch: fetchDeposits };
             }
