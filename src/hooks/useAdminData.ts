const fetchDeposits = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await supabase
        .from("deposits")
        .select("*")
        .order("created_at", { ascending: false });

      if (mounted.current) setDeposits(data ?? []);
    } catch (err) {
      console.error("Admin deposits error:", err);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchDeposits();
    return () => {
      mounted.current = false;
    };
  }, [fetchDeposits]);

  return { deposits, isLoading, refetch: fetchDeposits };
}

/* =========================================================
   ADMIN WITHDRAWALS
========================================================= */

export function useAdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  const fetchWithdrawals = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await supabase
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false });

      if (mounted.current) setWithdrawals(data ?? []);
    } catch (err) {
      console.error("Admin withdrawals error:", err);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchWithdrawals();
    return () => {
      mounted.current = false;
    };
  }, [fetchWithdrawals]);

  return { withdrawals, isLoading, refetch: fetchWithdrawals };
}

/* =========================================================
   ADMIN PLANS
========================================================= */

export function useAdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await supabase
        .from("investment_plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (mounted.current) setPlans(data ?? []);
    } catch (err) {
      console.error("Admin plans error:", err);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchPlans();
    return () => {
      mounted.current = false;
    };
  }, [fetchPlans]);

  return { plans, isLoading, refetch: fetchPlans };
}

/* =========================================================
   PLATFORM SETTINGS
========================================================= */

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await supabase
        .from("platform_settings")
        .select("*")
        .single();

      if (mounted.current) setSettings(data ?? null);
    } catch (err) {
      console.error("Platform settings error:", err);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchSettings();
    return () => {
      mounted.current = false;
    };
  }, [fetchSettings]);

  return { settings, isLoading, refetch: fetchSettings };
}
