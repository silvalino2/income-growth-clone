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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users count
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get confirmed deposits total
        const { data: deposits } = await supabase
          .from('deposits')
          .select('amount, status');

        const activeDeposits = deposits
          ?.filter(d => d.status === 'confirmed')
          .reduce((sum, d) => sum + Number(d.amount), 0) || 0;

        // Get approved withdrawals total
        const { data: withdrawals } = await supabase
          .from('withdrawals')
          .select('amount, status');

        const totalWithdrawals = withdrawals
          ?.filter(w => w.status === 'approved')
          .reduce((sum, w) => sum + Number(w.amount), 0) || 0;

        const pendingWithdrawals = withdrawals
          ?.filter(w => w.status === 'pending').length || 0;

        // Get users created today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: newUsersToday } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString());

        // Get active investments (confirmed deposits)
        const activeInvestments = deposits?.filter(d => d.status === 'confirmed').length || 0;

        // Platform revenue is 10% of confirmed deposits (example)
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

    fetchStats();
  }, []);

  return { stats, isLoading };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [userDeposits, setUserDeposits] = useState<Record<string, number>>({});
  const [userWithdrawals, setUserWithdrawals] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);

      // Fetch deposits totals for each user
      const { data: deposits } = await supabase
        .from('deposits')
        .select('user_id, amount, status');

      const depositsMap: Record<string, number> = {};
      deposits?.forEach(d => {
        if (d.status === 'confirmed') {
          depositsMap[d.user_id] = (depositsMap[d.user_id] || 0) + Number(d.amount);
        }
      });
      setUserDeposits(depositsMap);

      // Fetch withdrawals totals for each user
      const { data: withdrawals } = await supabase
        .from('withdrawals')
        .select('user_id, amount, status');

      const withdrawalsMap: Record<string, number> = {};
      withdrawals?.forEach(w => {
        if (w.status === 'approved') {
          withdrawalsMap[w.user_id] = (withdrawalsMap[w.user_id] || 0) + Number(w.amount);
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
      // Fetch deposits
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;

      // Fetch profiles for user info
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');

      // Fetch plans for plan names
      const { data: plansData } = await supabase
        .from('investment_plans')
        .select('id, name');

      // Create lookup maps
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      const plansMap = new Map(plansData?.map(p => [p.id, p]) || []);

      // Combine data
      const enrichedDeposits: DepositWithDetails[] = (depositsData || []).map(deposit => {
        const profile = profilesMap.get(deposit.user_id);
        const plan = deposit.plan_id ? plansMap.get(deposit.plan_id) : null;
        return {
          ...deposit,
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
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      }

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

export function useAdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      // Fetch withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      // Fetch profiles for user info
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email');

      // Create lookup map
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      // Combine data
      const enrichedWithdrawals: WithdrawalWithDetails[] = (withdrawalsData || []).map(withdrawal => {
        const profile = profilesMap.get(withdrawal.user_id);
        return {
          ...withdrawal,
          user_name: profile?.full_name || 'Unknown',
          user_email: profile?.email || 'Unknown',
        };
      });

      setWithdrawals(enrichedWithdrawals);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const updateWithdrawalStatus = async (withdrawalId: string, status: string) => {
    try {
      const updateData: { status: string; processed_at?: string } = { status };
      if (status === 'approved' || status === 'rejected') {
        updateData.processed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('withdrawals')
        .update(updateData)
        .eq('id', withdrawalId);

      if (error) throw error;
      await fetchWithdrawals();
      return { success: true };
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      return { success: false, error };
    }
  };

  return { withdrawals, isLoading, updateWithdrawalStatus, refetch: fetchWithdrawals };
}

export function useAdminPlans() {
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
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const updatePlan = async (planId: string, updates: Partial<InvestmentPlan>) => {
    try {
      const { error } = await supabase
        .from('investment_plans')
        .update(updates)
        .eq('id', planId);

      if (error) throw error;
      await fetchPlans();
      return { success: true };
    } catch (error) {
      console.error('Error updating plan:', error);
      return { success: false, error };
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('investment_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      await fetchPlans();
      return { success: true };
    } catch (error) {
      console.error('Error deleting plan:', error);
      return { success: false, error };
    }
  };

  const createPlan = async (plan: Omit<InvestmentPlan, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('investment_plans')
        .insert(plan);

      if (error) throw error;
      await fetchPlans();
      return { success: true };
    } catch (error) {
      console.error('Error creating plan:', error);
      return { success: false, error };
    }
  };

  return { plans, isLoading, updatePlan, deletePlan, createPlan, refetch: fetchPlans };
}

export function usePlatformSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');

      if (error) throw error;
      
      const settingsMap: Record<string, string> = {};
      data?.forEach(item => {
        settingsMap[item.key] = item.value;
      });
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (error) throw error;
      await fetchSettings();
      return { success: true };
    } catch (error) {
      console.error('Error updating setting:', error);
      return { success: false, error };
    }
  };

  return { settings, isLoading, updateSetting, refetch: fetchSettings };
}
