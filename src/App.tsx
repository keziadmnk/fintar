import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ConsentProvider } from './context/ConsentContext';
import { TransactionProvider } from './context/TransactionContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { Reports } from './pages/Reports';
import { Scan } from './pages/Scan';
import { Assistant } from './pages/Assistant';
import { Profile } from './pages/Profile';
import { Alerts } from './pages/Alerts';
import { Funding } from './pages/Funding';
import { Protect } from './pages/Protect';
import { Activity } from './pages/Activity';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { Currency } from './types';

export function App() {
  const [currency, setCurrency] = useState<Currency>('IDR');

  return (
    <AuthProvider>
      <ConsentProvider>
        <TransactionProvider>
          <Router>
            <AppShell currency={currency} onCurrencyChange={setCurrency}>
              <Routes>
                {/* Public auth & onboarding routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />

                {/* Protected app routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Home currency={currency} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Reports currency={currency} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scan"
                  element={
                    <ProtectedRoute>
                      <Scan currency={currency} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assistant"
                  element={
                    <ProtectedRoute>
                      <Assistant currency={currency} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile currency={currency} onCurrencyChange={setCurrency} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/alerts"
                  element={
                    <ProtectedRoute>
                      <Alerts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/funding"
                  element={
                    <ProtectedRoute>
                      <Funding currency={currency} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/protect"
                  element={
                    <ProtectedRoute>
                      <Protect currency={currency} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activity"
                  element={
                    <ProtectedRoute>
                      <Activity />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </Router>
        </TransactionProvider>
      </ConsentProvider>
    </AuthProvider>
  );
}

export default App;
