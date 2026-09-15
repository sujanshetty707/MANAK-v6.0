import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, ArrowRight } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { navigateTo } = useApp();
  const [progress, setProgress] = useState(0);

  // Auto-progress from 0 to 100%
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return p + 25;
      });
    }, 280);

    return () => clearInterval(timer);
  }, []);

  // Auto-transition to role_select once booting completes at 100%
  useEffect(() => {
    if (progress >= 100) {
      const autoNav = setTimeout(() => {
        navigateTo('role_select');
      }, 350);
      return () => clearTimeout(autoNav);
    }
  }, [progress, navigateTo]);

  return (
    <div
      onClick={() => navigateTo('role_select')}
      className="relative w-full h-full bg-security-pattern text-slate-100 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top Security Status Bar */}
      <header className="w-full pt-[max(20px,env(safe-area-inset-top))] px-6 flex justify-between items-center opacity-80 z-10">
        <div className="flex items-center space-x-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-manak-green animate-ping"></span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-300">
            Enforcement Portal v2.4
          </span>
        </div>
        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-300 bg-white/10 px-2 py-0.5 rounded border border-white/10">
          NIC SECURE
        </div>
      </header>

      {/* Center Branding Content */}
      <main className="flex flex-col items-center justify-center px-6 text-center my-auto -mt-6 z-10">
        {/* Official Logo Shield */}
        <div className="relative w-28 h-28 mb-5 flex items-center justify-center drop-shadow-[0_10px_25px_rgba(0,0,0,0.55)]">
          <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none">
            <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#244B88" />
                <stop offset="100%" stopColor="#142C52" />
              </linearGradient>
            </defs>
            <path
              d="M60 10 L98 26 C98 62 82 92 60 108 C38 92 22 62 22 26 Z"
              fill="url(#shieldGrad)"
              stroke="#4A7BBF"
              strokeWidth="2.5"
            />
            <path
              d="M60 18 L90 31 C90 60 76 85 60 99 C44 85 30 60 30 31 Z"
              fill="none"
              stroke="#E8622C"
              strokeWidth="1.5"
              strokeOpacity="0.8"
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

        {/* Title & Tag */}
        <h1 className="text-3xl font-extrabold text-white tracking-[0.22em] uppercase leading-tight font-sans drop-shadow-md">
          MANAK
        </h1>
        <div className="mt-2 inline-flex items-center px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm">
          <span className="text-xs font-medium tracking-wide text-slate-200">
            Legal Metrology Compliance Checker
          </span>
        </div>

        <p className="mt-3 max-w-[270px] text-[11px] font-normal leading-relaxed text-slate-300/80">
          Ministry of Consumer Affairs, Food & Public Distribution
        </p>
        <p className="text-[10px] text-slate-400/80 mono mt-0.5">
          Government of India • SIH26034
        </p>
      </main>

      {/* Bottom Loading Progress & Continue CTA */}
      <footer className="w-full pb-[max(24px,env(safe-area-inset-bottom))] px-8 flex flex-col items-center space-y-4 z-10">
        <div className="w-full max-w-[240px]">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-manak-orange to-manak-green transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] mono text-slate-400 mt-1.5 px-0.5">
            <span>Synchronizing Rules...</span>
            <span>{progress}%</span>
          </div>
        </div>

        <button
          onClick={() => navigateTo('role_select')}
          className="w-full max-w-[260px] py-3 px-5 rounded-xl bg-gradient-to-r from-manak-orange to-orange-600 hover:from-orange-500 hover:to-orange-700 active:scale-98 text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg transition-all"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <span className="text-[9.5px] text-slate-400/60 mono text-center">
          The Legal Metrology (Packaged Commodities) Rules, 2011
        </span>
      </footer>
    </div>
  );
};
