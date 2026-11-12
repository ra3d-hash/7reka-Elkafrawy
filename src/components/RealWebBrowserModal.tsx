import React, { useState, useEffect } from 'react';
import { 
  X, Globe, ArrowRight, RefreshCw, Shield, ExternalLink, 
  Wifi, Zap, Lock, Sparkles, CheckCircle2, AlertTriangle, Code, Eye
} from 'lucide-react';
import { sfx } from '../services/soundEffects';
import { telemetryEngine } from '../services/telemetryEngine';
import { TunnelConfig } from '../types/tunnel';

interface RealWebBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  currentConfig: TunnelConfig;
  isConnected: boolean;
}

const QUICK_SHORTCUTS = [
  { name: 'DuckDuckGo', url: 'https://html.duckduckgo.com/html/?q=Cairo+Egypt', icon: '🦆' },
  { name: 'Wikipedia', url: 'https://en.m.wikipedia.org/wiki/Egypt', icon: '📚' },
  { name: 'IP Leak Test', url: 'https://api.ipify.org?format=json', icon: '🔍' },
  { name: 'Cloudflare Trace', url: 'https://1.1.1.1/cdn-cgi/trace', icon: '⚡' },
  { name: 'Cairo Weather', url: 'https://wttr.in/Cairo?format=4', icon: '🌤️' },
  { name: 'Carrier Bug Test', url: 'https://cdn.vodafone.com.eg', icon: '🇪🇬' },
];

export const RealWebBrowserModal: React.FC<RealWebBrowserModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentConfig,
  isConnected,
}) => {
  const [urlInput, setUrlInput] = useState<string>('https://html.duckduckgo.com/html/?q=Elarb+Tunnel+Plus');
  const [activeUrl, setActiveUrl] = useState<string>('https://html.duckduckgo.com/html/?q=Elarb+Tunnel+Plus');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [contentHtml, setContentHtml] = useState<string>('');
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [bytesReceived, setBytesReceived] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'RENDER' | 'RAW'>('RENDER');

  const isAr = lang === 'ar';

  const fetchThroughTunnel = async (targetUrl: string) => {
    sfx.playClick();
    setIsLoading(true);
    setErrorMessage(null);
    const start = Date.now();

    try {
      telemetryEngine.addLog('INFO', `[REAL_BROWSER] جلب الرابط عبر نفق ${currentConfig.operatorName || 'Elarb'}: ${targetUrl}`);
      const encodedUrl = encodeURIComponent(targetUrl);
      const carrierParam = encodeURIComponent(currentConfig.operatorName || 'Vodafone EG');
      
      const response = await fetch(`/api/proxy?url=${encodedUrl}&carrier=${carrierParam}`);
      const duration = Date.now() - start;
      setLatencyMs(duration);
      setHttpStatus(response.status);

      const text = await response.text();
      const lengthBytes = new Blob([text]).size;
      setBytesReceived(lengthBytes);
      telemetryEngine.recordRealTraffic(lengthBytes);

      setContentHtml(text);
      setActiveUrl(targetUrl);
      sfx.playSuccess();
      telemetryEngine.addLog('SUCCESS', `[REAL_BROWSER] تم تحميل الصفحة بنجاح! كود الرد: ${response.status} (${(lengthBytes / 1024).toFixed(1)} KB) في ${duration}ms`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tunnel connection failed';
      setErrorMessage(msg);
      sfx.playError();
      telemetryEngine.addLog('ERROR', `[REAL_BROWSER] فشل الجلب: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !contentHtml && isConnected) {
      fetchThroughTunnel(urlInput);
    }
  }, [isOpen, isConnected]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-2xl">
      <div className="relative w-full max-w-5xl h-[90vh] max-h-[850px] bg-[#030712]/95 border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden">
        
        {/* Top Browser Bar */}
        <div className="px-4 py-3 bg-[#070e1e] border-b border-cyan-900/40 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400">
              <Globe className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white font-mono uppercase tracking-wide">
                  {isAr ? 'متصفح النفق الحقيقي وتخطي الحجب' : 'REAL TUNNEL BROWSER & UNBLOCKER'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isAr ? 'نفق نشط 100%' : '100% REAL LIVE TUNNEL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isAr ? `تصفح أي موقع مباشرة عبر بايلود وثغرة [${currentConfig.name}]` : `Browsing real web pages via [${currentConfig.name}]`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewMode('RENDER')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'RENDER' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60' : 'text-slate-400'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isAr ? 'عرض مرئي' : 'Rendered'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('RAW')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  viewMode === 'RAW' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60' : 'text-slate-400'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>{isAr ? 'كود المصدر' : 'Raw HTML'}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* URL Input Deck */}
        <div className="p-3 bg-[#050b18] border-b border-slate-800/80 space-y-2.5">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (urlInput.trim()) fetchThroughTunnel(urlInput.trim());
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1 flex items-center">
              <div className="absolute left-3 rtl:right-3 rtl:left-auto flex items-center gap-1 text-cyan-400 font-mono text-xs">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] uppercase font-bold text-slate-400">TUNNEL://</span>
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={isAr ? 'اكتب أي رابط لتصفحه عبر النفق (مثال: https://wikipedia.org)...' : 'Enter target URL to tunnel through...'}
                className="w-full py-2.5 pl-24 pr-4 rtl:pr-24 rtl:pl-4 rounded-xl bg-slate-950 border border-cyan-900/50 focus:border-cyan-400 text-xs font-mono text-cyan-200 placeholder:text-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isAr ? 'فتح الرابط' : 'Tunnel Fetch'}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* Quick Shortcuts Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
            <span className="text-[10px] font-mono text-slate-400 shrink-0">
              {isAr ? 'روابط سريعة للتجربة:' : 'Fast Tests:'}
            </span>
            {QUICK_SHORTCUTS.map(sc => (
              <button
                key={sc.name}
                type="button"
                onClick={() => {
                  setUrlInput(sc.url);
                  fetchThroughTunnel(sc.url);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-700/60 text-slate-300 hover:text-cyan-200 text-[11px] font-mono shrink-0 transition-colors flex items-center gap-1"
              >
                <span>{sc.icon}</span>
                <span>{sc.name}</span>
              </button>
            ))}
          </div>

          {/* Telemetry Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
            <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">{isAr ? 'كود الرد:' : 'Status:'}</span>
              <span className={`font-bold ${httpStatus && httpStatus < 400 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {httpStatus ? `${httpStatus} OK` : 'IDLE'}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">{isAr ? 'زمن الاستجابة:' : 'Ping:'}</span>
              <span className="font-bold text-cyan-300">
                {latencyMs !== null ? `${latencyMs} ms` : '--'}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">{isAr ? 'البيانات المنقولة:' : 'Bytes:'}</span>
              <span className="font-bold text-purple-300">
                {(bytesReceived / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between truncate">
              <span className="text-slate-400">{isAr ? 'الشبكة المطبقة:' : 'Carrier:'}</span>
              <span className="font-bold text-amber-300 truncate">
                {currentConfig.operatorName || 'Vodafone EG'}
              </span>
            </div>
          </div>
        </div>

        {/* Browser Content Area */}
        <div className="flex-1 bg-white relative overflow-auto">
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-cyan-300">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
              <div className="font-mono text-xs font-bold animate-pulse text-center">
                {isAr ? 'جارٍ تمرير الطلب وحقن بايلود النفق وفك حجب الموقع...' : 'Tunneling packet stream through Elarb bypass engine...'}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-6 h-full flex flex-col items-center justify-center text-center bg-slate-950 text-rose-300 gap-3">
              <AlertTriangle className="w-10 h-10 text-rose-400" />
              <div className="font-bold text-sm">{isAr ? 'فشل تحميل الموقع عبر النفق' : 'Tunnel Fetch Error'}</div>
              <div className="text-xs font-mono text-slate-400 max-w-md">{errorMessage}</div>
              <button
                type="button"
                onClick={() => fetchThroughTunnel(urlInput)}
                className="mt-2 px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 text-xs font-bold"
              >
                {isAr ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          )}

          {!isLoading && !errorMessage && contentHtml && (
            viewMode === 'RENDER' ? (
              <iframe
                title="Elarb Tunnel Web View"
                srcDoc={contentHtml}
                sandbox="allow-scripts allow-forms allow-same-origin"
                className="w-full h-full border-0"
              />
            ) : (
              <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-auto h-full select-text whitespace-pre-wrap">
                {contentHtml}
              </div>
            )
          )}

          {!isLoading && !errorMessage && !contentHtml && (
            <div className="p-6 h-full flex flex-col items-center justify-center text-center bg-[#020617] text-slate-400 gap-3">
              <Globe className="w-12 h-12 text-cyan-500/40" />
              <div className="font-bold text-sm text-white">
                {isAr ? 'متصفح النفق المشفر جاهز' : 'Tunnel Browser Ready'}
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                {isAr ? 'اختر أحد الروابط السريعة بالأعلى أو اكتب أي موقع لتصفحه مباشرة عبر النفق الحقيقي وتخطي الحجب.' : 'Click any quick test above or enter a URL to verify live tunnel browsing.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Support Banner */}
        <div className="px-4 py-2 bg-[#050b18] border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">Elarb Tunnel Engine 2.0</span>
            <span>·</span>
            <span>{activeUrl}</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://t.me/elarp_vip" target="_blank" rel="noreferrer" className="text-sky-400 underline">
              Telegram @elarp_vip
            </a>
            <a href="https://wa.me/" target="_blank" rel="noreferrer" className="text-emerald-400 underline">
              WhatsApp @uncle_elbhiry
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
