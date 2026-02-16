import ProtectedRoute from "@/components/ProtectedRoute";

// ...

<Routes>
  {/* Public Routes */}
  <Route path="/" element={<Index />} />
  <Route path="/auth" element={<Auth />} />

  {/* User Dashboard Routes (Protected) */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
  <Route
    path="/dashboard/deposits"
    element={
      <ProtectedRoute>
        <Deposits />
      </ProtectedRoute>
    }
  />
  <Route
    path="/dashboard/make-deposit"
    element={
      <ProtectedRoute>
        <MakeDeposit />
      </ProtectedRoute>
    }
  />
  <Route
    path="/dashboard/withdraw"
    element={
      <ProtectedRoute>
        <Withdraw />
      </ProtectedRoute>
    }
  />
  <Route
    path="/dashboard/referrals"
    element={
      <ProtectedRoute>
        <Referrals />
      </ProtectedRoute>
    }
  />
  <Route
    path="/dashboard/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />
  <Route
    path="/dashboard/settings"
    element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    }
  />

  {/* Admin Routes (Protected + Admin Only) */}
  <Route
    path="/admin"
    element={
      <ProtectedRoute adminOnly>
        <AdminDashboard />
      </ProtectedRoute>
    }
  />
  <Route
    path="/admin/users"
    element={
      <ProtectedRoute adminOnly>
        <AdminUsers />
      </ProtectedRoute>
    }
  />
  <Route
    path="/admin/deposits"
    element={
      <ProtectedRoute adminOnly>
        <AdminDeposits />
      </ProtectedRoute>
    }
  />
  <Route
    path="/admin/withdrawals"
    element={
      <ProtectedRoute adminOnly>
        <AdminWithdrawals />
      </ProtectedRoute>
    }
  />
  <Route
    path="/admin/plans"
    element={
      <ProtectedRoute adminOnly>
        <AdminPlans />
      </ProtectedRoute>
    }
  />
  <Route
    path="/admin/settings"
    element={
      <ProtectedRoute adminOnly>
        <AdminSettings />
      </ProtectedRoute>
    }
  />

  <Route path="*" element={<NotFound />} />
</Routes>
