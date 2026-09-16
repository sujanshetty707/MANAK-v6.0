import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Camera, Upload, Sparkles, ChevronLeft, Loader2, AlertCircle, Plus, X, Layers, ArrowRight } from 'lucide-react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { compressImage } from '../../utils/imageUtils';

export const CameraScanScreen: React.FC = () => {
  const { startScanExtraction, goBack } = useApp();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rawText, setRawText] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();

  const runScan = async (imagesList?: string[], textContent?: string) => {
    const imagesToScan = imagesList !== undefined ? imagesList : selectedImages;
    const textToScan = textContent !== undefined ? textContent : rawText;

    if (imagesToScan.length === 0 && !textToScan.trim()) {
      setErrorMsg('Please capture or upload at least 1 product photo (Front & Back panels recommended for complete legal metrology declarations).');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    startScanExtraction({
      image_base64: imagesToScan[0] || undefined,
      images_base64: imagesToScan.length > 0 ? imagesToScan : undefined,
      raw_text: textToScan
    });
  };

  const handleCaptureNativePhoto = async () => {
    if (!isNative) return;
    try {
      setErrorMsg(null);
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
      console.warn('Native camera cancelled or unavailable:', e);
    }
  };

  const handleCustomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setErrorMsg(null);
      const newCompressed: string[] = [];

      for (const file of files) {
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const raw = event.target?.result as string;
            if (raw) {
              const compressed = await compressImage(raw, 1600, 0.85).catch(() => raw);
              newCompressed.push(compressed);
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }

      if (newCompressed.length > 0) {
        setSelectedImages(prev => {
          const next = [...prev, ...newCompressed];
          setActiveImageIdx(next.length - 1);
          return next;
        });
      }
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages(prev => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (activeImageIdx >= next.length) {
        setActiveImageIdx(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const currentViewImage = selectedImages[activeImageIdx] || null;

  return (
    <div className="w-full h-full bg-slate-950 text-white flex flex-col justify-between overflow-hidden relative">
      {/* Top Overlay Controls */}
      <div className="absolute top-0 left-0 w-full z-30 bg-gradient-to-b from-black/85 via-black/40 to-transparent pt-[max(14px,env(safe-area-inset-top))] pb-4 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={goBack}
            className="p-2 rounded-xl bg-black/40 hover:bg-black/60 active:scale-95 text-white backdrop-blur-md border border-white/20 transition-all"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] text-amber-400 uppercase font-mono tracking-wider block font-bold">
              PCR 2011 Multi-Panel Scanner
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide">
              Physical Package Audit
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {selectedImages.length > 0 && (
            <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>{selectedImages.length} {selectedImages.length === 1 ? 'Panel' : 'Panels'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Viewfinder Frame */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-950 font-poppins">
        {/* Background Vignette */}
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />

        {/* Viewfinder Frame (Precisely Centered) */}
        <div className="relative w-[84%] max-w-[340px] aspect-[3/4] max-h-[58vh] rounded-3xl border-2 border-dashed border-white/60 flex items-center justify-center overflow-hidden shadow-[0_0_0_9999px_rgba(3,7,18,0.55)] pointer-events-none z-10">
          {/* Corner Brackets */}
          <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-manak-orange rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-manak-orange rounded-tr-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-manak-orange rounded-bl-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-manak-orange rounded-br-2xl pointer-events-none" />

          {/* Laser Moving Within The Frame */}
          <div className="absolute inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent animate-scan-line shadow-[0_0_16px_#FF6B00] pointer-events-none z-20">
            <div className="w-full h-8 bg-gradient-to-b from-[#FF6B00]/20 to-transparent -translate-y-full pointer-events-none" />
          </div>

          {/* Preview Image or Neatly Arranged Prompt Inside Frame */}
          {currentViewImage ? (
            <img
              src={currentViewImage}
              alt={`Captured Package Panel ${activeImageIdx + 1}`}
              className="w-full h-full object-cover filter brightness-[0.98] pointer-events-auto"
            />
          ) : (
            <div className="text-center px-4 py-6 space-y-3 pointer-events-auto z-10 select-none max-w-[280px]">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-amber-400 shadow-md">
                <Camera className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-white font-bold leading-snug tracking-tight">
                  Upload Front, Back &amp; Side Product Photos
                </p>
                <p className="text-[11px] text-slate-300/80 leading-normal font-normal">
                  Crisp photos detect MRP, Net Qty, Dates &amp; Addresses across panels on the 1st try
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Active Panel Pill (if multiple images) */}
        {selectedImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white flex items-center gap-1.5 shadow-lg">
              <span>Viewing Panel {activeImageIdx + 1} of {selectedImages.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Drawer */}
      <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-4 pb-[max(16px,env(safe-area-inset-bottom))] space-y-3 z-30 transition-all">
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Multi-Panel Image Strip / Thumbnails */}
        {selectedImages.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Captured Panels ({selectedImages.length}): Front, Back &amp; Sides</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Tap panel to view</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {selectedImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    activeImageIdx === idx
                      ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105'
                      : 'border-slate-700 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Panel ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8.5px] font-mono text-center text-white py-0.5 font-bold truncate">
                    {idx === 0 ? 'P1: Front' : idx === 1 ? 'P2: Back' : `P${idx + 1}: Side`}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600/90 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow"
                    title="Remove photo"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}

              {/* Add More Panels Button */}
              {isNative ? (
                <button
                  type="button"
                  onClick={handleCaptureNativePhoto}
                  className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-400/70 bg-slate-800/60 hover:bg-slate-800 flex flex-col items-center justify-center text-slate-400 hover:text-amber-300 transition-all"
                  title="Snap another panel"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[8.5px] font-bold mt-0.5">+ Panel</span>
                </button>
              ) : (
                <label className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-400/70 bg-slate-800/60 hover:bg-slate-800 flex flex-col items-center justify-center text-slate-400 hover:text-amber-300 cursor-pointer transition-all">
                  <Plus className="w-5 h-5" />
                  <span className="text-[8.5px] font-bold mt-0.5">+ Panel</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCustomUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] font-medium text-slate-300 block mb-1">
            Optional Printed Declarations / Additional Text Notes
          </label>
          <textarea
            value={rawText}
            rows={2}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Optional: Type or paste printed text declarations if photo is partially obscured..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-manak-orange"
          />
        </div>

        <div className="flex items-center space-x-2.5 pt-1">
          <label
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 cursor-pointer text-slate-200 transition-colors flex items-center justify-center"
            title="Upload high-res package photos from gallery"
          >
            <Upload className="w-5 h-5 text-amber-300" />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleCustomUpload}
              className="hidden"
            />
          </label>

          {isNative && (
            <button
              onClick={handleCaptureNativePhoto}
              disabled={isLoading}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-amber-400 transition-colors flex items-center justify-center"
              title="Snap panel with camera"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => {
              if (selectedImages.length === 0 && !rawText.trim()) {
                if (isNative) {
                  handleCaptureNativePhoto();
                } else {
                  // Trigger file input click if no images selected
                  const fileInput = document.getElementById('camera-scan-file-input');
                  if (fileInput) fileInput.click();
                }
              } else {
                runScan();
              }
            }}
            disabled={isLoading}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-manak-orange to-orange-600 hover:from-orange-500 hover:to-orange-700 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg transition-all disabled:opacity-50"
          >
            <input
              id="camera-scan-file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={handleCustomUpload}
              className="hidden"
            />
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-200" />
            )}
            <span>
              {isLoading
                ? 'Analyzing Declarations...'
                : selectedImages.length === 0
                ? 'Select or Capture Photos'
                : selectedImages.length === 1
                ? 'Scan 1 Panel & Review Declarations →'
                : `Scan ${selectedImages.length} Panels (Front + Back) →`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
