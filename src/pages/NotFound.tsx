// ==========================================
// 404 NOT FOUND PAGE COMPONENT
// Urdu Comment: Yeh 404 Page Not Found component hai jab koi ghair-mojood route open hota hai
// ==========================================

import React from 'react';
import { Home, AlertTriangle, ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  onNavigateHome: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-[#0A0A0A] text-[#F5F5F0]">
      <div className="max-w-md w-full text-center space-y-6 bg-[#0F0F0F] border border-white/10 p-10">
        
        {/* Warning Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 border border-white/20 text-white mb-2 font-mono">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>

        <div className="space-y-3 font-mono">
          <h1 className="text-7xl font-serif italic font-light text-white tracking-tighter">404</h1>
          <h2 className="text-xl font-sans font-bold uppercase tracking-wide text-white">Page Not Found</h2>
          <p className="text-xs text-white/50 leading-relaxed">
            // Aap jo page talash kar rahe hain woh mojood nahi hai.
          </p>
        </div>

        <button
          onClick={onNavigateHome}
          className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.3em] hover:bg-[#E0E0E0] transition-colors cursor-pointer flex items-center justify-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </button>

      </div>
    </div>
  );
};

export default NotFound;
