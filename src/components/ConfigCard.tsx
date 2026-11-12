import React from 'react';
import { Shield, Lock, Server, FileText, ChevronRight, Key, Sparkles, SlidersHorizontal } from 'lucide-react';
import { TunnelConfig } from '../types/tunnel';

interface ConfigCardProps {
  config: TunnelConfig;
  lang: 'ar' | 'en';
  onOpenPresets: () => void;
  onOpenConfigManager: () => void;
  onOpenProtocolSelector: () => void;
}

export const ConfigCard: React.FC<ConfigCardProps> = ({
  config,
  lang,
  onOpenPresets,
  onOpenConfigManager,
  onOpenProtocolSelector
}) => {
  const isAr = lang === 'ar';

  return (
    <div className="w-full bg-[#081022]/90 border border-cyan-900/40 rounded-2xl p-4 sm:p-5 shadow-lg">
      {/* Top row: Current Config Badge & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-800/50">
            <Server className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                {config.name}
              </span>
              {config.isEncrypted && (
                <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/50">
                  <Lock className="w-3 h-3" />
                  .HAT LOCKED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {config.operatorName ? `${config.operatorName} · ` : ''}{config.serverHost}:{config.serverPort}
            </p>
          </div>
        </div>

        {/* Change buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPresets}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-300 border border-cyan-800/40 transition-colors whitespace-nowrap min-h-[36px]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'تغيير السيرفر' : 'Switch Server'}</span>
          </button>

          <button
            onClick={onOpenConfigManager}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap min-h-[36px]"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>{isAr ? 'إدارة الكونفج .hat' : '.hat Manager'}</span>
          </button>
        </div>
      </div>

      {/* Middle Grid: Detailed Tunnel Routing Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 text-xs">
        {/* Protocol Selector Row */}
        <div 
          onClick={onOpenProtocolSelector}
          className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between"
        >
          <div>
            <div className="text-[11px] text-slate-400">{isAr ? 'بروتوكول النفق' : 'Tunnel Protocol'}</div>
            <div className="font-mono font-bold text-cyan-300 mt-0.5">{config.protocol}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>

        {/* Bug Host / SNI */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">{isAr ? 'هوست التجاوز (Bug SNI)' : 'Bug Host / SNI'}</div>
          <div className="font-mono font-bold text-slate-200 mt-0.5 truncate" title={config.bugHostSNI || 'None'}>
            {config.bugHostSNI || 'Direct Connection'}
          </div>
        </div>

        {/* Payload / Gateway */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">{isAr ? 'بوابة الألعاب UDPGW' : 'UDPGW Port'}</div>
          <div className="font-mono font-bold text-emerald-400 mt-0.5">
            127.0.0.1:{config.udpgwPort || 7300}
          </div>
        </div>
      </div>

      {/* Note or message from config creator */}
      {config.configNote && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-cyan-950/30 border border-cyan-900/30 text-xs text-cyan-300/90 leading-relaxed">
          <span className="font-bold">{isAr ? 'ملاحظة المنشئ: ' : 'Note: '}</span>
          {config.configNote}
        </div>
      )}
    </div>
  );
};
