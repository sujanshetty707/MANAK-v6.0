import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { BottomNav } from '../common/BottomNav';
import {
  Camera,
  ChevronRight,
  FileCheck,
  Sparkles,
  Info,
  IndianRupee,
  Scale,
  Calendar,
  PhoneCall,
  X,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Smartphone
} from 'lucide-react';

export const ConsumerDashboardScreen: React.FC = () => {
  const { navigateTo, consumerReports, consumerProfile, logout } = useApp();
  const [showAccountModal, setShowAccountModal] = useState(false);

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

  const packagingRules = [
    {
      id: 'mrp',
      title: 'Maximum Retail Price (MRP)',
      ruleNo: 'Rule 6(1)(e)',
      icon: IndianRupee,
      accentBorder: 'border-amber-200/80',
      accentBg: 'bg-amber-50',
      iconBg: 'bg-amber-100 text-amber-800',
      badgeBg: 'bg-amber-100/80 text-amber-900 border border-amber-300/60',
      whatToCheck: 'Must include "Inclusive of all taxes" printed clearly next to price.',
      whyItMatters: 'Retailers cannot charge extra GST or any amount higher than the printed MRP.'
    },
    {
      id: 'net_qty',
      title: 'Net Quantity & Units',
      ruleNo: 'Rule 6(1)(d)',
      icon: Scale,
      accentBorder: 'border-emerald-200/80',
      accentBg: 'bg-emerald-50/50',
      iconBg: 'bg-emerald-100 text-emerald-800',
      badgeBg: 'bg-emerald-100/80 text-emerald-900 border border-emerald-300/60',
      whatToCheck: 'Standard metric units (g, kg, ml, L) in legible font size on the front.',
      whyItMatters: 'Protects you from deceptive package sizing and underweight goods.'
    },
    {
      id: 'dates',
      title: 'Date of Packing & Expiry',
      ruleNo: 'Rule 6(1)(f)',
      icon: Calendar,
      accentBorder: 'border-indigo-200/80',
      accentBg: 'bg-indigo-50/40',
      iconBg: 'bg-indigo-100 text-indigo-800',
      badgeBg: 'bg-indigo-100/80 text-indigo-900 border border-indigo-300/60',
      whatToCheck: 'Month & year of manufacture/packing and "Best Before" date.',
      whyItMatters: 'Guarantees freshness; selling expired stock or sticker tampering is strictly illegal.'
    },
    {
      id: 'consumer_care',
      title: 'Consumer Care Helpline',
      ruleNo: 'Rule 6(1)(g)',
      icon: PhoneCall,
      accentBorder: 'border-rose-200/80',
      accentBg: 'bg-rose-50/40',
      iconBg: 'bg-rose-100 text-rose-800',
      badgeBg: 'bg-rose-100/80 text-rose-900 border border-rose-300/60',
      whatToCheck: 'Valid telephone helpline number and official email address on package.',
      whyItMatters: 'Ensures a direct, mandatory company contact for grievance redressal and defects.'
    }
  ];

  return (
    <div className="w-full h-full bg-[#F6F8FA] flex flex-col justify-between overflow-hidden font-poppins">
      <Header
        showConsumerBadge
        showLogo={false}
        onConsumerProfileClick={() => setShowAccountModal(true)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-3.5 pb-8 space-y-4 hide-scrollbar">
        {/* Hero Card: Centered Camera Scan / Web URL */}
        <section
          onClick={() => navigateTo('consumer_check')}
          className="bg-gradient-to-br from-[#0B3B28] via-[#115E3B] to-[#0A4330] text-white rounded-2xl py-7 px-4 shadow-elevated border border-emerald-400/25 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden flex flex-col items-center justify-center text-center group"
        >
          {/* Subtle Ambient Background glow */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-400/15 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-teal-300/15 rounded-full blur-lg pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center space-y-3.5">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-100/95 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 shadow-sm">
              CAMERA SCAN OR WEB URL
            </span>

            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-[#0B3B28] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Camera className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.2]" />
            </div>
          </div>
        </section>

        {/* Quick Access Row: My Reports & National Helpline */}
        <section className="grid grid-cols-2 gap-3">
          {/* My Reports Quick Overview */}
          <div
            onClick={() => navigateTo('consumer_my_reports')}
            className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-subtle hover:border-emerald-400/70 cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
                <FileCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                {consumerReports.length} Filed
              </span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">My Reports</h3>
            </div>
          </div>

          {/* National Consumer Helpline */}
          <div
            onClick={() => setShowAccountModal(true)}
            className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-subtle hover:border-amber-400/80 cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="text-[11px] bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded-full font-mono font-bold">
                Helpline 1915
              </span>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Consumer Rights</h3>
            </div>
          </div>
        </section>

        {/* Redesigned: Know Your Packaging Rights (Rules 2011) */}
        <section className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                Know Your Packaging Rights
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
              Rules 2011
            </span>
          </div>

          <div className="space-y-3">
            {packagingRules.map(rule => {
              const Icon = rule.icon;
              return (
                <div
                  key={rule.id}
                  className={`bg-white rounded-xl p-3.5 border ${rule.accentBorder} shadow-subtle transition-all`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${rule.iconBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs sm:text-[13px] font-bold text-slate-900">{rule.title}</h4>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${rule.badgeBg}`}>
                      {rule.ruleNo}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] sm:text-xs leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-slate-700 min-w-[88px] text-[11px] shrink-0">
                        What to check:
                      </span>
                      <span className="text-slate-600 font-medium">{rule.whatToCheck}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-slate-700 min-w-[88px] text-[11px] shrink-0">
                        Why it matters:
                      </span>
                      <span className="text-slate-500">{rule.whyItMatters}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Profile & Account Area: Accessible Sign Out */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-subtle flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              {(consumerProfile.name?.charAt(0) || 'C').toUpperCase()}
              {(consumerProfile.name?.split(' ')[1]?.charAt(0) || 'U').toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {formatPhone(consumerProfile.phone)}
                </span>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-1.5 py-0.5 rounded font-bold">
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Citizen Account &bull; {consumerReports.length} complaints filed
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-bold text-xs border border-rose-200/80 transition-colors shadow-sm"
            title="Sign Out of Citizen Account"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Sign Out</span>
          </button>
        </section>
      </main>

      {/* Citizen Profile & Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-200/90 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Citizen Account</h3>
                  <p className="text-[10px] text-slate-500">Legal Metrology Consumer Portal</p>
                </div>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Card */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  Registered Mobile
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              </div>
              <p className="text-base font-bold font-mono text-slate-900 tracking-wide">
                {formatPhone(consumerProfile.phone)}
              </p>
              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                <span className="text-slate-500">Grievances Filed:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {consumerReports.length} Reports
                </span>
              </div>
            </div>

            {/* National Consumer Helpline Info */}
            <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200/80 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
              <div className="text-[11px] leading-snug text-amber-900">
                <span className="font-bold block text-amber-950">National Consumer Helpline (NCH)</span>
                For overcharging or non-compliance assistance, call toll-free <strong>1915</strong> or visit consumerhelpline.gov.in.
              </div>
            </div>

            {/* Sign Out Action Button */}
            <div className="pt-1">
              <button
                onClick={() => {
                  setShowAccountModal(false);
                  logout();
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-bold text-xs border border-rose-200/80 transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out of Citizen Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};
