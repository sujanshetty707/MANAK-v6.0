import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { BottomNav } from '../common/BottomNav';
import { Globe, Sparkles, ShieldCheck, CheckCircle2, AlertCircle, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import { checkUrlApi } from '../../services/api';

const SAMPLE_LINKS = [
  { label: 'Amazon Atta', url: 'https://www.amazon.in/dp/B07HG8SBDV', platform: 'amazon' as const },
  { label: 'Flipkart Biscuits', url: 'https://www.flipkart.com/parle-g-original-glucose-biscuits/p/itm4b0451a9fec0d', platform: 'flipkart' as const },
  { label: 'Blinkit Milk', url: 'https://blinkit.com/prn/amul-taaza-toned-milk/prid/17855', platform: 'blinkit' as const }
];

const AUDIT_STEPS = [
  'Resolving Marketplace & Sanitizing URL...',
  'Retrieving Listing DOM & Packaging Media...',
  'Extracting Rule 6(10) Declarations with Gemini AI...',
  'Evaluating Legal Metrology Compliance Engine...'
];

export const CheckUrlScreen: React.FC = () => {
  const { navigateTo, setExtractionReviewData, setAnalysisData, officerProfile } = useApp();
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<'amazon' | 'flipkart' | 'blinkit' | 'zepto' | 'other'>('other');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [auditStepIndex, setAuditStepIndex] = useState<number>(0);

  // Progressive status timer while loading
  useEffect(() => {
    let timer: any;
    if (isLoading) {
      setAuditStepIndex(0);
      timer = setInterval(() => {
        setAuditStepIndex(prev => (prev < AUDIT_STEPS.length - 1 ? prev + 1 : prev));
      }, 2500);
    } else {
      setAuditStepIndex(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const validate = (u: string): string | null => {
    if (!u.trim()) return 'Please enter an e-commerce product URL.';
    try { new URL(u); } catch { return 'Enter a valid URL starting with https://'; }
    if (!u.startsWith('https://')) return 'Only secure (https://) URLs are supported.';
    return null;
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setUrlError(null);
    const lower = newUrl.toLowerCase();
    if (lower.includes('amazon')) setPlatform('amazon');
    else if (lower.includes('flipkart')) setPlatform('flipkart');
    else if (lower.includes('blinkit')) setPlatform('blinkit');
    else if (lower.includes('zepto')) setPlatform('zepto');
    else setPlatform('other');
  };

  const handleSelectSample = (sampleUrl: string, samplePlatform: any) => {
    setUrl(sampleUrl);
    setPlatform(samplePlatform);
    setUrlError(null);
  };

  const handleAudit = async () => {
    const err = validate(url);
    if (err) { setUrlError(err); return; }

    setIsLoading(true);
    try {
      const res = await checkUrlApi({
        platform,
        url,
        performed_by: officerProfile
      });

      if (res?.record) {
        setAnalysisData(
          res.record.product,
          res.record.extraction,
          res.record.evaluations,
          res.record.id
        );
        navigateTo('ocr_processing');
      } else {
        setUrlError('No compliance record returned from audit service. Please retry.');
      }
    } catch (apiErr) {
      console.warn('API URL check error:', apiErr);
      setUrlError('Failed to audit marketplace listing. Ensure backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#F5F6F8] flex flex-col justify-between overflow-hidden">
      <Header title="E-Commerce Compliance Check" showBack showLogo />

      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-4 hide-scrollbar">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-manak-navy mono bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
              Rule 6(10) E-Commerce Extractor
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900">Audit Marketplace Listing</h2>
          <p className="text-xs text-slate-500">
            Audit mandatory statutory declarations on Indian e-commerce listings under Legal Metrology Rules & E-Commerce Guidelines.
          </p>
        </div>

        {/* URL Input Box */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-subtle space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Product Page URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={url}
                disabled={isLoading}
                onChange={e => handleUrlChange(e.target.value)}
                placeholder="Paste Amazon, Flipkart, Blinkit product link (https://...)"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs text-slate-800 font-mono focus:outline-none transition-colors ${
                  urlError
                    ? 'border-red-400 focus:border-red-500 bg-red-50/40'
                    : 'border-slate-200 focus:border-manak-navy'
                }`}
              />
            </div>

            {/* Validation Error */}
            {urlError && (
              <div className="flex items-center gap-1.5 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{urlError}</span>
              </div>
            )}
          </div>

          {/* Quick Preset Samples */}
          <div className="pt-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
              Quick Test Presets:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_LINKS.map(sample => (
                <button
                  key={sample.label}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelectSample(sample.url, sample.platform)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors active:scale-95 disabled:opacity-50"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Detected Badge */}
          {url && (
            <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500">Detected Adapter:</span>
              <span className="font-bold text-manak-navy uppercase mono text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-manak-green" />
                {platform.toUpperCase()} PIPELINE
              </span>
            </div>
          )}

          {/* Multi-step progress status */}
          {isLoading && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/70 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-manak-navy flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-manak-navy" />
                  Auditing Marketplace Listing...
                </span>
                <span className="text-slate-500 mono font-bold">
                  Step {auditStepIndex + 1}/{AUDIT_STEPS.length}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-medium animate-pulse">
                {AUDIT_STEPS[auditStepIndex]}
              </p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-manak-navy h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${((auditStepIndex + 1) / AUDIT_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleAudit}
            disabled={isLoading || !url.trim()}
            className="w-full py-3 px-4 rounded-xl bg-manak-navy hover:bg-slate-900 active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-manak-orange" />
            ) : (
              <Sparkles className="w-4 h-4 text-manak-orange" />
            )}
            <span>{isLoading ? 'Executing Compliance Extraction...' : 'Extract & Audit Listing'}</span>
          </button>
        </div>

        <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 flex items-start space-x-2 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-manak-navy flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Automatic extraction examines Seller Identity, Country of Origin, Net Quantity, MRP format with tax disclaimers, and Consumer Grievance contact details.
          </p>
        </div>

        <footer className="pt-2 pb-1 text-center">
          <p className="text-[10px] text-slate-400 mono">
            Governed by Rule 6(10) of Legal Metrology (Packaged Commodities) Rules, 2011
          </p>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
};
