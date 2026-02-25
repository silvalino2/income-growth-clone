import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

type DepositRow = Tables<'deposits'>;

interface DepositWithPlan extends DepositRow {
  plan_name?: string;
  roi_percentage?: number;
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
      console.error('Error fetching user deposits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [user]);

  return { deposits, isLoading, refetch: fetchDeposits };
                                                   }
