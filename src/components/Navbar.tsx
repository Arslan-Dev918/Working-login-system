// ==========================================
// NAVBAR COMPONENT
// Urdu Comment: Yeh header navigation bar component hai jo login state ke hisab se links dikhata hai
// ==========================================

import React from 'react';
import { LogOut, UserCheck, LayoutDashboard, Boxes } from 'lucide-react';

interface NavbarProps {
  user: { name: string; email: string } | null;
  onLogout: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  currentPage,
  setCurrentPage
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-white/10 text-[#F5F5F0]">
      <div className="w-full h-16 flex items-center justify-between px-6 sm:px-10">
        
        {/* App Brand Logo - Editorial Style */}
        {/* Urdu Comment: Brand title aur logo section */}
        <div 
          onClick={() => setCurrentPage(user ? 'dashboard' : 'login')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
            <div className="w-3 h-3 bg-black"></div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold tracking-widest text-xs uppercase text-white">
              System_Auth<span className="text-white/40">.v1</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 border border-white/20 text-white/60">
              JWT / MySQL
            </span>
          </div>
        </div>

        {/* Navigation Actions - Editorial Uppercase Style */}
        {/* Urdu Comment: User login state ke mutabiq buttons aur profile info */}
        <nav className="flex items-center space-x-4 sm:space-x-6 text-[10px] tracking-[0.2em] font-semibold uppercase">
          {user ? (
            <>
              {/* Dashboard Link */}
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`flex items-center space-x-2 px-3 py-1.5 transition-colors cursor-pointer ${
                  currentPage === 'dashboard'
                    ? 'text-white border-b border-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setCurrentPage('products')}
                className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 transition-colors cursor-pointer ${
                  currentPage === 'products' || currentPage === 'add-product'
                    ? 'text-white border-b border-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>My Products</span>
              </button>

              {/* Logged In User Pill */}
              {/* Urdu Comment: Logged-in user ka name aur badge */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 border border-white/10 bg-[#0F0F0F] font-mono text-xs text-white/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">{user.name}</span>
              </div>

              {/* Logout Button */}
              {/* Urdu Comment: Logout karne ka button */}
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 border border-white/20 hover:bg-white hover:text-black text-white transition-colors cursor-pointer uppercase tracking-[0.2em]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Login Button */}
              <button
                onClick={() => setCurrentPage('login')}
                className={`px-4 py-2 transition-colors cursor-pointer ${
                  currentPage === 'login'
                    ? 'bg-white text-black font-bold'
                    : 'text-white/60 hover:text-white border border-white/10 hover:border-white/30'
                }`}
              >
                <span>Login</span>
              </button>

              {/* Register Button */}
              <button
                onClick={() => setCurrentPage('register')}
                className={`px-4 py-2 transition-colors cursor-pointer border border-white/20 ${
                  currentPage === 'register'
                    ? 'bg-white text-black font-bold border-white'
                    : 'text-white hover:bg-white hover:text-black'
                }`}
              >
                <span>Register</span>
              </button>
            </>
          )}
        </nav>

      </div>
    </header>
  );
};

export default Navbar;
