// ==========================================
// CLIENT APP COMPONENT (client/src/App.jsx)
// Urdu Comment: React root application component
// ==========================================

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { getUserProfile, logoutUser } from './services/api';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentPage, setCurrentPage] = useState('login');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setInitializing(false);
        setCurrentPage('login');
        return;
      }

      try {
        const res = await getUserProfile();
        if (res.success && res.user) {
          setUser(res.user);
          setCurrentPage('dashboard');
        } else {
          handleLogout();
        }
      } catch (e) {
        handleLogout();
      } finally {
        setInitializing(false);
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await logoutUser();
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('login');
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading Login System...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        user={user}
        onLogout={handleLogout}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <main className="flex-1">
        {currentPage === 'login' && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigateRegister={() => setCurrentPage('register')}
          />
        )}
        {currentPage === 'register' && (
          <Register
            onRegisterSuccess={() => setCurrentPage('login')}
            onNavigateLogin={() => setCurrentPage('login')}
          />
        )}
        {currentPage === 'dashboard' && (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            token={token}
          />
        )}
      </main>
    </div>
  );
}
