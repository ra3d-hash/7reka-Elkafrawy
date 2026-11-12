import React, { useState } from 'react';
import { X, Search, CheckCircle2, AlertTriangle, ArrowRight, Activity, Zap, Check } from 'lucide-react';
import { checkBugHost } from '../services/hostChecker';
import { HostCheckResult } from '../types/tunnel';

interface HostCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  onApplyHost: (host: string) => void;
}

export const HostCheckerModal: React.FC<HostCheckerModalProps> = ({
  isOpen,
  onClose,
  lang,
  onApplyHost
}) => {
  const [hostInput, setHostInput] = useState('cdn.vodafone.com.eg');
  const [method, setMethod] = useState('HEAD');
  const [proxyInput, setProxyInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<HostCheckResult | null>(null);

  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const popularBugHosts = [
    { label: 'Vodafone 0.0 CDN', host: 'cdn.vodafone.com.eg' },
    { label: 'Ana Vodafone API', host: 'app.vodafone.com.eg' },
    { label: 'Orange Free Net', host: 'free.orange.eg' },
    { label: 'My Orange CDN', host: 'orange.eg' },
    { label: 'Etisalat Social (e&)', host: 'e-social.etisalat.eg' },
    { label: 'Etisalat Twist Media', host: 'twist.etisalat.eg' },
    { label: 'WE Egypt Telecom', host: 'api.te.eg' },
    { label: 'My WE Billing Portal', host: 'we.com.eg' }
  ];

  const handleRunCheck = async () => {
    if (!hostInput.trim()) return;
    setIsChecking(true);
    setResult(null);

    const res = await checkBugHost(hostInput, method, proxyInput.trim() || undefined);
    setResult(res);
    setIsChecking(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-xl max-h-[90vh] bg-[#070e20] border border-cyan-800/60 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              {isAr ? 'فاحص الهوستات وصائد الثغرات' : 'Host Checker & Bug Hunter'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr ? 'فحص هوستات النت المجاني واستجابة ترويسات HTTP' : 'Test SNI bugs, HTTP response codes & latency'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Quick Bug Presets */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-2">
              {isAr ? 'هوستات شائعة جاهزة للفحص:' : 'Quick Select Popular Bug Hosts:'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {popularBugHosts.map(item => (
                <button
                  key={item.host}
                  type="button"
                  onClick={() => setHostInput(item.host)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                    hostInput === item.host
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAr ? 'عنوان الهوست المراد فحصه (Host / SNI)' : 'Host / SNI URL'}
              </label>
              <input
                type="text"
                value={hostInput}
                onChange={e => setHostInput(e.target.value)}
                placeholder="e.g. cdn.vodafone.com.eg"
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'طريقة الطلب (HTTP Method)' : 'Request Method'}
                </label>
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="HEAD">HEAD (Fastest)</option>
                  <option value="GET">GET (Full Header)</option>
                  <option value="POST">POST (Payload)</option>
                  <option value="CONNECT">CONNECT (Proxy Tunnel)</option>
                  <option value="OPTIONS">OPTIONS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'بروكسي وسيط (اختياري)' : 'Proxy IP:Port (Optional)'}
                </label>
                <input
                  type="text"
                  value={proxyInput}
                  onChange={e => setProxyInput(e.target.value)}
                  placeholder="10.22.40.10:8080"
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={handleRunCheck}
              disabled={isChecking || !hostInput.trim()}
              type="button"
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isChecking ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-slate-950" />
                  <span>{isAr ? 'جارٍ إرسال الحزم والفحص...' : 'Probing Host Handshake...'}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>{isAr ? 'بدء فحص الهوست' : 'Run Host Probe'}</span>
                </>
              )}
            </button>
          </div>

          {/* Results Box */}
          {result && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.statusCode === 200 || result.statusCode === 101 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  )}
                  <div>
                    <span className="text-sm font-bold font-mono text-white">
                      HTTP {result.statusCode}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      {result.statusText}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-mono font-bold text-cyan-400">
                  {result.responseTimeMs} ms
                </div>
              </div>

              {/* Server Details */}
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-slate-400">
                  Protocol: <span className="text-slate-200">{result.protocol}</span>
                </div>
                <div className="text-slate-400">
                  Server: <span className="text-slate-200">{result.serverHeader}</span>
                </div>
                {result.headers['X-Bug-Feasibility'] && (
                  <div className="text-emerald-400 font-bold">
                    Feasibility: {result.headers['X-Bug-Feasibility']}
                  </div>
                )}
              </div>

              {/* Use as Bug SNI CTA */}
              <button
                onClick={() => {
                  onApplyHost(result.host);
                  onClose();
                }}
                type="button"
                className="w-full py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? 'استخدام هذا الهوست في النفق الحالي' : 'Apply Host to Active Tunnel'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
