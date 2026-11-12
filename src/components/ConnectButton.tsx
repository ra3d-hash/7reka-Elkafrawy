import React from 'react';
import { Power, ShieldCheck, RefreshCw, Lock } from 'lucide-react';
import { ConnectionState } from '../types/tunnel';

interface ConnectButtonProps {
  state: ConnectionState;
  onToggle: () => void;
  lang: 'ar' | 'en';
  uptimeSeconds: number;
}

export const ConnectButton: React.FC<ConnectButtonProps> = ({
  state,
  onToggle,
  lang,
  uptimeSeconds
}) => {
  const isAr = lang === 'ar';
  const isConnected = state === 'CONNECTED';
  const isConnecting = state !== 'DISCONNECTED' && state !== 'CONNECTED';

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateDescription = () => {
    switch (state) {
      case 'RESOLVING':
        return isAr ? 'جارٍ حل السيرفر وDNS...' : 'Resolving Server & DoH...';
      case 'SPOOFING_TLS':
        return isAr ? 'تزييف بصمة TLS وتخطي DPI...' : 'Spoofing TLS Fingerprint...';
      case 'INJECTING_PAYLOAD':
        return isAr ? 'حقن البايلود وهوست التجاوز...' : 'Injecting Bug Host Payload...';
      case 'HANDSHAKING':
        return isAr ? 'المصافحة وتفعيل UDPGW...' : 'SSL Handshake & UDPGW...';
      case 'CONNECTED':
        return isAr ? 'النفق مشفر ومتصل بنجاح' : 'Tunnel Encrypted & Connected';
      default:
        return isAr ? 'انقر للاتصال وتجاوز القيود بضغطة زر' : 'Tap to Connect (1-Click Bypass)';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      {/* Central Interactive Radial Ring */}
      <div className="relative flex items-center justify-center">
        {/* Outer Pulsing Radar Rings */}
        {isConnected && (
          <>
            <div className="absolute w-44 h-44 rounded-full border border-emerald-500/20 animate-radar pointer-events-none" />
            <div className="absolute w-52 h-52 rounded-full border border-emerald-500/10 animate-radar [animation-delay:0.8s] pointer-events-none" />
          </>
        )}

        {isConnecting && (
          <div className="absolute w-48 h-48 rounded-full border border-cyan-500/30 animate-spin border-t-transparent pointer-events-none" />
        )}

        {/* Glow backdrop */}
        <div
          className={`absolute w-36 h-36 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
            isConnected
              ? 'bg-emerald-500/25'
              : isConnecting
              ? 'bg-cyan-500/30'
              : 'bg-blue-600/10'
          }`}
        />

        {/* The Tactile 1-Click Button */}
        <button
          onClick={onToggle}
          type="button"
          aria-label={isConnected ? (isAr ? 'فصل الاتصال' : 'Disconnect') : (isAr ? 'بدء الاتصال' : 'Connect')}
          className={`relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 select-none cursor-pointer ${
            isConnected
              ? 'bg-gradient-to-b from-emerald-950/80 to-[#030712] border-2 border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.35)] active:scale-95'
              : isConnecting
              ? 'bg-gradient-to-b from-cyan-950/80 to-[#030712] border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-95'
              : 'bg-gradient-to-b from-slate-900/90 to-[#050b18] border-2 border-cyan-800/50 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] active:scale-95'
          }`}
        >
          {/* Central Icon */}
          <div className="mb-2 transition-transform duration-300">
            {isConnecting ? (
              <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
            ) : isConnected ? (
              <ShieldCheck className="w-11 h-11 text-emerald-400" />
            ) : (
              <Power className="w-10 h-10 text-cyan-400" />
            )}
          </div>

          {/* Action text */}
          <span className="text-sm font-black tracking-wider uppercase">
            {isConnecting ? (
              <span className="text-cyan-300">{isAr ? 'جارٍ الاتصال' : 'CONNECTING'}</span>
            ) : isConnected ? (
              <span className="text-emerald-400">{isAr ? 'متصل' : 'CONNECTED'}</span>
            ) : (
              <span className="text-slate-100">{isAr ? 'ابدأ الاتصال' : 'START'}</span>
            )}
          </span>

          {/* Subtext inside button */}
          <span className="text-[10px] font-mono text-slate-400 mt-1">
            {isConnected ? formatUptime(uptimeSeconds) : '1-CLICK BYPASS'}
          </span>
        </button>
      </div>

      {/* State & DPI Evasion Status Banner */}
      <div className="mt-5 text-center max-w-sm">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-300">
          <Lock className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-cyan-400'}`} />
          <span>{getStateDescription()}</span>
        </div>
      </div>
    </div>
  );
};
