import React from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { BottomNav } from '../common/BottomNav';
import { Camera, Link2, AlertTriangle, CheckCircle2, ChevronRight, TrendingUp, FileText, Inbox, Bot } from 'lucide-react';

export const OfficerDashboardScreen: React.FC = () => {
  const { navigateTo, inspections, setAnalysisData, consumerReports } = useApp();
  const pendingGrievances = consumerReports.filter(r => r.status !== 'action_taken' && r.status !== 'dismissed').length;

  const totalInspections = inspections.length;
  const violationsFound = inspections.filter(i => !i.is_compliant).length;
  const pendingReports = inspections.filter(i => !i.is_signed).length;

  return (
    <div className="w-full h-full bg-[#F5F6F8] font-poppins flex flex-col justify-between overflow-hidden">
      <Header showOfficerBadge showLogo />

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto px-3.5 sm:px-4 pt-3 pb-8 space-y-3.5 hide-scrollbar">
        {/* Section: Summary Stat Cards */}
        <section>
          <div className="flex items-center justify-between mb-1.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mono">
              Field Inspection Overview
            </h2>
            <span className="text-[10px] text-slate-400 mono">Updated Live</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Stat 1 */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/90 shadow-subtle flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">
                  Total<br />Inspections
                </span>
                <div className="w-5 h-5 rounded-md bg-manak-navy/10 text-manak-navy flex items-center justify-center">
                  <TrendingUp className="w-3 h-3" />
                </div>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-extrabold text-slate-900 mono">{totalInspections}</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/90 shadow-subtle flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">
                  Violations<br />Flagged
                </span>
                <div className="w-5 h-5 rounded-md bg-red-50 text-manak-red flex items-center justify-center">
                  <AlertTriangle className="w-3 h-3" />
                </div>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-extrabold text-manak-red mono">{violationsFound}</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white rounded-xl p-2.5 border border-slate-200/90 shadow-subtle flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">
                  Unsigned<br />Reports
                </span>
                <div className="w-5 h-5 rounded-md bg-amber-50 text-manak-amber flex items-center justify-center">
                  <FileText className="w-3 h-3" />
                </div>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg font-extrabold text-manak-amber mono">{pendingReports}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Four Main Features */}
        <section className="space-y-2.5">
          {/* Feature 1: Scan Products */}
          <div
            onClick={() => navigateTo('scan_camera')}
            className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:border-slate-300 cursor-pointer active:scale-[0.99] transition-all group flex items-center justify-between"
          >
            <div className="flex items-center space-x-3.5 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-xl bg-manak-navy text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Camera className="w-5 h-5 text-manak-orange" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-slate-900 leading-tight">
                    Scan Products
                  </h3>
                  <span className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 flex-shrink-0">
                    Camera
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  Scan product packaging using camera
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2" />
          </div>

          {/* Feature 2: Check E-Commerce */}
          <div
            onClick={() => navigateTo('check_url')}
            className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:border-slate-300 cursor-pointer active:scale-[0.99] transition-all group flex items-center justify-between"
          >
            <div className="flex items-center space-x-3.5 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-manak-navy flex items-center justify-center flex-shrink-0 border border-blue-100">
                <Link2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-slate-900 leading-tight">
                    Check the Product via URL
                  </h3>
                  <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 flex-shrink-0">
                    Online
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  Check online listings from Amazon, Flipkart &amp; more
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2" />
          </div>

          {/* Feature 3: Citizen Grievance */}
          <div
            onClick={() => navigateTo('officer_consumer_reports')}
            className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:border-slate-300 cursor-pointer active:scale-[0.99] transition-all group flex items-center justify-between"
          >
            <div className="flex items-center space-x-3.5 min-w-0 flex-1">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                pendingGrievances > 0
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                <Inbox className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-slate-900 leading-tight">
                    Citizen Grievance
                  </h3>
                  {pendingGrievances > 0 && (
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 flex-shrink-0">
                      {pendingGrievances} Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  Review complaints reported by consumers
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2" />
          </div>

          {/* Feature 4: MANAK Assistant (Chatbot) */}
          <div
            onClick={() => navigateTo('compliance_chat')}
            className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:border-slate-300 cursor-pointer active:scale-[0.99] transition-all group flex items-center justify-between"
          >
            <div className="flex items-center space-x-3.5 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 border border-purple-100">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-semibold text-slate-900 leading-tight">
                    MANAK Assistant
                  </h3>
                  <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200 flex-shrink-0">
                    AI Chatbot
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  Ask any question about rules, standards &amp; penalties
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0 ml-2" />
          </div>
        </section>

        {/* Section: Recent Field Inspections */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight">Recent Inspections</h3>
            <button
              onClick={() => navigateTo('inspection_history')}
              className="text-[11px] font-semibold text-manak-navy hover:underline"
            >
              View All ({inspections.length})
            </button>
          </div>

          {inspections.length === 0 ? (
            <div className="bg-white rounded-xl p-6 border border-slate-200 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No inspections recorded yet.</p>
              <p className="text-[11px] text-slate-400">Use "Scan Product Label" or "Check E-Commerce URL" above to start an audit.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {inspections.slice(0, 5).map(record => (
                <div
                  key={record.id}
                  onClick={() => {
                    setAnalysisData(record.product, record.extraction, record.evaluations, record.id);
                    navigateTo('inspection_report');
                  }}
                  className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-subtle hover:border-blue-300 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-600 text-xs font-bold">
                        {record.product.brand.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                          {record.product.title}
                        </h4>
                        <p className="text-[10px] text-slate-500">{record.product.brand} • {record.timestamp.split(' ')[0]}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {record.is_compliant ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9.5px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Compliant</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[9.5px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{record.total_violations} Violations</span>
                        </span>
                      )}
                      <span className="block text-[9.5px] text-slate-400 mono mt-0.5">
                        {record.status === 'verified' ? 'Signed' : 'Provisional'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
};
