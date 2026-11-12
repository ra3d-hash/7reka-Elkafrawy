import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wifi, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  Video, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { TelemetryStats, ConnectionState, TunnelConfig } from '../types/tunnel';

interface LiveTelemetryStreamProps {
  stats: TelemetryStats;
  state: ConnectionState;
  config: TunnelConfig;
  lang: 'ar' | 'en';
  customMediaUrl: string;
  isCustomVideo: boolean;
  onOpenMediaCustomizer: () => void;
}

export const LiveTelemetryStream: React.FC<LiveTelemetryStreamProps> = ({
  stats,
  state,
  config,
  lang,
  customMediaUrl,
  isCustomVideo,
  onOpenMediaCustomizer
}) => {
  const isAr = lang === 'ar';
  const isConnected = state === 'CONNECTED';
  const isConnecting = state !== 'DISCONNECTED' && state !== 'CONNECTED';
  const [radarAngle, setRadarAngle] = useState(0);

  // Speed history buffer for real-time SVG waveform chart
  const [speedHistory, setSpeedHistory] = useState<{ down: number; up: number }[]>([]);

  useEffect(() => {
    let animId: number;
    const updateRadar = () => {
      setRadarAngle(prev => (prev + 3) % 360);
      animId = requestAnimationFrame(updateRadar);
    };
    animId = requestAnimationFrame(updateRadar);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    setSpeedHistory(prev => {
      const next = [...prev, { down: stats.speedDown, up: stats.speedUp }];
      return next.slice(-26);
    });
  }, [stats.speedDown, stats.speedUp]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatSpeed = (kbps: number) => {
    if (kbps >= 1024) {
      return `${(kbps / 1024).toFixed(2)} MB/s`;
    }
    return `${kbps.toLocaleString()} KB/s`;
  };

  // Speed gauge percentage (0 to 100% based on up to 50 MB/s)
  const speedPercentage = Math.min(100, Math.round((stats.speedDown / 12000) * 100));

  // Generate SVG path for waveform chart
  const maxSpeed = Math.max(1000, ...speedHistory.map(h => Math.max(h.down, h.up)));
  const chartWidth = 400;
  const chartHeight = 65;

  const pointsDown = speedHistory.map((h, i) => {
    const x = (i / Math.max(1, speedHistory.length - 1)) * chartWidth;
    const y = chartHeight - (h.down / maxSpeed) * (chartHeight - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  const pointsUp = speedHistory.map((h, i) => {
    const x = (i / Math.max(1, speedHistory.length - 1)) * chartWidth;
    const y = chartHeight - (h.up / maxSpeed) * (chartHeight - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full glass-card rounded-3xl p-4 sm:p-5 flex flex-col gap-4 relative overflow-hidden">
      
      {/* Background Cyber Ambient Glow */}
      <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header with Status & Video Config Trigger */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
            <Zap className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-cyan-400'}`} />
            {isConnected && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black tracking-wide text-white uppercase font-mono">
                {isAr ? 'شاشة البث والفيديو التفاعلية' : 'LIVE MEDIA & SPEED VISUALIZER'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider ${
                isConnected
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-900/80 text-cyan-300 border border-cyan-500/30'
              }`}>
                {isConnected ? 'STREAMING' : 'IDLE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isAr ? 'عرض مرئي متحرك وسرعة الاتصال اللحظية' : 'Real-time telemetry, animated stream & speed dial'}
            </p>
          </div>
        </div>

        {/* Change Video Button */}
        <button
          onClick={onOpenMediaCustomizer}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/15 transition-all"
          title={isAr ? 'تغيير الفيديو أو الصورة' : 'Change Video / Image'}
        >
          <Video className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline text-[11px]">{isAr ? 'تخصيص الشاشة' : 'Media Screen'}</span>
        </button>
      </div>

      {/* 2. Central Visualizer: Pure Clean Video Screen with Mirror Reflection ("شاشة المراية نقية بدون أي كلام فوق الفيديو") */}
      <div className="relative w-full">
        <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-cyan-400/40 glass-mirror bg-black shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.25)] group glass-sheen">
          
          {/* Render Video or Image (100% CLEAN - NO TEXT OVERLAY) */}
          {isCustomVideo ? (
            <video
              src={customMediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover transition-opacity duration-700"
            />
          ) : (
            <img
              src={customMediaUrl}
              alt="Cyber Visualizer"
              className="w-full h-full object-cover"
            />
          )}

        </div>

        {/* Foreign Cyber Mirror Reflection Pedestal (تأثير انعكاس المراية الزجاجي السفلي) */}
        <div className="w-full h-3.5 -mt-1 rounded-b-2xl bg-gradient-to-b from-cyan-400/25 via-purple-500/10 to-transparent blur-[1.5px] opacity-80 pointer-events-none" />
      </div>

      {/* 2b. High-Tech Speedometer & Protocol Deck (Cleanly underneath the video, not over it) */}
      <div className="w-full glass-card rounded-2xl p-3.5 flex flex-col gap-2.5 border border-cyan-500/20 bg-slate-950/60 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-cyan-300 text-[11px] font-mono">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>{config.protocol}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] tabular-nums">
              {formatSpeed(stats.speedDown)}
            </div>
            <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider font-semibold">
              {isAr ? 'سرعة النفق اللحظية' : 'LIVE TUNNEL SPEED'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-emerald-400 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>UDPGW: {config.udpgwPort || 7300}</span>
          </div>
        </div>

        {/* Live SVG Waveform Chart */}
        <div className="w-full h-9 overflow-hidden flex items-end bg-black/50 rounded-xl px-2 py-1 border border-white/5">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="w-full h-full">
            {pointsDown && (
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsDown}
              />
            )}
            {pointsUp && (
              <polyline
                fill="none"
                stroke="#a855f7"
                strokeWidth="1.8"
                strokeDasharray="4,2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsUp}
              />
            )}
          </svg>
        </div>
      </div>

      {/* 3. Real-Time Telemetry Counters (KPI Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Download Speed */}
        <div className="p-3 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1">
              <ArrowDownCircle className="w-3.5 h-3.5 text-cyan-400" />
              {isAr ? 'تنزيل' : 'Download'}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">RX</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-cyan-300 tabular-nums">
            {formatSpeed(stats.speedDown)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {formatBytes(stats.bytesIn)}
          </div>
        </div>

        {/* Upload Speed */}
        <div className="p-3 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1">
              <ArrowUpCircle className="w-3.5 h-3.5 text-purple-400" />
              {isAr ? 'رفع' : 'Upload'}
            </span>
            <span className="text-[10px] text-purple-400 font-mono">TX</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-purple-300 tabular-nums">
            {formatSpeed(stats.speedUp)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {formatBytes(stats.bytesOut)}
          </div>
        </div>

        {/* Ping / Latency */}
        <div className="p-3 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              {isAr ? 'زمن الاستجابة' : 'Ping'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">RTT</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-emerald-300 tabular-nums">
            {stats.pingMs > 0 ? `${stats.pingMs} ms` : '--'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Jitter: {stats.jitterMs} ms
          </div>
        </div>

        {/* Total Transferred */}
        <div className="p-3 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? 'البيانات المنقولة' : 'Total Bandwidth'}
            </span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-amber-300 tabular-nums">
            {formatBytes(stats.bytesIn + stats.bytesOut)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            Loss: {stats.packetLossPercent.toFixed(1)}%
          </div>
        </div>
      </div>

    </div>
  );
};
