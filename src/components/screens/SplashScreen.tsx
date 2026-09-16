import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, ArrowRight } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [progress, setProgress] = useState(0);

  // Smooth, dynamic 0 to 100% progress animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Smooth progression
        const increment = prev < 70 ? 6 : prev < 90 ? 4 : 2;
        return Math.min(100, prev + increment);
      });
    }, 70);

    return () => clearInterval(timer);
  }, []);

  // Auto-transition to role_select once booting completes
  useEffect(() => {
    if (progress >= 100) {
      const autoNav = setTimeout(() => {
        navigateTo('role_select');
      }, 500);
      return () => clearTimeout(autoNav);
    }
  }, [progress, navigateTo]);

  return (
    <div
      onClick={() => navigateTo('role_select')}
      className="relative w-full h-full bg-gradient-to-b from-[#0A1628] via-[#0E1E36] to-[#0A1628] text-slate-100 flex flex-col justify-between overflow-hidden cursor-pointer select-none font-sans"
    >
      {/* Subtle Ambient Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Spacer for Safe Area */}
      <div className="pt-[max(20px,env(safe-area-inset-top))]" />

      {/* Center Branding Content - Minimal, High Whitespace */}
      <main className="flex flex-col items-center justify-center px-6 text-center z-10 -mt-8">
        {/* Official Logo Shield */}
        <div className="relative w-28 h-28 mb-5 flex items-center justify-center drop-shadow-[0_12px_30px_rgba(0,0,0,0.65)]">
          <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none">
            <defs>
              <linearGradient id="splashShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2A579E" />
                <stop offset="100%" stopColor="#142C52" />
              </linearGradient>
            </defs>
            <path
              d="M60 10 L98 26 C98 62 82 92 60 108 C38 92 22 62 22 26 Z"
              fill="url(#splashShieldGrad)"
              stroke="#4A7BBF"
              strokeWidth="2.5"
            />
            <path
              d="M60 18 L90 31 C90 60 76 85 60 99 C44 85 30 60 30 31 Z"
              fill="none"
              stroke="#E8622C"
              strokeWidth="1.5"
              strokeOpacity="0.85"
            />
            <g transform="translate(42, 38)">
              <rect x="0" y="0" width="3" height="34" rx="1" fill="#FFFFFF" />
              <rect x="6" y="0" width="5" height="34" rx="1.2" fill="#FFFFFF" />
              <rect x="14" y="0" width="2" height="34" rx="0.8" fill="#FFFFFF" fillOpacity="0.75" />
              <rect x="19" y="0" width="6" height="34" rx="1.2" fill="#FFFFFF" />
              <rect x="28" y="0" width="3.5" height="34" rx="1" fill="#FFFFFF" />
              <rect x="34" y="0" width="2" height="34" rx="0.8" fill="#FFFFFF" fillOpacity="0.85" />
              <line x1="-8" y1="17" x2="44" y2="17" stroke="#E8622C" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <circle cx="60" cy="27" r="2.5" fill="#E8622C" />
          </svg>
        </div>

        {/* Title Only */}
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-[0.26em] uppercase leading-none font-sans drop-shadow-md">
          MANAK
        </h1>
      </main>

      {/* Bottom Section: Sync Progress & Get Started Button */}
      <footer className="w-full pb-[max(20px,env(safe-area-inset-bottom))] px-8 flex flex-col items-center space-y-4 z-10">
        {/* Synchronizing Rules Progress Indicator */}
        <div className="w-full max-w-[220px]">
          <div className="w-full h-1 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/40">
            <div
              className="h-full bg-gradient-to-r from-manak-orange to-amber-400 transition-all duration-150 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400/90 mt-1.5 px-0.5">
            <span className="tracking-wide">Synchronizing Rules…</span>
            <span className="font-semibold text-slate-300">{progress}%</span>
          </div>
        </div>

        {/* Get Started Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateTo('role_select');
          }}
          className="w-full max-w-[240px] py-3 px-5 rounded-2xl bg-gradient-to-r from-manak-orange to-orange-600 hover:from-orange-500 hover:to-orange-700 active:scale-98 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg shadow-orange-950/40 transition-all group"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Subtle NIC Secure Badge at Bottom Edge */}
        <div className="pt-2 flex items-center space-x-1 opacity-30 hover:opacity-50 transition-opacity text-[8.5px] font-mono tracking-widest text-slate-400">
          <Shield className="w-2.5 h-2.5" />
          <span>NIC SECURE</span>
        </div>
      </footer>
    </div>
  );
};
