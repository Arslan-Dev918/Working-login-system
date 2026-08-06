// ==========================================
// REGISTER PAGE (client/src/pages/Register.jsx)
// Urdu Comment: Register Form Component
// ==========================================

import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, ArrowRight, Loader2, Check } from 'lucide-react';
import { registerUser } from '../services/api';

export default function Register({ onRegisterSuccess, onNavigateLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isLengthValid = password.length >= 6;
  const isMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Baraye meherbani tamam fields pur karein.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password kam se kam 6 characters ka hona zaroori hai.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password aur Confirm Password aapas mein milte nahi hain.');
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword
      });

      if (response.success) {
        setSuccessMessage(response.message || 'Registration kamyab ho gayi!');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        setTimeout(() => {
          onRegisterSuccess();
        }, 1500);
      } else {
        setErrorMessage(response.message || 'Registration nakaam rahi.');
      }
    } catch (error) {
      const backendError = error.response?.data?.message || 'Server se rabta nahi ho saka.';
      setErrorMessage(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 mb-2">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create New Account</h2>
          <p className="text-sm text-slate-400">
            Naya account banane ke liye apni maloomat darj karein.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Full Name (Pura Naam)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ahmed Khan"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-emerald-500 text-white placeholder-slate-500 text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmed@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-emerald-500 text-white placeholder-slate-500 text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-emerald-500 text-white placeholder-slate-500 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-emerald-500 text-white placeholder-slate-500 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pt-1 flex flex-col gap-1 text-xs">
            <div className={`flex items-center gap-1.5 ${isLengthValid ? 'text-emerald-400' : 'text-slate-500'}`}>
              <Check className="w-3.5 h-3.5" />
              <span>Minimum 6 characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
              <Check className="w-3.5 h-3.5" />
              <span>Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Registering Account...</span>
              </>
            ) : (
              <>
                <span>Account Banayein (Register)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <span>Pehle se account mojood hai? </span>
          <button
            onClick={onNavigateLogin}
            className="text-emerald-400 font-semibold hover:underline cursor-pointer ml-1"
          >
            Yahan Login Karein
          </button>
        </div>

      </div>
    </div>
  );
}
