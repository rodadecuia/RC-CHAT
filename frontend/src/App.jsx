import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/admin/AccountsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ConnectionsPage from './pages/admin/ConnectionsPage'; // Importa a nova página

function parseJwt(token) { try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; } }

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const user = useMemo(() => token ? parseJwt(token) : null, [token]);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {token && user ? (
          <Route path="/*" element={<AuthenticatedLayout user={user} onLogout={handleLogout} />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            {user.role === 'admin' && (
              <Route path="admin/*" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="connections" element={<ConnectionsPage />} /> {/* Rota Adicionada */}
              </Route>
            )}
          </Route>
        ) : (
          <Route path="*" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}
