import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Camera, Link2, Upload, Sparkles, ArrowRight, Globe, Loader2, AlertCircle } from 'lucide-react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { extractLabelApi, checkUrlApi } from '../../services/api';
import { compressImage } from '../../utils/imageUtils';

export const ConsumerCheckProductScreen: React.FC = () => {
  const { navigateTo, startScanExtraction, setExtractionReviewData, setAnalysisData, consumerProfile } = useApp();
  const [activeMode, setActiveMode] = useState<'scan' | 'url'>('scan');
  const [urlInput, setUrlInput] = useState('');
  const [customText, setCustomText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();

  const handleCapturePhoto = async () => {
    setErrorMsg(null);
    if (isNative) {
      try {
        const photo = await CapCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          correctOrientation: true
        });

        if (photo.dataUrl) {
          const compressed = await compressImage(photo.dataUrl, 1600, 0.85).catch(() => photo.dataUrl!);
          setSelectedImages(prev => {
            const next = [...prev, compressed];
            setActiveImageIdx(next.length - 1);
            return next;
          });
        }
      } catch (e) {
        console.warn('Native camera cancelled or error:', e);
      }
    } else {
      const camInput = document.getElementById('consumer-live-camera-input') as HTMLInputElement;
      if (camInput) {
        camInput.click();
      }
    }
  };

  const handleStartCheck = async () => {
    setErrorMsg(null);

    if (activeMode === 'scan' && selectedImages.length === 0 && !customText.trim()) {
      handleCapturePhoto();
      return;
    }
    if (activeMode === 'url' && !urlInput.trim()) {
      setErrorMsg('Please paste a product web link.');
      return;
    }

    if (activeMode === 'scan') {
      startScanExtraction({
        image_base64: selectedImages[0] || undefined,
        images_base64: selectedImages.length > 0 ? selectedImages : undefined,
        raw_text: customText
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await checkUrlApi({
        url: urlInput,
        performed_by: consumerProfile
      });
      if (res?.record) {
        setAnalysisData(
          res.record.product,
          res.record.extraction,
          res.record.evaluations,
          res.record.id
        );
        navigateTo('ocr_processing');
      }
    } catch (err) {
      console.warn('Consumer check API error:', err);
      setErrorMsg('Extraction request failed. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setErrorMsg(null);

      for (const file of files) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const raw = event.target?.result as string;
          if (raw) {
            const compressed = await compressImage(raw, 3072, 0.95).catch(() => raw);
            setSelectedImages(prev => {
              const next = [...prev, compressed];
              setActiveImageIdx(next.length - 1);
              return next;
            });
          }
        };
        reader.readAsDataURL(file);
      }
      e.target.value = '';
    }
  };

  const removeImage = (idxToRemove: number) => {
    setSelectedImages(prev => {
      const next = prev.filter((_, idx) => idx !== idxToRemove);
      if (activeImageIdx >= next.length) {
        setActiveImageIdx(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const currentViewImage = selectedImages[activeImageIdx] || null;

  return (
    <div className="w-full h-full bg-[#F5F6F8] flex flex-col justify-between overflow-hidden">
      <Header title="Check a Packaged Product" showBack showLogo />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-[calc(max(16px,env(safe-area-inset-bottom,0px))+4px)] space-y-4 hide-scrollbar flex flex-col justify-between">
        {/* Segmented Mode Switcher */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl shadow-inner">
          <button
            onClick={() => { setActiveMode('scan'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeMode === 'scan'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Scan Package Photos</span>
          </button>
          <button
            onClick={() => { setActiveMode('url'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeMode === 'url'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Paste Online Link</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {activeMode === 'scan' ? (
          /* Camera Scan UI */
          <div className="space-y-3 my-auto">
            {/* Hidden native/browser fallback file inputs */}
            <input
              id="consumer-live-camera-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCustomUpload}
              className="hidden"
            />
            <input
              id="consumer-upload-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleCustomUpload}
              className="hidden"
            />

            <div className="relative w-full h-56 rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-slate-900 flex items-center justify-center shadow-md">
              {currentViewImage ? (
                <img
                  src={currentViewImage}
                  alt={`Product Scan Panel ${activeImageIdx + 1}`}
                  className="w-full h-full object-cover filter brightness-[0.98]"
                />
              ) : (
                <div
                  onClick={handleCapturePhoto}
                  className="text-center p-4 space-y-2.5 cursor-pointer select-none group w-full h-full flex flex-col items-center justify-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-lg">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs text-white font-bold tracking-wide">
                      Tap to Open Live Camera
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Snap Front &amp; Back label panels
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] font-bold flex items-center space-x-1.5 shadow"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Photo</span>
                    </button>
                    <label
                      htmlFor="consumer-upload-input"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-[11px] font-medium flex items-center space-x-1.5 border border-slate-700 cursor-pointer shadow"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-400" />
                      <span>Upload Gallery</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Viewfinder corner markers */}
              <div className="absolute inset-2 pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-2 border-l-2 border-emerald-400 rounded-tl-md"></div>
                  <div className="w-5 h-5 border-t-2 border-r-2 border-emerald-400 rounded-tr-md"></div>
                </div>
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-b-2 border-l-2 border-emerald-400 rounded-bl-md"></div>
                  <div className="w-5 h-5 border-b-2 border-r-2 border-emerald-400 rounded-br-md"></div>
                </div>
              </div>

              {/* Controls overlay when image is captured */}
              {currentViewImage && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-700/90 hover:bg-emerald-800 active:scale-95 backdrop-blur-md border border-emerald-400/40 text-white text-[11px] font-semibold flex items-center space-x-1 shadow"
                    title="Snap another panel with camera"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>+ Camera</span>
                  </button>
                  <label
                    htmlFor="consumer-upload-input"
                    className="px-2.5 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 active:scale-95 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center space-x-1 cursor-pointer shadow"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Upload</span>
                  </label>
                </div>
              )}

              {selectedImages.length > 1 && (
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono z-10">
                  Panel {activeImageIdx + 1} of {selectedImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {selectedImages.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {selectedImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      activeImageIdx === idx ? 'border-emerald-600 scale-105' : 'border-slate-300 opacity-70'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="flex-shrink-0 w-14 h-14 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-50 hover:bg-emerald-100 flex flex-col items-center justify-center text-emerald-800 cursor-pointer text-[10px] font-bold transition-colors"
                  title="Take photo with camera"
                >
                  <Camera className="w-4 h-4 text-emerald-700 mb-0.5" />
                  <span>+ Camera</span>
                </button>
                <label
                  htmlFor="consumer-upload-input"
                  className="flex-shrink-0 w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 flex flex-col items-center justify-center text-slate-600 cursor-pointer text-[10px] font-bold transition-colors"
                  title="Upload from gallery"
                >
                  <Upload className="w-4 h-4 text-slate-500 mb-0.5" />
                  <span>+ Gallery</span>
                </label>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Optional Printed Label Text
              </label>
              <textarea
                rows={2}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Optional: Paste or type printed declarations..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        ) : (
          /* E-commerce URL input */
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle space-y-3 my-auto">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                E-Commerce Product Link
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="Paste product web page URL (https://...)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Start Check CTA */}
        <button
          onClick={handleStartCheck}
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isLoading ? 'Verifying Declarations...' : 'Verify Statutory Declarations'}</span>
          {!isLoading && <ArrowRight className="w-4 h-4" />}
        </button>
      </main>
    </div>
  );
};
