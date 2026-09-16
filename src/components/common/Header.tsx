import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronLeft, Home, WifiOff } from 'lucide-react';

export const Header: React.FC<{
  title?: string;
  showBack?: boolean;
  showOfficerBadge?: boolean;
  showConsumerBadge?: boolean;
  showLogo?: boolean;
  onConsumerProfileClick?: () => void;
  hideHome?: boolean;
}> = ({
  title,
  showBack = false,
  showOfficerBadge = false,
  showConsumerBadge = false,
  showLogo = true,
  onConsumerProfileClick,
  hideHome = false,
}) => {
  const { goBack, officerProfile, consumerProfile, isOffline, userRole, navigateTo } = useApp();

  const formatPhone = (phone?: string) => {
    if (!phone || phone.trim() === '') return '+91 98765 43210';
    const clean = phone.trim();
    if (clean.startsWith('+91')) {
      const digits = clean.replace('+91', '').trim();
      if (digits.length === 10) {
        return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
      }
      return clean;
    }
    if (clean.length === 10) {
      return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    return clean;
  };

  const goHome = () => {
    if (userRole === 'officer') navigateTo('officer_dashboard');
    else if (userRole === 'consumer') navigateTo('consumer_dashboard');
    else navigateTo('role_select');
  };

  return (
    <header className="bg-[#1B3A6B] text-white pt-[calc(max(14px,env(safe-area-inset-top,0px))+6px)] pb-3 px-3.5 sm:px-4 shadow-md flex-shrink-0 relative z-20 transition-all font-poppins">
        <div className="flex items-center justify-between">
          {/* Left Side: Back & Home Buttons or Profile Avatar */}
          <div className="flex items-center space-x-2.5">
            {showBack && (
              <div className="flex items-center space-x-1 -ml-1">
                <button
                  onClick={goBack}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors"
                  title="Go back"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {!hideHome && userRole && (
                  <button
                    onClick={goHome}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors"
                    title="Dashboard Home"
                  >
                    <Home className="w-4 h-4 text-amber-300" />
                  </button>
                )}
              </div>
            )}

            {showOfficerBadge && (
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-700 border-2 border-white/80 flex items-center justify-center font-bold text-white shadow-sm text-sm shrink-0">
                  {officerProfile.avatar}
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-poppins">
                    Legal Metrology Officer
                  </h1>
                </div>
              </div>
            )}

            {showConsumerBadge && (
              <button
                onClick={onConsumerProfileClick}
                className="flex items-center space-x-2 text-left p-1 -m-1 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all focus:outline-none"
                title="View Citizen Profile & Account"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-300/60 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                  {(consumerProfile.name?.charAt(0) || 'C').toUpperCase()}
                  {(consumerProfile.name?.split(' ')[1]?.charAt(0) || 'U').toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] uppercase text-emerald-200 font-medium tracking-wider block font-poppins">
                    Citizen Portal
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white tracking-normal font-poppins">
                    {formatPhone(consumerProfile.phone)}
                  </span>
                </div>
              </button>
            )}

            {!showOfficerBadge && !showConsumerBadge && title && (
              <h1 className="text-sm font-bold text-white tracking-wide truncate max-w-[300px] sm:max-w-none font-poppins">{title}</h1>
            )}
          </div>

          {/* Right Side: Network Badge if offline (Top-right Settings, Shield, and Bell icons removed) */}
          <div className="flex items-center space-x-2">
            {isOffline && (
              <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] mono font-medium">
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </span>
            )}
          </div>
        </div>
      </header>
  );
};
