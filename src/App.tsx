// ==========================================
// MAIN APP COMPONENT
// Urdu Comment: Yeh main React App component hai jo routing, authentication check aur overall layout control karta hai
// ==========================================

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyProducts from './pages/MyProducts';
import NotFound from './pages/NotFound';
import { getUserProfile, logoutUser } from './services/api';
import { Loader2 } from 'lucide-react';

export default function App() {
  // State management
  // Urdu Comment: Current page status, auth token aur user state
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Initial Authentication Check on Page Refresh / Load
  // Urdu Comment: Page load hone par check kar rahe hain ke pehle se user ka valid session mojood hai ya nahi
  useEffect(() => {
    const checkAuthStatus = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUserStr = localStorage.getItem('user');

      if (!savedToken) {
        setIsInitializing(false);
        setCurrentPage('login');
        return;
      }

      try {
        // Try restoring user from LocalStorage first for speed
        if (savedUserStr) {
          try {
            const parsedUser = JSON.parse(savedUserStr);
            setUser(parsedUser);
            setCurrentPage('dashboard');
          } catch (e) {
            console.error('User parse error:', e);
          }
        }

        // Verify with backend API
        const response = await getUserProfile();
        if (response.success && response.user) {
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
          setCurrentPage('dashboard');
        } else {
          // Token invalid -> Logout
          handleLogout();
        }
      } catch (error) {
        console.log('Session verification error, redirecting to login:', error);
        handleLogout();
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login Handler
  // Urdu Comment: Kamyab login ke baad state aur storage update karne ka function
  const handleLoginSuccess = (newToken: string, userData: { id: number; name: string; email: string }) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  // Logout Handler
  // Urdu Comment: Logout hone par token aur user state clear karne ka function
  const handleLogout = async () => {
    await logoutUser();
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('login');
  };

  // Protected Navigation guard
  // Urdu Comment: Unauthenticated user ko protected dashboard se rokna aur login par redirect karna
  const handleNavigate = (page: string) => {
    if ((page === 'dashboard' || page === 'products' || page === 'add-product') && !token) {
      setCurrentPage('login');
      return;
    }
    if ((page === 'login' || page === 'register') && token) {
      setCurrentPage('dashboard');
      return;
    }
    setCurrentPage(page);
  };

  // Initializing Splash Screen
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-[#F5F5F0] space-y-4 font-mono">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center animate-pulse">
          <div className="w-4 h-4 bg-black"></div>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          Authenticating System Protocol...
        </p>
        <p className="text-[10px] text-white/30">// Urdu Comment: Session verify ho raha hai...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F0] flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Navigation Header Bar */}
      {/* Urdu Comment: Har screen par persistent Navigation header bar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        currentPage={currentPage}
        setCurrentPage={handleNavigate}
      />

      {/* Main View Area (Protected & Public Pages) */}
      {/* Urdu Comment: Navigation ke mutabiq screen content switch kar rahe hain */}
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
          token ? (
            <Dashboard
              user={user}
              onLogout={handleLogout}
              token={token}
              onNavigate={handleNavigate}
            />
          ) : (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onNavigateRegister={() => setCurrentPage('register')}
            />
          )
        )}

        {(currentPage === 'products' || currentPage === 'add-product') && (
          token ? (
            <MyProducts initialAdd={currentPage === 'add-product'} />
          ) : (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onNavigateRegister={() => setCurrentPage('register')}
            />
          )
        )}

        {currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'dashboard' && currentPage !== 'products' && currentPage !== 'add-product' && (
          <NotFound onNavigateHome={() => setCurrentPage(token ? 'dashboard' : 'login')} />
        )}
      </main>

      {/* Editorial Bottom Status Bar Footer */}
      <footer className="h-10 border-t border-white/10 bg-[#0A0A0A] flex flex-wrap items-center justify-between px-6 sm:px-10 text-[9px] uppercase tracking-widest text-white/40 font-mono">
        <div className="flex space-x-6">
          <span>Session: JWT / LocalStorage</span>
          <span className="hidden sm:inline-block">Hashing: BCrypt v5.0</span>
        </div>
        <div className="flex space-x-6">
          <span className="hidden sm:inline-block">Environment: Production</span>
          <span>© 2026 AUTH_GATEWAY</span>
        </div>
      </footer>
    </div>
  );
}
