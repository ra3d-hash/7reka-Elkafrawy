import React, { useState } from 'react';
import { Shield, Globe, Smartphone, Monitor, Sliders, Search, Sparkles, User as UserIcon, Volume2, VolumeX, Cpu } from 'lucide-react';
import { ConnectionState } from '../types/tunnel';
import { User } from '../types/auth';
import { sfx } from '../services/soundEffects';

interface TopBarProps {
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  isMobileView: boolean;
  onToggleMobileView: () => void;
  connectionState: ConnectionState;
  currentUser: User | null;
  onOpenPresets: () => void;
  onOpenTools: () => void;
  onOpenProfile: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenAPK?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  lang,
  onToggleLang,
  isMobileView,
  onToggleMobileView,
  connectionState,
  currentUser,
  onOpenPresets,
  onOpenTools,
  onOpenProfile,
  isMuted,
  onToggleSound,
  onOpenAPK
}) => {
  const isAr = lang === 'ar';
  const isConnected = connectionState === 'CONNECTED';
  const [logoClicks, setLogoClicks] = React.useState(0);

  const handleSecretAPKClick = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    sfx.playClick();
    if (next >= 3) {
      setLogoClicks(0);
      onOpenAPK?.();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#030712]/80 backdrop-blur-2xl px-3 sm:px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Zone with Secret Triple-Click APK Download */}
        <div 
          onClick={handleSecretAPKClick}
          className="flex items-center gap-3 shrink-0 cursor-pointer group"
          title={isAr ? 'اضغط 3 مرات هنا بشكل سري لتحميل تطبيق APK' : 'Triple-click for secret APK download'}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/30 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:border-cyan-400 transition-colors">
            <Shield className="w-5 h-5 text-cyan-400" />
            {isConnected && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#030712] animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-mono group-hover:text-cyan-300 transition-colors">
                Elarb Tunnel <span className="text-cyan-400">Plus</span>
              </h1>
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono tracking-wider font-bold rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                {isAr ? 'العرب ⚡ APK' : 'ELARB ⚡ APK'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-none">
              {isAr ? 'تطبيق العرب للأنفاق المشفرة · تلي: @elarp_vip | واتس: @uncle_elbhiry' : 'Elarb Encrypted Tunnel · @elarp_vip'}
            </p>
          </div>
        </div>

        {/* Quick Utilities & Navigation */}
        <div className="flex items-center gap-2">
          {/* Presets Button */}
          <button
            onClick={onOpenPresets}
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 hover:border-cyan-500/40 transition-colors whitespace-nowrap shrink-0 min-h-[38px]"
            title={isAr ? 'السيرفرات والكونفجات الجاهزة' : 'Preloaded Presets'}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isAr ? 'كونفجات مصر' : 'Presets'}</span>
          </button>

          {/* Tools Menu Button ("خليها أدوات") */}
          <button
            onClick={onOpenTools}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 shadow-sm transition-all whitespace-nowrap shrink-0 min-h-[38px]"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'الأدوات' : 'Tools'}</span>
          </button>

          {/* Sound Effects Toggle Button ("مؤثرات صوتية") */}
          <button
            onClick={onToggleSound}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 min-h-[38px] ${
              !isMuted 
                ? 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-700'
            }`}
            title={!isMuted ? (isAr ? 'كتم المؤثرات الصوتية' : 'Mute Sound FX') : (isAr ? 'تشغيل المؤثرات الصوتية' : 'Unmute Sound FX')}
          >
            {!isMuted ? <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span className="hidden sm:inline">{!isMuted ? (isAr ? 'الصوت نشط' : 'SFX ON') : (isAr ? 'الصوت مكتوم' : 'MUTED')}</span>
          </button>

          {/* User Profile Button */}
          {currentUser && (
            <button
              onClick={onOpenProfile}
              type="button"
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 hover:border-cyan-500/40 transition-colors shrink-0 min-h-[38px]"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-slate-950">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.name}</span>
            </button>
          )}

          {/* Mobile Chassis Toggle */}
          <button
            onClick={onToggleMobileView}
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-white/[0.05] text-slate-300 hover:text-white border border-white/10 hover:border-slate-700 transition-colors whitespace-nowrap shrink-0 min-h-[38px]"
            title={isMobileView ? (isAr ? 'التبديل للشاشة الكاملة' : 'Switch to Fluid Desktop') : (isAr ? 'محاكاة شاشة الموبايل' : 'Mobile Frame Preview')}
          >
            {isMobileView ? <Monitor className="w-3.5 h-3.5 text-cyan-400" /> : <Smartphone className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/50 transition-colors whitespace-nowrap shrink-0 min-h-[38px]"
            title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
