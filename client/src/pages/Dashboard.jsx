// ==========================================
// DASHBOARD PAGE (client/src/pages/Dashboard.jsx)
// Urdu Comment: Protected User Dashboard
// ==========================================

import React, { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, LogOut, RefreshCw, Calendar, Key, Server, Database, CheckCircle2 } from 'lucide-react';
import { getUserProfile } from '../services/api';

export default function Dashboard({ user: initialUser, onLogout, token }) {
  const [profile, setProfile] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());

  const fetchFreshProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await getUserProfile();
      if (response.success && response.user) {
        setProfile(response.user);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (err) {
      setErrorMsg('Profile refresh nahi ho saki.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreshProfile();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={fetchFreshProfile} className="px-3 py-1 bg-rose-600 text-white rounded text-xs">
              Retry
            </button>
          </div>
        )}

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-800/50 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 shadow-xl">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-bold text-2xl text-white uppercase">
                  {profile?.name ? profile.name.substring(0, 2) : 'US'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>JWT Authenticated Session</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  KhushAamdeed, {profile?.name || 'User'}! 👋
                </h1>
                <p className="text-sm text-slate-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>{profile?.email || 'N/A'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={fetchFreshProfile}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
              
              <button
                onClick={onLogout}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white border-b border-slate-800 pb-2">Account Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Name:</span>
                <span className="font-medium text-slate-200">{profile?.name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Email:</span>
                <span className="font-medium text-slate-200">{profile?.email}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">User ID:</span>
                <span className="font-mono text-xs px-2 py-1 rounded bg-slate-950 text-indigo-300 inline-block">
                  #{profile?.id || 1}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white border-b border-slate-800 pb-2">Security & Auth</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Password Hashing:</span>
                <span className="font-medium text-emerald-400">bcrypt (10 rounds)</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Auth Token:</span>
                <span className="font-medium text-indigo-300">JSON Web Token (JWT)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white border-b border-slate-800 pb-2">Stack Details</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded bg-slate-950">
                <span className="text-slate-400">Frontend:</span>
                <span className="text-indigo-300">React 19 + Vite</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950">
                <span className="text-slate-400">Backend:</span>
                <span className="text-emerald-300">Node.js + Express</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-950">
                <span className="text-slate-400">Database:</span>
                <span className="text-amber-300">MySQL / phpMyAdmin</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
