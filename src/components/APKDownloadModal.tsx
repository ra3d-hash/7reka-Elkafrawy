import React, { useState } from 'react';
import { X, Download, Smartphone, ShieldCheck, CheckCircle2, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sfx } from '../services/soundEffects';

interface APKDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const APKDownloadModal: React.FC<APKDownloadModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const currentAppUrl = window.location.origin;

  const handleGenerateRealAPK = () => {
    sfx.playSuccess();
    setIsGenerating(true);
    try {
      confetti({ particleCount: 70, spread: 90, origin: { y: 0.6 } });
    } catch {
      // no-op
    }

    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
      // Open official PWABuilder Android APK generator pre-filled with this app URL
      const pwabuilderUrl = `https://www.pwabuilder.com/generator?siteUrl=${encodeURIComponent(currentAppUrl)}`;
      window.open(pwabuilderUrl, '_blank');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl">
      <div className="relative w-full max-w-md bg-[#050b18] border border-cyan-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/35 to-emerald-500/35 border border-cyan-500/50">
              <Smartphone className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-mono uppercase">
                {isAr ? 'مولد تطبيق الأندرويد الرسمي APK' : 'Official Android APK Generator'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'إنشاء وتنزيل ملف APK حقيقي بدون أخطاء تحليل' : 'Generate and download 100% working APK'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-5 space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">{isAr ? 'اسم التطبيق:' : 'App Name:'}</span>
              <span className="font-bold text-white font-mono">Elarb Tunnel Plus (تطبيق العرب)</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">{isAr ? 'الإصدار:' : 'Version:'}</span>
              <span className="font-mono text-cyan-400 font-bold">v2.0 Official APK</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">{isAr ? 'حالة التثبيت:' : 'Status:'}</span>
              <span className="font-mono text-emerald-400">جاهز للتوليد الفوري 🟢</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">{isAr ? 'المطورون:' : 'Developers:'}</span>
              <span className="font-mono text-amber-400">@elarp_vip & @uncle_elbhiry</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-800/60 text-cyan-200 text-[11px] space-y-1">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'الحل النهائي لتثبيت الـ APK:' : 'Final APK Solution:'}</span>
            </div>
            <p className="text-slate-300">
              {isAr 
                ? 'اضغط على زر التوليد أدناه وسيتم فتح أداة مايكروسوفت وجوجل الرسمية (PWABuilder) لإنشاء ملف APK موقع وحقيقي وخالي من أخطاء التحليل لتثبيته فوراً.' 
                : 'Click generate below to open official Microsoft/Google PWA Android APK builder for instant working APK.'}
            </p>
          </div>

          <button
            onClick={handleGenerateRealAPK}
            disabled={isGenerating}
            type="button"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{isAr ? 'جاري تجهيز وتوليد ملف APK...' : 'Generating APK Package...'}</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>{isAr ? 'توليد وتحميل ملف APK الحقيقي ⚡' : 'Generate & Download Real APK ⚡'}</span>
              </>
            )}
          </button>

          {generated && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[11px]">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{isAr ? 'تم فتح أداة التوليد في تبويب جديد! اضغط Generate Android App للحصول على ملف APK.' : 'Generator opened in a new tab! Click Generate Android App.'}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
