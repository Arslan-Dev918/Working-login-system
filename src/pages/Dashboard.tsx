// ==========================================
// DASHBOARD COMPONENT (Protected Page)
// Urdu Comment: Yeh protected Dashboard page hai jo sirf JWT authenticated users ko dikhta hai
// ==========================================

import React, { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, LogOut, RefreshCw, Calendar, Key, Server, Database, CheckCircle2, LayoutDashboard, Boxes, Plus, Settings, PackageCheck, PackageX, EyeOff } from 'lucide-react';
import { getProductStats, getUserProfile, ProductStats } from '../services/api';

interface DashboardProps {
  user: { id: number; name: string; email: string; created_at?: string } | null;
  onLogout: () => void;
  token: string | null;
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user: initialUser, onLogout, token, onNavigate }) => {
  // State variables
  // Urdu Comment: Profile state aur fresh data load karne ka mechanism
  const [profile, setProfile] = useState<{ id: number; name: string; email: string; created_at?: string } | null>(initialUser);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    availableProducts: 0,
    outOfStockProducts: 0,
    hiddenProducts: 0
  });

  // Fresh profile data fetch function
  // Urdu Comment: Backend profile API se fresh data fetch kar rahe hain
  const fetchFreshProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await getUserProfile();
      if (response.success && response.user) {
        setProfile(response.user);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
      const statsResponse = await getProductStats();
      if (statsResponse.success && statsResponse.stats) {
        setStats(statsResponse.stats);
      }
    } catch (err: any) {
      console.error('Fetch profile error:', err);
      const backendErr = err.response?.data?.message || 'Profile refresh karne mein ghalti hui.';
      setErrorMsg(backendErr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreshProfile();
  }, []);

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently Registered';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0A0A0A] text-[#F5F5F0] p-6 sm:p-10 lg:p-14">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Top Notification Banner */}
        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={fetchFreshProfile}
              className="px-3 py-1 bg-white text-black text-[10px] font-bold uppercase tracking-wider hover:bg-[#E0E0E0] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Hero Welcome Card - Editorial Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          <aside className="bg-[#0F0F0F] border border-white/10 p-5 h-fit space-y-2">
            {[
              { label: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
              { label: 'My Products', icon: Boxes, page: 'products' },
              { label: 'Add Product', icon: Plus, page: 'add-product' },
              { label: 'Profile', icon: User, page: 'dashboard' },
              { label: 'Settings', icon: Settings, page: 'dashboard' }
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.page)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-mono uppercase tracking-[0.2em] text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </aside>

          <section className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: 'Total Products', value: stats.totalProducts, icon: Boxes },
                { label: 'Available Products', value: stats.availableProducts, icon: PackageCheck },
                { label: 'Out of Stock', value: stats.outOfStockProducts, icon: PackageX },
                { label: 'Hidden Products', value: stats.hiddenProducts, icon: EyeOff }
              ].map((item) => (
                <div key={item.label} className="bg-[#0F0F0F] border border-white/10 p-5">
                  <div className="flex items-center justify-between text-white/40">
                    <span className="text-[9px] font-mono uppercase tracking-[0.25em]">{item.label}</span>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <p className="text-3xl font-serif italic text-white mt-4">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Urdu Comment: Logged-in user ke liye Welcome banner card */}
        <div className="relative overflow-hidden bg-[#0F0F0F] border border-white/10 p-8 sm:p-12">
          {/* Subtle watermark background text */}
          <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none select-none">
            <span className="text-[180px] font-serif italic font-light leading-none -mt-10 -mr-10 text-white block">
              User
            </span>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            
            <div className="flex items-center space-x-6">
              {/* User Avatar Badge - Monochromatic Editorial */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white text-black font-serif font-light italic text-2xl sm:text-3xl flex items-center justify-center shrink-0 border border-white">
                {profile?.name ? profile.name.substring(0, 2).toUpperCase() : 'US'}
              </div>

              {/* User Name & Details */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50">
                    JWT Authenticated Session
                  </span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-serif font-light italic text-white tracking-tight">
                  Welcome, <span className="not-italic font-sans font-black uppercase text-white">{profile?.name || 'User'}</span>
                </h1>
                <p className="text-xs text-white/60 font-mono flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-white/40 shrink-0" />
                  <span>{profile?.email || 'N/A'}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons - High Contrast Blocks */}
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <button
                onClick={fetchFreshProfile}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 border border-white/20 hover:bg-white hover:text-black text-white text-xs font-mono uppercase tracking-[0.2em] transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Profile</span>
              </button>
              
              <button
                onClick={onLogout}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 bg-white text-black hover:bg-[#E0E0E0] text-xs font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

          </div>
        </div>

        {/* Dashboard Grid Sections */}
        {/* Urdu Comment: Dashboard ke mukhtalif cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Account Information */}
          <div className="bg-[#0F0F0F] border border-white/10 p-6 space-y-6">
            <div className="pb-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-mono">
                Identity Profile
              </span>
              <User className="w-4 h-4 text-white/40" />
            </div>
            
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-[9px] text-white/40 uppercase tracking-widest block">Full Name</span>
                <span className="text-white font-semibold">{profile?.name}</span>
              </div>
              <div>
                <span className="text-[9px] text-white/40 uppercase tracking-widest block">Email Address</span>
                <span className="text-white/80">{profile?.email}</span>
              </div>
              <div>
                <span className="text-[9px] text-white/40 uppercase tracking-widest block">System Record ID</span>
                <span className="px-2 py-0.5 border border-white/20 text-white/90 bg-[#1A1A1A] inline-block mt-1">
                  #{profile?.id || 1}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-white/40 uppercase tracking-widest block">Registered On</span>
                <span className="text-white/70 flex items-center space-x-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-white/40" />
                  <span>{formatDate(profile?.created_at)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Security & JWT Token Status */}
          <div className="bg-[#0F0F0F] border border-white/10 p-6 space-y-6">
            <div className="pb-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-mono">
                Security Protocol
              </span>
              <ShieldCheck className="w-4 h-4 text-white/40" />
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-[9px] text-white/40 uppercase tracking-widest block">Hash Algorithm</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>BCrypt (10 Rounds)</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] text-white/40 uppercase tracking-widest block">Bearer Token</span>
                <span className="text-white/80 flex items-center space-x-1.5 mt-1">
                  <Key className="w-3.5 h-3.5 text-white/40" />
                  <span>JSON Web Token</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] text-white/40 uppercase tracking-widest block">JWT Payload Fingerprint</span>
                <div className="p-3 bg-[#1A1A1A] border border-white/10 text-[10px] text-white/50 truncate mt-1">
                  {token ? `${token.substring(0, 28)}...` : 'Active'}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: System Architecture & Stack */}
          <div className="bg-[#0F0F0F] border border-white/10 p-6 space-y-6">
            <div className="pb-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-mono">
                System Stack
              </span>
              <Server className="w-4 h-4 text-white/40" />
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 bg-[#1A1A1A] border border-white/10">
                <span className="text-white/40 text-[10px] uppercase tracking-wider">Client View:</span>
                <span className="text-white font-medium">React 19 / Vite</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#1A1A1A] border border-white/10">
                <span className="text-white/40 text-[10px] uppercase tracking-wider">Server API:</span>
                <span className="text-white font-medium">Node.js / Express</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#1A1A1A] border border-white/10">
                <span className="text-white/40 text-[10px] uppercase tracking-wider">Data Engine:</span>
                <span className="text-white font-medium flex items-center space-x-1">
                  <Database className="w-3 h-3 text-white/60" />
                  <span>MySQL DB</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#1A1A1A] border border-white/10">
                <span className="text-white/40 text-[10px] uppercase tracking-wider">Last Sync:</span>
                <span className="text-white/70">{lastRefreshed}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
