import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { generateInspectionPDF } from '../../services/pdfReportGenerator';
import { Download, ShieldCheck, MapPin, Hash, CheckCircle2, AlertTriangle, ArrowLeft, Share2, Check } from 'lucide-react';
import { getRecordImage, DEFAULT_COMMODITY_IMAGE } from '../../utils/imageUtils';

export const InspectionReportScreen: React.FC = () => {
  const { navigateTo, inspections, currentInspectionId, officerProfile } = useApp();
  const [downloaded, setDownloaded] = useState(false);

  // Find the active or latest inspection record
  const currentRecord = inspections.find(i => i.id === currentInspectionId) || inspections[0];

  const handleDownloadPDF = async () => {
    if (currentRecord) {
      try {
        await generateInspectionPDF(currentRecord);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 3000);
      } catch (err) {
        console.error('Failed to generate or share PDF:', err);
      }
    }
  };

  if (!currentRecord) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6 text-center">
        <p className="text-sm text-slate-500">No inspection report found.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#F5F6F8] flex flex-col justify-between overflow-hidden">
      <Header title="Inspection Report &amp; Evidence" showBack showLogo />

      {/* Main Report Document Container */}
      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 hide-scrollbar">
        {/* Top Official Banner */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-subtle space-y-3">
          <div className="flex items-start justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[9.5px] uppercase font-mono text-slate-400 block">Report Number</span>
              <h2 className="text-sm font-extrabold text-manak-navy mono tracking-tight">
                {currentRecord.report_id || 'MANAK-REP-2026-00491'}
              </h2>
            </div>

            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold mono">
              <ShieldCheck className="w-3.5 h-3.5 text-manak-green" />
              <span>DIGITALLY CERTIFIED</span>
            </span>
          </div>

          {/* Officer & Geo Tagging Information */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-semibold uppercase mono">Inspecting Official</span>
              <p className="font-bold text-slate-800 text-[11.5px]">{currentRecord.performed_by.name}</p>
              <p className="text-[10px] text-slate-500 mono">{currentRecord.performed_by.badge_id}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-semibold uppercase mono">Date &amp; Time</span>
              <p className="font-bold text-slate-800 text-[11.5px]">{currentRecord.timestamp.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-500 mono">{currentRecord.timestamp.split(' ')[1] || '11:28 IST'}</p>
            </div>
          </div>

          {/* Geo Location Pill */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2 text-[11px] text-slate-700">
            <MapPin className="w-4 h-4 text-manak-navy flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-slate-900">{currentRecord.geo.address}</span>
              <span className="text-[9.5px] text-slate-500 mono">
                GPS: {currentRecord.geo.lat.toFixed(4)}° N, {currentRecord.geo.lng.toFixed(4)}° E
              </span>
            </div>
          </div>

          {/* Tamper Evidence Hash */}
          <div className="flex items-center space-x-1.5 text-[9.5px] text-slate-500 mono bg-slate-100/70 p-2 rounded-lg truncate">
            <Hash className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">Evidence Hash (Sec 65B): {currentRecord.evidence_hash}</span>
          </div>
        </div>

        {/* Product Findings & Violations Summary */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-subtle space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mono flex items-center gap-1.5">
            <span>Subject Declarations &amp; Audit Verdict</span>
          </h3>

          <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <img
              src={getRecordImage(currentRecord)}
              alt={currentRecord.product.title}
              className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('photo-1546069901-ba9599a7e63c')) {
                  target.src = DEFAULT_COMMODITY_IMAGE;
                }
              }}
            />
            <div className="truncate">
              <h4 className="text-xs font-bold text-slate-900 truncate">{currentRecord.product.title}</h4>
              <p className="text-[10px] text-slate-500">Brand: {currentRecord.product.brand}</p>
              <p className="text-[10px] text-slate-600 font-mono font-medium">
                Declared MRP: {currentRecord.extraction.mrp.value?.raw_text || 'Omitted'}
              </p>
            </div>
          </div>

          {/* Violations List */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10.5px] font-bold text-slate-700 block">Statutory Audit Findings:</span>
            {currentRecord.evaluations.map(ev => (
              <div
                key={ev.rule_id}
                className={`p-2 rounded-lg text-[11px] flex items-start justify-between border ${
                  ev.status === 'violation'
                    ? 'bg-red-50/70 border-red-200 text-red-900'
                    : 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="max-w-[220px]">
                  <span className="font-semibold block">{ev.requirement_name}</span>
                  <span className="text-[9.5px] opacity-80 block">{ev.explanation}</span>
                </div>
                <span className="text-[10px] font-mono font-bold">
                  {ev.status === 'violation' ? `₹${ev.penalty}` : '✓ Pass'}
                </span>
              </div>
            ))}
          </div>

          {/* Total Compounding Penalty */}
          <div className="p-3 rounded-xl bg-manak-navy text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] text-blue-200 uppercase font-mono block">Statutory Penalty (Rule 32)</span>
              <span className="text-xs font-bold">Total Compounding Amount</span>
            </div>
            <span className="text-lg font-black mono text-manak-orange">
              ₹{currentRecord.total_penalty.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Digital Signature Block */}
        <div className="bg-emerald-50/90 rounded-2xl p-3.5 border border-emerald-200 text-xs space-y-1.5">
          <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Digital Signature Authentication Certificate</span>
          </div>
          <p className="text-[10.5px] text-emerald-950/80 leading-relaxed font-sans">
            Digitally authenticated by <strong>{officerProfile.name}</strong> via Class 3 DSC Token ({currentRecord.signature_details?.certificate_id || 'DSC-IN-LM-2026-991823'}). Certified under Information Technology Act, 2000.
          </p>
        </div>
      </main>

      {/* Action Footer */}
      <footer className="bg-white border-t border-slate-200/90 p-3.5 pb-[calc(max(14px,env(safe-area-inset-bottom,0px))+4px)] shadow-nav flex items-center space-x-2.5 z-20 flex-shrink-0">
        <button
          onClick={() => navigateTo('officer_dashboard')}
          className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          title="Return to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleDownloadPDF}
          className="flex-1 py-3 px-4 rounded-xl bg-manak-navy hover:bg-slate-900 active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition-all"
        >
          {downloaded ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-manak-orange" />}
          <span>{downloaded ? 'PDF Downloaded!' : 'Download Official PDF Report'}</span>
        </button>
      </footer>
    </div>
  );
};
