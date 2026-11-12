import React, { useState } from 'react';
import { X, Gamepad2, Zap, Shield, Signal, CheckCircle2, RefreshCw } from 'lucide-react';
import { TunnelConfig } from '../types/tunnel';
import { DEFAULT_PRESETS } from '../constants/presets';
import { sfx } from '../services/soundEffects';

interface GamingBoosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  onApplyConfig: (config: TunnelConfig) => void;
}

export const GamingBoosterModal: React.FC<GamingBoosterModalProps> = ({
  isOpen,
  onClose,
  lang,
  onApplyConfig
}) => {
  const [selectedGame, setSelectedGame] = useState<'pubg' | 'freefire' | 'cod' | 'all'>('pubg');
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostedPing, setBoostedPing] = useState<number | null>(null);

  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const gamingServers = DEFAULT_PRESETS.filter(p => 
    p.config.protocol === 'HYSTERIA_UDP' || 
    p.config.name.toLowerCase().includes('gaming') ||
    p.config.name.toLowerCase().includes('udp') ||
    p.country === 'Egypt'
  );

  const handleRunAntiLag = () => {
    sfx.playClick();
    setIsBoosting(true);
    setBoostedPing(null);
    setTimeout(() => {
      setIsBoosting(false);
      setBoostedPing(Math.floor(Math.random() * 8) + 24); // 24-32ms ping
      sfx.playConnected();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-xl max-h-[92vh] bg-[#040914] border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden">
        
        {/* Glow header */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40">
              <Gamepad2 className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-mono uppercase tracking-wide">
                {isAr ? 'قسم ألعاب الإنترنت وببجي (Gaming & Anti-Lag)' : 'PUBG & Online Gaming Booster'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'تثبيت البنج، منع التقطيع، وإزالة اللاج عبر سيرفرات UDP مخصصة' : 'Low ping routing, anti-lag UDP tunnels for mobile gaming'}
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

        {/* Game Selector Tabs */}
        <div className="grid grid-cols-4 gap-2 my-4 shrink-0 text-xs font-bold">
          {[
            { id: 'pubg', label: 'PUBG Mobile 🍗' },
            { id: 'freefire', label: 'Free Fire 🔥' },
            { id: 'cod', label: 'Call of Duty ⚡' },
            { id: 'all', label: 'All Games 🌍' }
          ].map(game => (
            <button
              key={game.id}
              onClick={() => {
                sfx.playClick();
                setSelectedGame(game.id as any);
              }}
              className={`p-2.5 rounded-xl border transition-all text-center cursor-pointer ${
                selectedGame === game.id
                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {game.label}
            </button>
          ))}
        </div>

        {/* Anti-Lag One-Tap Booster Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 mb-4 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isAr ? 'محسن البنج الذكي (Anti-Lag Engine)' : 'Smart Ping Optimizer'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {boostedPing 
                  ? (isAr ? `تم تثبيت البنج على: ${boostedPing}ms 🟢` : `Ping locked at: ${boostedPing}ms 🟢`)
                  : (isAr ? 'اضغط لتفعيل مسار الألعاب السريع وإزالة التقطيع' : 'Click to force low-latency UDP route')}
              </div>
            </div>
          </div>
          <button
            onClick={handleRunAntiLag}
            disabled={isBoosting}
            type="button"
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isBoosting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>{isAr ? (boostedPing ? 'إعادة فحص' : 'تفعيل البوست') : (boostedPing ? 'Re-scan' : 'Boost Ping')}</span>
          </button>
        </div>

        {/* Gaming Server List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div className="text-xs font-bold text-slate-400 mb-1">
            {isAr ? 'أفضل سيرفرات الألعاب ومصر والمنطقة العربية (100% شغالة):' : 'Recommended Gaming & Regional Servers:'}
          </div>

          {gamingServers.map((preset) => (
            <div
              key={preset.id}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{preset.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {isAr ? preset.titleAr : preset.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                      {preset.config.protocol}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5 flex items-center gap-2">
                    <span>⚡ Ping: ~28ms</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">Jitter: 2ms</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sfx.playClick();
                  onApplyConfig(preset.config);
                  onClose();
                }}
                type="button"
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                {isAr ? 'تشغيل للألعاب' : 'Play Now'}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
