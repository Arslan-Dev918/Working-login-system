// ==========================================
// LOGIN PAGE COMPONENT
// Urdu Comment: Yeh login form component hai jahan user apna email aur password daal kar login karta hai
// ==========================================

import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { loginUser } from '../services/api';

interface LoginProps {
  onLoginSuccess: (token: string, user: { id: number; name: string; email: string }) => void;
  onNavigateRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateRegister }) => {
  // Form State Variables
  // Urdu Comment: Input fields aur state management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Page Load par Saved Email Check kar rahe hain (Remember Me feature)
  // Urdu Comment: Agar pehle se email save ho to auto-fill kar rahe hain
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Form Submission Handler
  // Urdu Comment: Submit button click hone par login function execute hoga
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side Validation Check
    // Urdu Comment: Form verification check
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Baraye meherbani Email aur Password dono darj karein!');
      return;
    }

    setLoading(true);

    try {
      // API call to login endpoint
      // Urdu Comment: Backend API se authentication response mangwa rahe hain
      const response = await loginUser({ email: email.trim(), password });

      if (response.success && response.token) {
        setSuccessMessage(response.message || 'Login Kamyab ho gaya!');
        
        // Remember me handle kar rahe hain
        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }

        // Parent component ko update kar rahe hain
        setTimeout(() => {
          onLoginSuccess(response.token, response.user);
        }, 600);
      } else {
        setErrorMessage(response.message || 'Login nahi ho saka.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const backendError = error.response?.data?.message || 'Server se rabta nahi ho saka. Baraye meherbani internet connection ya server check karein.';
      setErrorMessage(backendError);
    } finally {
      setLoading(false);
    }
  };

  // Demo Credentials Quick Fill
  // Urdu Comment: Demo account quick test fill button
  const handleQuickFill = () => {
    setEmail('ahmed@example.com');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#0A0A0A] text-[#F5F5F0] overflow-hidden">
      
      {/* Left Content: Editorial Branding Banner */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden bg-[#0A0A0A]">
        <div className="relative z-10 space-y-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-mono">
            Full-Stack Authentication Gateway
          </p>
          <h1 className="text-5xl sm:text-7xl lg:text-[104px] leading-[0.85] font-serif font-light tracking-tighter italic text-white">
            Secure <br/>
            <span className="not-italic font-sans font-black uppercase tracking-tight text-white">Protocol</span>
          </h1>
          <p className="mt-6 text-xs sm:text-sm text-white/50 max-w-sm leading-relaxed font-mono">
            // Database se connection establish kar rahe hain.<br/>
            A complete, production-ready authentication gateway built with React 19, Express, JWT & MySQL.
          </p>
        </div>

        {/* Stack metadata indicators */}
        <div className="grid grid-cols-2 gap-6 relative z-10 mt-12 lg:mt-0 pt-8 border-t border-white/10">
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Stack</span>
            <span className="text-xs font-mono text-white/80">Vite / Express / MySQL</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Security</span>
            <span className="text-xs font-mono text-white/80">Bcrypt / JWT / .env</span>
          </div>
        </div>

        {/* Background decorative text watermark */}
        <div className="absolute bottom-0 right-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
          <span className="text-[200px] sm:text-[300px] leading-none font-black -mb-24 -mr-24 text-white font-mono block">
            AUTH
          </span>
        </div>
      </div>

      {/* Right Content: Interactive Login Form */}
      <div className="w-full lg:w-1/2 bg-[#0F0F0F] flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-sm space-y-8">
          
          {/* Form Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-white tracking-tight">Welcome Back</h2>
            <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-mono">
              Enter your credentials to access system
            </p>
          </div>

          {/* Quick Fill Helper for Demo */}
          <div className="p-3 bg-[#1A1A1A] border border-white/10 flex items-center justify-between font-mono">
            <div className="text-xs text-white/60 flex items-center space-x-2">
              <KeyRound className="w-3.5 h-3.5 text-white/40" />
              <span>Sample Demo Account</span>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[10px] px-2.5 py-1 border border-white/20 hover:bg-white hover:text-black text-white font-semibold uppercase tracking-widest transition-colors cursor-pointer"
            >
              Auto Fill
            </button>
          </div>

          {/* Alert Messages */}
          {/* Urdu Comment: Success aur Error Alert messages */}
          {errorMessage && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start space-x-3 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          {/* Urdu Comment: Login Form fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block font-mono">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@system.local"
                  className="w-full bg-[#1A1A1A] border border-white/10 p-4 text-sm focus:outline-none focus:border-white/40 transition-all placeholder:text-white/20 text-white font-sans"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block font-mono">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[9px] uppercase tracking-[0.2em] text-white/30 cursor-pointer hover:text-white transition-colors font-mono"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1A1A1A] border border-white/10 p-4 text-sm focus:outline-none focus:border-white/40 transition-all placeholder:text-white/20 text-white font-sans"
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            {/* Urdu Comment: Remember me check box */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border border-white/20 bg-[#1A1A1A] text-black focus:ring-0 cursor-pointer accent-white"
                />
                <span className="text-xs text-white/60 group-hover:text-white transition-colors font-mono">
                  Mujhe yaad rakhein (Remember session)
                </span>
              </label>
            </div>

            {/* Submit Button */}
            {/* Urdu Comment: Submit button click hone par loading state dikhaye ga */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.3em] hover:bg-[#E0E0E0] transition-colors mt-4 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Authenticate</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link to Register */}
          <div className="pt-8 border-t border-white/10 text-center text-xs text-white/40 space-y-4">
            <div>
              <span>Naya account banana chahte hain? </span>
              <button
                onClick={onNavigateRegister}
                className="text-white underline font-semibold hover:text-white/80 cursor-pointer ml-1 tracking-wider uppercase text-[10px]"
              >
                Yahan Register Karein
              </button>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-[10px] text-white/40 font-mono tracking-wider uppercase italic">
                Server Status: Online (JWT ACTIVE)
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
