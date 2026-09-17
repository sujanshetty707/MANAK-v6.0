import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { BottomNav } from '../common/BottomNav';
import {
  Bot, LogOut, Wifi, WifiOff, RefreshCw,
  ChevronRight, BadgeCheck, MapPin, Inbox
} from 'lucide-react';

export const OfficerProfileScreen: React.FC = () => {
  const {
    officerProfile, navigateTo, logout,
    isOffline, toggleOffline, offlineQueueCount, syncOfflineQueue,
    inspections, consumerReports
  } = useApp();

  const pendingGrievances = consumerReports.filter(
    r => r.status !== 'action_taken' && r.status !== 'dismissed'
  ).length;

  return (
    <div className="w-full h-full bg-[#F5F6F8] flex flex-col justify-between overflow-hidden">
      <Header title="Officer Profile & Settings" showLogo />

      <main className="flex-1 overflow-y-auto px-3.5 sm:px-4 pt-3 pb-8 space-y-4 hide-scrollbar">

        {/* Officer Identity Card */}
        <div className="bg-gradient-to-br from-manak-navy via-slate-900 to-[#142C52] rounded-2xl p-4 border border-blue-400/20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -mr-8 -mt-8 pointer-events-none" />

          <div className="flex items-center space-x-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-manak-orange/20 border border-manak-orange/40 text-manak-orange flex items-center justify-center text-xl font-black">
              {officerProfile.avatar}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">{officerProfile.name}</h2>
              <p className="text-[10px] text-blue-200 mono">{officerProfile.badge_id}</p>
              <p className="text-[10px] text-blue-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {officerProfile.zone}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
            {[
              { label: 'Inspections', count: inspections.length },
              { label: 'Violations', count: inspections.filter(i => !i.is_compliant).length },
              { label: 'Grievances', count: pendingGrievances },
            ].map(s => (
              <div key={s.label} className="text-center">
                <span className="text-lg font-extrabold text-white mono">{s.count}</span>
                <p className="text-[9.5px] text-blue-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Offline Status Card */}
        <div className={`rounded-2xl p-3.5 border flex items-center justify-between ${
          isOffline
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isOffline ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {isOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                {isOffline ? 'Offline Mode Active' : 'Online — Cloud Sync'}
              </h3>
              <p className="text-[10.5px] text-slate-500">
                {isOffline
                  ? `${offlineQueueCount} inspection${offlineQueueCount !== 1 ? 's' : ''} queued for sync`
                  : 'All inspections synced to server'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <button
              onClick={toggleOffline}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                isOffline
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isOffline ? 'Go Online' : 'Simulate Offline'}
            </button>
            {isOffline && offlineQueueCount > 0 && (
              <button
                onClick={syncOfflineQueue}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Sync Now
              </button>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden divide-y divide-slate-100">

          <button
            onClick={() => navigateTo('compliance_chat')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-blue-50/60 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-manak-navy/10 text-manak-navy flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 block">Legal Metrology AI Assistant</span>
                <span className="text-[10.5px] text-slate-500">Ask about 2011 Rules, penalties & citations</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigateTo('officer_consumer_reports')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-blue-50/60 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center relative">
                <Inbox className="w-5 h-5" />
                {pendingGrievances > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-manak-orange rounded-full text-[8px] font-extrabold text-white flex items-center justify-center">
                    {pendingGrievances}
                  </span>
                )}
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 block">Citizen Grievance Queue</span>
                <span className="text-[10.5px] text-slate-500">
                  {pendingGrievances > 0 ? `${pendingGrievances} reports pending action` : 'All grievances actioned'}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigateTo('inspection_history')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 block">Inspection Archive</span>
                <span className="text-[10.5px] text-slate-500">{inspections.length} records on this device</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

        <p className="text-center text-[10px] text-slate-400 mono">
          MANAK v1.0.0 · SIH26034 · Legal Metrology (Packaged Commodities) Rules 2011
        </p>
      </main>

      <BottomNav />
    </div>
  );
};
