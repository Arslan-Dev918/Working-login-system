// ==========================================
// REGISTER PAGE COMPONENT
// Urdu Comment: Yeh Registration Form component hai jahan naye users apna account banate hain
// ==========================================

import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, ArrowRight, Loader2, Check } from 'lucide-react';
import { registerUser } from '../services/api';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onNavigateLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigateLogin }) => {
  // Input State Variables
  // Urdu Comment: Form inputs ka state management
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Alerts & Loading State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password Strength Indicators
  const isLengthValid = password.length >= 6;
  const isMatch = password.length > 0 && password === confirmPassword;

  // Form Submit Handler
  // Urdu Comment: Registration submission execute kar rahe hain
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Field Validation Checks
    // Urdu Comment: Form ke sare checks verify ho rahe hain
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
      // API call to backend register endpoint
      // Urdu Comment: Backend API route ko data bhej rahe hain
      const response = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword
      });

      if (response.success) {
        setSuccessMessage(response.message || 'Registration kamyab ho gayi!');
        
        // Form Clear Kar Rahe Hain
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // 1.5 Seconds Baad Login Screen Par Bhej Rahe Hain
        setTimeout(() => {
          onRegisterSuccess();
        }, 1500);
      } else {
        setErrorMessage(response.message || 'Registration nakaam rahi.');
      }
    } catch (error: any) {
      console.error('Register API Error:', error);
      const backendError = error.response?.data?.message || 'Server se rabta nahi ho saka. Baraye meherbani dobara koshish karein.';
      setErrorMessage(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#0A0A0A] text-[#F5F5F0] overflow-hidden">
      
      {/* Left Content: Editorial Branding Banner */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden bg-[#0A0A0A]">
        <div className="relative z-10 space-y-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-mono">
            New Account Onboarding
          </p>
          <h1 className="text-5xl sm:text-7xl lg:text-[104px] leading-[0.85] font-serif font-light tracking-tighter italic text-white">
            Register <br/>
            <span className="not-italic font-sans font-black uppercase tracking-tight text-white">Identity</span>
          </h1>
          <p className="mt-6 text-xs sm:text-sm text-white/50 max-w-sm leading-relaxed font-mono">
            // Naye user ka record database mein store kar rahe hain.<br/>
            Create a secure account with salted BCrypt password hashing and JWT authentication token generation.
          </p>
        </div>

        {/* Stack metadata indicators */}
        <div className="grid grid-cols-2 gap-6 relative z-10 mt-12 lg:mt-0 pt-8 border-t border-white/10">
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Hashing</span>
            <span className="text-xs font-mono text-white/80">BCrypt (10 Salt Rounds)</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Token</span>
            <span className="text-xs font-mono text-white/80">JWT (24h Expiry)</span>
          </div>
        </div>

        {/* Background decorative text watermark */}
        <div className="absolute bottom-0 right-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
          <span className="text-[200px] sm:text-[300px] leading-none font-black -mb-24 -mr-24 text-white font-mono block">
            JOIN
          </span>
        </div>
      </div>

      {/* Right Content: Interactive Register Form */}
      <div className="w-full lg:w-1/2 bg-[#0F0F0F] flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-sm space-y-8">
          
          {/* Form Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-white tracking-tight">Create Account</h2>
            <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-mono">
              Enter your details to register
            </p>
          </div>

          {/* Success / Error Badges */}
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

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block font-mono">
                Full Name (Pura Naam)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmed Khan"
                  className="w-full bg-[#1A1A1A] border border-white/10 p-4 text-sm focus:outline-none focus:border-white/40 transition-all placeholder:text-white/20 text-white font-sans"
                />
              </div>
            </div>

            {/* Email Field */}
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
                  placeholder="ahmed@example.com"
                  className="w-full bg-[#1A1A1A] border border-white/10 p-4 text-sm focus:outline-none focus:border-white/40 transition-all placeholder:text-white/20 text-white font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
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

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 block font-mono">
                  Confirm Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[9px] uppercase tracking-[0.2em] text-white/30 cursor-pointer hover:text-white transition-colors font-mono"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1A1A1A] border border-white/10 p-4 text-sm focus:outline-none focus:border-white/40 transition-all placeholder:text-white/20 text-white font-sans"
                />
              </div>
            </div>

            {/* Password Validation Hints */}
            {/* Urdu Comment: Realtime validation feedback */}
            <div className="pt-1 flex flex-col gap-1 text-[11px] font-mono">
              <div className={`flex items-center space-x-2 ${isLengthValid ? 'text-emerald-400' : 'text-white/30'}`}>
                <Check className="w-3.5 h-3.5" />
                <span>Minimum 6 characters (Kam se kam 6 huroof)</span>
              </div>
              <div className={`flex items-center space-x-2 ${isMatch ? 'text-emerald-400' : 'text-white/30'}`}>
                <Check className="w-3.5 h-3.5" />
                <span>Passwords match (Dono password ek jaisay hain)</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.3em] hover:bg-[#E0E0E0] transition-colors mt-4 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link to Login */}
          <div className="pt-6 border-t border-white/10 text-center text-xs text-white/40">
            <span>Pehle se account mojood hai? </span>
            <button
              onClick={onNavigateLogin}
              className="text-white underline font-semibold hover:text-white/80 cursor-pointer ml-1 tracking-wider uppercase text-[10px]"
            >
              Yahan Login Karein
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Register;
