import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { BottomNav } from '../common/BottomNav';
import { REPEAT_VIOLATOR_HEATMAP } from '../../data/mockData';
import {
  Search, CheckCircle2, AlertTriangle, ChevronRight, MapPin,
  ShieldAlert, Camera, ClipboardX, SlidersHorizontal, ArrowRight
} from 'lucide-react';
import { getRecordImage, DEFAULT_COMMODITY_IMAGE } from '../../utils/imageUtils';

export const InspectionHistoryScreen: React.FC = () => {
  const { inspections, navigateTo, setAnalysisData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'compliant' | 'violation'>('all');
  const [activeTab, setActiveTab] = useState<'history' | 'heatmap'>('history');

  const violationsCount = inspections.filter(i => !i.is_compliant).length;
  const compliantCount = inspections.filter(i => i.is_compliant).length;

  const filteredInspections = inspections.filter(item => {
    const matchesSearch =
      item.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.report_id && item.report_id.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterMode === 'compliant') return matchesSearch && item.is_compliant;
    if (filterMode === 'violation') return matchesSearch && !item.is_compliant;
    return matchesSearch;
  });

  return (
    <div className="w-full h-full bg-[#F5F6F8] flex flex-col justify-between overflow-hidden font-sans select-none">
      <Header title="Inspection Archive" showBack showLogo />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-3.5 sm:px-4 pt-3 pb-8 space-y-3.5 hide-scrollbar">
        {/* Top Tab Switcher without fire icon */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit History ({inspections.length})
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'heatmap'
                ? 'bg-manak-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Violator Heatmap
          </button>
        </div>

        {activeTab === 'history' ? (
          <>
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search product or report ID..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-manak-navy shadow-sm transition-colors"
              />
            </div>

            {/* Filter Tabs: Evenly Spaced & Easy to Tap */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFilterMode('all')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition-all ${
                  filterMode === 'all'
                    ? 'bg-manak-navy text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All ({inspections.length})
              </button>
              <button
                onClick={() => setFilterMode('violation')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition-all ${
                  filterMode === 'violation'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Violations ({violationsCount})
              </button>
              <button
                onClick={() => setFilterMode('compliant')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition-all ${
                  filterMode === 'compliant'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Compliant ({compliantCount})
              </button>
            </div>

            {/* Inspection Records List */}
            <div className="space-y-3">
              {/* Empty state: No inspections */}
              {inspections.length === 0 && (
                <div className="flex flex-col items-center justify-center py-14 space-y-3 text-center bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <ClipboardX className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">No inspections recorded</p>
                    <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed">
                      Completed audits will appear here after you scan a product or check a URL.
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('scan_camera')}
                    className="mt-2 px-4 py-2.5 rounded-xl bg-manak-navy hover:bg-slate-900 text-white font-semibold text-xs flex items-center space-x-2 transition-colors shadow-sm"
                  >
                    <Camera className="w-4 h-4 text-manak-orange" />
                    <span>Scan Products</span>
                  </button>
                </div>
              )}

              {/* Empty state: Filter returned nothing */}
              {inspections.length > 0 && filteredInspections.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 space-y-2 text-center bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <SlidersHorizontal className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">No matching records</p>
                  <p className="text-xs text-slate-500">Try adjusting your search or active filter tab.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setFilterMode('all'); }}
                    className="text-xs font-semibold text-manak-navy hover:underline mt-1"
                  >
                    Reset filters
                  </button>
                </div>
              )}

              {/* Restructured History Cards */}
              {filteredInspections.map(record => (
                <div
                  key={record.id}
                  onClick={() => {
                    setAnalysisData(record.product, record.extraction, record.evaluations, record.id);
                    navigateTo('inspection_report');
                  }}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all cursor-pointer space-y-3 active:scale-[0.99] group"
                >
                  {/* Top Row: Report ID, Inspection Type, and Date (Neatly Aligned, No Overlap) */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className="font-mono text-[11px] font-semibold text-slate-600 truncate">
                        {record.report_id || record.id}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase tracking-wide flex-shrink-0">
                        {record.mode === 'url_check' ? 'URL CHECK' : 'PHYSICAL SCAN'}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 font-mono flex-shrink-0 ml-2">
                      {record.timestamp.split(' ')[0]}
                    </span>
                  </div>

                  {/* Middle Row: Product Image & Product Title & Violation Badge */}
                  <div className="flex items-start space-x-3.5">
                    {/* Product Image */}
                    <div className="w-14 h-14 rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50 flex-shrink-0 flex items-center justify-center">
                      <img
                        src={getRecordImage(record)}
                        alt={record.product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('photo-1546069901-ba9599a7e63c')) {
                            target.src = DEFAULT_COMMODITY_IMAGE;
                          }
                        }}
                      />
                    </div>

                    {/* Product Title (No manufacturer) & Violation Status Badge */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h4 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-blue-900 transition-colors">
                        {record.product.title}
                      </h4>

                      {/* Compact, neatly aligned Violation Badge */}
                      <div>
                        {record.is_compliant ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Compliant</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                            <span>
                              {record.total_violations} {record.total_violations === 1 ? 'Violation' : 'Violations'}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Field Audit Location: Shown Separately Above the Action in Subtle Secondary Style */}
                  {record.geo?.address && (
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">Field Audit Location: {record.geo.address}</span>
                    </div>
                  )}

                  {/* Prominent Centered Primary Action Button: "View Report" */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnalysisData(record.product, record.extraction, record.evaluations, record.id);
                      navigateTo('inspection_report');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-manak-navy hover:text-white border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all group-hover:bg-manak-navy group-hover:text-white group-hover:border-manak-navy shadow-2xs"
                  >
                    <span>View Report</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Repeat Violator Heatmap Hotspots */
          <div className="space-y-3">
            <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-xs text-amber-900">
              <div className="flex items-center space-x-2 font-semibold mb-1">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Repeat Non-Compliant Entities</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-950/80">
                Aggregated violation frequencies across retail stores and regional distributors under Section 36 of Legal Metrology Act.
              </p>
            </div>

            <div className="space-y-2.5">
              {REPEAT_VIOLATOR_HEATMAP.map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{item.entity}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.location}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold font-mono">
                      {item.violations} Violations
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>Severity: <strong className="text-red-600">{item.severity}</strong></span>
                    <span>Last Flagged: {item.last_flagged}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};
