import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type DepositRow = Tables<'deposits'>;
type WithdrawalRow = Tables<'withdrawals'>;

interface DepositWithDetails extends DepositRow {
  user_name?: string;
  user_email?: string;
  plan_name?: string;
}

interface WithdrawalWithDetails extends WithdrawalRow {
  user_name?: string;
  user_email?: string;
}

/* =========================================================
   ADMIN STATS
========================================================= */

export function useAdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDeposits: 0,
    totalWithdrawals: 0,
    platformRevenue: 0,
    totalProfit: 0,
    newUsersToday: 0,
    activeInvestments: 0,
    pendingWithdrawals: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);

      /* TOTAL USERS */
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      /* DEPOSITS */
      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('amount, status, profit, current_balance');

      if (depositsError) throw depositsError;

      const confirmedDeposits = deposits?.filter(
        (d) => d.status === 'confirmed'
      ) || [];

      const activeDeposits = confirmedDeposits.reduce(
        (sum, d) =>
          sum + Number(d.current_balance ?? d.amount ?? 0),
        0
      );

      const totalProfit = confirmedDeposits.reduce(
        (sum, d) => sum + Number(d.profit ?? 0),
        0
      );

      /* WITHDRAWALS */
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('amount, status');

      if (withdrawalsError) throw withdrawalsError;

      const approvedWithdrawals =
        withdrawals?.filter((w) => w.status === 'approved') || [];

      const totalWithdrawals = approvedWithdrawals.reduce(
        (sum, w) => sum + Number(w.amount ?? 0),
        0
      );

      const pendingWithdrawals =
        withdrawals?.filter((w) => w.status === 'pending').length || 0;

      /* NEW USERS TODAY */
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: newUsersToday, error: todayError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      if (todayError) throw todayError;

      const activeInvestments = confirmedDeposits.length;

      const platformRevenue = totalProfit * 0.1;

      if (isMounted.current) {
        setStats({
          totalUsers: totalUsers || 0,
          activeDeposits,
          totalWithdrawals,
          platformRevenue,
          totalProfit,
          newUsersToday: newUsersToday || 0,
          activeInvestments,
          pendingWithdrawals,
        });
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchStats();
    return () => {
      isMounted.current = false;
    };
  }, [fetchStats]);

  return { stats, isLoading, refetch: fetchStats };
}

/* =========================================================
   ADMIN USERS
========================================================= */

export function useAdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [userDeposits, setUserDeposits] = useState<Record<string, number>>({});
  const [userWithdrawals, setUserWithdrawals] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: deposits, error: depositsError } = await supabase
        .from('deposits')
        .select('user_id, amount, status, current_balance');

      if (depositsError) throw depositsError;

      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('user_id, amount, status');

      if (withdrawalsError) throw withdrawalsError;

      const depositsMap: Record<string, number> = {};
      deposits?.forEach((d) => {
        if (d.status === 'confirmed') {
          depositsMap[d.user_id] =
            (depositsMap[d.user_id] || 0) +
            Number(d.current_balance ?? d.amount ?? 0);
        }
      });

      const withdrawalsMap: Record<string, number> = {};
      withdrawals?.forEach((w) => {
        if (w.status === 'approved') {
          withdrawalsMap[w.user_id] =
            (withdrawalsMap[w.user_id] || 0) +
            Number(w.amount ?? 0);
        }
      });

      if (isMounted.current) {
        setUsers(profiles || []);
        setUserDeposits(depositsMap);
        setUserWithdrawals(withdrawalsMap);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchUsers();

    const channel = supabase
      .channel('admin-users-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deposits' }, fetchUsers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, fetchUsers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchUsers)
      .subscribe();

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchUsers]);

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId); // ✅ safer primary key usage

      if (error) throw error;

      await fetchUsers();
      return { success: true };
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, error };
    }
  };

  return {
    users,
    userDeposits,
    userWithdrawals,
    isLoading,
    updateUserStatus,
    refetch: fetchUsers,
  };
}

/* =========================================================
   ADMIN DEPOSITS
========================================================= */

export function useAdminDeposits() {
  const [deposits, setDeposits] = useState<DepositWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchDeposits = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      if (profilesError) throw profilesError;

      const { data: plansData, error: plansError } = await supabase
        .from('investment_plans')
        .select('id, name');

      if (plansError) throw plansError;

      const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);
      const plansMap = new Map(plansData?.map((p) => [p.id, p]) || []);

      const enrichedDeposits: DepositWithDetails[] =
        depositsData?.map((d) => {
          const profile = profilesMap.get(d.user_id);
          const plan = d.plan_id ? plansMap.get(d.plan_id) : null;

          return {
            ...d,
            user_name: profile?.full_name || 'Unknown',
            user_email: profile?.email || 'Unknown',
            plan_name: plan?.name || 'N/A',
          };
        }) || [];

      if (isMounted.current) setDeposits(enrichedDeposits);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchDeposits();
    return () => {
      isMounted.current = false;
    };
  }, [fetchDeposits]);

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

/* =========================================================
   ADMIN WITHDRAWALS
========================================================= */

export function useAdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchWithdrawals = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      if (profilesError) throw profilesError;

      const profilesMap = new Map(
        profilesData?.map((p) => [p.id, p]) || []
      );

      const enrichedWithdrawals: WithdrawalWithDetails[] =
        withdrawalsData?.map((w) => {
          const profile = profilesMap.get(w.user_id);

          return {
            ...w,
            user_name: profile?.full_name || 'Unknown',
            user_email: profile?.email || 'Unknown',
          };
        }) || [];

      if (isMounted.current) setWithdrawals(enrichedWithdrawals);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchWithdrawals();

    const channel = supabase
      .channel('admin-withdrawals-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'withdrawals' },
        fetchWithdrawals
      )
      .subscribe();

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchWithdrawals]);

  const updateWithdrawalStatus = async (
    withdrawalId: string,
    status: string
  ) => {
    try {
      const updateData: { status: string; approved_at?: string } = { status };

      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
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

  return {
    withdrawals,
    isLoading,
    updateWithdrawalStatus,
    refetch: fetchWithdrawals,
  };
                                                      }
/* =========================================================
   ADMIN PLANS
========================================================= */

export function useAdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('investment_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (isMounted.current) {
        setPlans(data || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchPlans();

    const channel = supabase
      .channel('admin-plans-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'investment_plans' },
        fetchPlans
      )
      .subscribe();

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchPlans]);

  const createPlan = async (planData: any) => {
    try {
      const { error } = await supabase
        .from('investment_plans')
        .insert([planData]);

      if (error) throw error;

      await fetchPlans();
      return { success: true };
    } catch (error) {
      console.error('Error creating plan:', error);
      return { success: false, error };
    }
  };

  const updatePlan = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('investment_plans')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchPlans();
      return { success: true };
    } catch (error) {
      console.error('Error updating plan:', error);
      return { success: false, error };
    }
  };

  const deletePlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('investment_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchPlans();
      return { success: true };
    } catch (error) {
      console.error('Error deleting plan:', error);
      return { success: false, error };
    }
  };

  return {
    plans,
    isLoading,
    createPlan,
    updatePlan,
    deletePlan,
    refetch: fetchPlans,
  };
                            }
