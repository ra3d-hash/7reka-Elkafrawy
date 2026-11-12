/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Shield, 
  Sparkles, 
  FileCode, 
  Search, 
  Sliders, 
  MapPin, 
  Lock, 
  Zap,
  Smartphone,
  Globe,
  Share2,
  Users,
  Cpu,
  Video,
  Volume2,
  VolumeX
} from 'lucide-react';
import { TopBar } from './components/TopBar';
import { ConnectButton } from './components/ConnectButton';
import { LiveTelemetryStream } from './components/LiveTelemetryStream';
import { ConfigCard } from './components/ConfigCard';
import { ProtocolSelectorModal } from './components/ProtocolSelectorModal';
import { ConfigManagerModal } from './components/ConfigManagerModal';
import { HostCheckerModal } from './components/HostCheckerModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthGateScreen } from './components/AuthGateScreen';
import { UserProfileModal } from './components/UserProfileModal';
import { ToolsModal } from './components/ToolsModal';
import { MediaCustomizerModal } from './components/MediaCustomizerModal';
import { VPNPermissionModal } from './components/VPNPermissionModal';
import { RealWebBrowserModal } from './components/RealWebBrowserModal';
import { GamingBoosterModal } from './components/GamingBoosterModal';
import { APKDownloadModal } from './components/APKDownloadModal';
import { DEFAULT_PRESETS } from './constants/presets';
import { telemetryEngine } from './services/telemetryEngine';
import { authService } from './services/authService';
import { sfx } from './services/soundEffects';
import { TunnelConfig, ConnectionState, TelemetryStats, ProtocolType } from './types/tunnel';
import { User } from './types/auth';

const DEFAULT_MEDIA_URL = 'https://www.image2url.com/r2/default/videos/1794337076226-1a13d9ab-55b6-453c-9cc1-cc68b3716c81.mp4';

export default function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Mandatory Auth Gate: starts as null unless session is active
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  
  // Custom video / image URL state with user's video link as default
  const [customMediaUrl, setCustomMediaUrl] = useState<string>(() => {
    const saved = localStorage.getItem('elarb_custom_media_url') || localStorage.getItem('hamo_custom_media_url');
    if (!saved || saved.includes('mixkit')) {
      localStorage.setItem('elarb_custom_media_url', DEFAULT_MEDIA_URL);
      return DEFAULT_MEDIA_URL;
    }
    return saved;
  });
  const [isCustomVideo, setIsCustomVideo] = useState<boolean>(() => {
    const saved = localStorage.getItem('elarb_custom_is_video') ?? localStorage.getItem('hamo_custom_is_video');
    return saved !== 'false';
  });

  // Current active configuration
  const [currentConfig, setCurrentConfig] = useState<TunnelConfig>(DEFAULT_PRESETS[0].config);
  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED');
  const [stats, setStats] = useState<TelemetryStats>({
    bytesIn: 0,
    bytesOut: 0,
    speedDown: 0,
    speedUp: 0,
    pingMs: 0,
    jitterMs: 0,
    packetsIn: 0,
    packetsOut: 0,
    packetLossPercent: 0,
    uptimeSeconds: 0,
    connectedIp: '185.220.101.44',
    realIp: '156.204.18.91 (Cairo, EG)',
    serverLocation: 'Cairo, Egypt 🇪🇬 (Vodafone / TE Gateway)',
    cipherSuite: 'CHACHA20-POLY1305'
  });

  // Modals
  const [isConfigManagerOpen, setIsConfigManagerOpen] = useState(false);
  const [configManagerTab, setConfigManagerTab] = useState<'PRESETS' | 'IMPORT' | 'EXPORT'>('PRESETS');
  const [isProtocolSelectorOpen, setIsProtocolSelectorOpen] = useState(false);
  const [isHostCheckerOpen, setIsHostCheckerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMediaCustomizerOpen, setIsMediaCustomizerOpen] = useState(false);
  const [isRealBrowserOpen, setIsRealBrowserOpen] = useState(false);
  const [isGamingBoosterOpen, setIsGamingBoosterOpen] = useState(false);
  const [isAPKModalOpen, setIsAPKModalOpen] = useState(false);

  // VPN Permission Flow
  const [isVPNPermissionOpen, setIsVPNPermissionOpen] = useState(false);
  const [isVPNPermissionGranted, setIsVPNPermissionGranted] = useState(() => {
    return localStorage.getItem('elarb_vpn_granted') === 'true';
  });

  // Audio Effects Mute state
  const [isMuted, setIsMuted] = useState(sfx.getMuted());

  const handleToggleSound = () => {
    const nextMuted = sfx.toggleMute();
    setIsMuted(nextMuted);
  };

  // Subscribe to telemetry engine & auth service
  useEffect(() => {
    const unsubTelemetry = telemetryEngine.subscribe((newStats, _newLogs, newState) => {
      setStats(newStats);
      setConnectionState(newState);
    });

    const unsubAuth = authService.subscribe(() => {
      setCurrentUser(authService.getCurrentUser());
    });

    return () => {
      unsubTelemetry();
      unsubAuth();
    };
  }, []);

  // Native Android VpnService bridge callbacks
  useEffect(() => {
    (window as any).onVpnConnected = () => {
      setConnectionState('CONNECTED');
      sfx.playConnected();
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch {
        // no-op
      }
    };
    (window as any).onVpnDisconnected = () => {
      setConnectionState('DISCONNECTED');
      sfx.playDisconnect();
    };
    return () => {
      delete (window as any).onVpnConnected;
      delete (window as any).onVpnDisconnected;
    };
  }, []);

  const handleSaveMedia = (url: string, isVid: boolean) => {
    sfx.playSuccess();
    const finalUrl = url.trim() || DEFAULT_MEDIA_URL;
    setCustomMediaUrl(finalUrl);
    setIsCustomVideo(isVid);
    localStorage.setItem('elarb_custom_media_url', finalUrl);
    localStorage.setItem('elarb_custom_is_video', String(isVid));
  };

  const startConnection = () => {
    sfx.playConnectStart();

    // Trigger native Android system VPN if running inside APK
    if ((window as any).AndroidVPN?.startVpn) {
      try {
        (window as any).AndroidVPN.startVpn();
      } catch (e) {
        console.warn('Native VPN call fallback:', e);
      }
    }

    telemetryEngine.connect(currentConfig, (st) => {
      setConnectionState(st);
      if (st === 'CONNECTED') {
        sfx.playConnected();
        try {
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        } catch {
          // no-op
        }
      }
    });
  };

  const handleToggleConnect = () => {
    if (connectionState === 'CONNECTED') {
      sfx.playDisconnect();
      if ((window as any).AndroidVPN?.stopVpn) {
        try {
          (window as any).AndroidVPN.stopVpn();
        } catch (e) {
          console.warn('Native VPN stop fallback:', e);
        }
      }
      telemetryEngine.disconnect(setConnectionState);
    } else if (connectionState === 'DISCONNECTED') {
      if (!isVPNPermissionGranted) {
        setIsVPNPermissionOpen(true);
      } else {
        startConnection();
      }
    }
  };

  const handleVPNAllow = () => {
    setIsVPNPermissionGranted(true);
    localStorage.setItem('elarb_vpn_granted', 'true');
    setIsVPNPermissionOpen(false);
    startConnection();
  };

  const handleVPNDeny = () => {
    setIsVPNPermissionOpen(false);
  };

  const handleApplyConfig = (newConfig: TunnelConfig) => {
    sfx.playSwitch();
    setCurrentConfig(newConfig);
    telemetryEngine.addLog('INFO', `[CONFIG] تم تبديل الكونفج النشط إلى: ${newConfig.name}`);
  };

  const handleSelectProtocol = (proto: ProtocolType) => {
    sfx.playSwitch();
    setCurrentConfig(prev => ({ ...prev, protocol: proto }));
    telemetryEngine.addLog('INFO', `[PROTOCOL] تم تغيير بروتوكول النفق إلى: ${proto}`);
  };

  const handleApplyBugHost = (host: string) => {
    sfx.playSwitch();
    setCurrentConfig(prev => ({
      ...prev,
      bugHostSNI: host,
      name: `${prev.name.split(' [')[0]} [${host}]`
    }));
  };

  const isAr = lang === 'ar';
  const isConnected = connectionState === 'CONNECTED';

  return (
    <div 
      dir={isAr ? 'rtl' : 'ltr'} 
      className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950"
    >
      {!currentUser ? (
        <AuthGateScreen
          lang={lang}
          onToggleLang={() => setLang(prev => prev === 'ar' ? 'en' : 'ar')}
          onSuccess={() => setCurrentUser(authService.getCurrentUser())}
          customMediaUrl={customMediaUrl}
          isCustomVideo={isCustomVideo}
          onOpenMediaCustomizer={() => setIsMediaCustomizerOpen(true)}
        />
      ) : (
        <>
          {/* Top Bar with Brand, Quick Presets, Tools, Audio FX, and User Profile */}
          <TopBar
            lang={lang}
            onToggleLang={() => setLang(prev => prev === 'ar' ? 'en' : 'ar')}
            isMobileView={isMobileView}
            onToggleMobileView={() => setIsMobileView(prev => !prev)}
            connectionState={connectionState}
            currentUser={currentUser}
            onOpenPresets={() => {
              sfx.playClick();
              setConfigManagerTab('PRESETS');
              setIsConfigManagerOpen(true);
            }}
            onOpenTools={() => {
              sfx.playClick();
              setIsToolsModalOpen(true);
            }}
            onOpenProfile={() => {
              sfx.playClick();
              setIsProfileModalOpen(true);
            }}
            isMuted={isMuted}
            onToggleSound={handleToggleSound}
            onOpenAPK={() => {
              sfx.playClick();
              setIsAPKModalOpen(true);
            }}
          />

      {/* Main App Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 flex flex-col items-center">
        {/* Mobile View chassis / Fluid container */}
        <div className={`w-full transition-all duration-300 ${isMobileView ? 'max-w-md mx-auto p-4 rounded-3xl border-2 border-cyan-800/50 bg-[#040815] shadow-2xl my-2' : ''}`}>
          
          {/* Egyptian Carrier Selector Chips (100% Egypt Only) */}
          <div className="w-full mb-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'vodafone', name: 'Vodafone EG', nameAr: 'فودافون مصر', color: 'from-red-950/60 to-slate-900 border-red-800/40 hover:border-red-500', activeBorder: 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]', presetId: 'eg-vodafone-00-sni' },
              { id: 'orange', name: 'Orange EG', nameAr: 'أورنج مصر', color: 'from-orange-950/60 to-slate-900 border-orange-800/40 hover:border-orange-500', activeBorder: 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.25)]', presetId: 'eg-orange-free-portal' },
              { id: 'etisalat', name: 'Etisalat e&', nameAr: 'اتصالات مصر e&', color: 'from-emerald-950/60 to-slate-900 border-emerald-800/40 hover:border-emerald-500', activeBorder: 'border-emerald-500 shadow-[0_0_15px_rgba(168,85,247,0.25)]', presetId: 'eg-etisalat-twist-ssl' },
              { id: 'we', name: 'WE Telecom', nameAr: 'المصرية للاتصالات WE', color: 'from-purple-950/60 to-slate-900 border-purple-800/40 hover:border-purple-500', activeBorder: 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)]', presetId: 'eg-we-hysteria-gaming' }
            ].map((carrier) => {
              const isSelected = currentConfig.operatorName?.toLowerCase().includes(carrier.id) || currentConfig.name.toLowerCase().includes(carrier.id);
              return (
                <button
                  key={carrier.id}
                  type="button"
                  onClick={() => {
                    sfx.playSwitch();
                    const preset = DEFAULT_PRESETS.find(p => p.id === carrier.presetId);
                    if (preset) handleApplyConfig(preset.config);
                  }}
                  className={`p-2.5 rounded-2xl bg-gradient-to-br ${carrier.color} border transition-all text-center flex flex-col items-center justify-center min-h-[52px] cursor-pointer ${
                    isSelected ? carrier.activeBorder : 'border-white/10'
                  }`}
                >
                  <span className="text-xs font-bold text-white tracking-wide">
                    {isAr ? carrier.nameAr : carrier.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {isAr ? 'شبكة مصر 🇪🇬' : 'Egypt 4G/5G'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hero Telemetry & Gateway Strip */}
          <div className="w-full mb-4 p-3 rounded-2xl glass-card flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-slate-400">{isAr ? 'بوابة النفق: ' : 'Carrier Gateway: '}</span>
                <span className="font-bold text-white">{stats.serverLocation}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <div>
                <span className="text-slate-500">REAL IP: </span>
                <span className="text-slate-300">{stats.realIp}</span>
              </div>
              <span className="text-slate-600">→</span>
              <div>
                <span className="text-slate-500">VPN IP: </span>
                <span className={`font-bold ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isConnected ? stats.connectedIp : 'Protected'}
                </span>
              </div>
            </div>
          </div>

          {/* Main 2-Column Responsive Layout (Zero Overlapping, Glassmorphic) */}
          <div className={`grid gap-5 w-full ${isMobileView ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12 items-start'}`}>
            
            {/* Left Column (Desktop 5 cols): 1-Click Tactile Engine & Active Config Card */}
            <div className={`flex flex-col gap-4 order-2 lg:order-1 ${isMobileView ? 'w-full' : 'lg:col-span-5'}`}>
              
              {/* 1-Click Connect Button Card */}
              <div className="w-full glass-card rounded-3xl p-5 flex flex-col items-center justify-center">
                <ConnectButton
                  state={connectionState}
                  onToggle={handleToggleConnect}
                  lang={lang}
                  uptimeSeconds={stats.uptimeSeconds}
                />
              </div>

              {/* Active Config Card with Protocol & Host specs */}
              <ConfigCard
                config={currentConfig}
                lang={lang}
                onOpenPresets={() => {
                  setConfigManagerTab('PRESETS');
                  setIsConfigManagerOpen(true);
                }}
                onOpenConfigManager={() => {
                  setConfigManagerTab('IMPORT');
                  setIsConfigManagerOpen(true);
                }}
                onOpenProtocolSelector={() => setIsProtocolSelectorOpen(true)}
              />

              {/* Quick Action Dock ("خليها أدوات") */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setIsToolsModalOpen(true);
                  }}
                  className="p-3 rounded-2xl glass-card-interactive text-center flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer"
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-[11px] text-slate-200">
                    {isAr ? 'الأدوات' : 'Tools Dock'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setIsRealBrowserOpen(true);
                  }}
                  className={`p-3 rounded-2xl transition-all text-center flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer ${
                    isConnected 
                      ? 'bg-emerald-950/40 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'glass-card-interactive border-white/10'
                  }`}
                >
                  <Globe className={`w-4 h-4 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-blue-400'}`} />
                  <span className="font-bold text-[11px] text-slate-200">
                    {isAr ? 'المتصفح الخفي' : 'Tunnel Web'}
                  </span>
                </button>

                {/* Sound FX Toggle Action */}
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className={`p-3 rounded-2xl glass-card-interactive text-center flex flex-col items-center justify-center gap-1 min-h-[50px] cursor-pointer ${
                    !isMuted ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-white/10'
                  }`}
                  title={!isMuted ? (isAr ? 'كتم المؤثرات الصوتية' : 'Mute SFX') : (isAr ? 'تشغيل المؤثرات الصوتية' : 'Unmute SFX')}
                >
                  {!isMuted ? <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  <span className="font-bold text-[11px] text-slate-200">
                    {isAr ? (!isMuted ? 'مؤثرات صوتية' : 'الصوت مكتوم') : (!isMuted ? 'Audio SFX' : 'Muted')}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Column (Desktop 7 cols): Central Visualizer, Video Screen & Speedometer */}
            <div className={`w-full order-1 lg:order-2 flex flex-col gap-4 ${isMobileView ? '' : 'lg:col-span-7'}`}>
              <LiveTelemetryStream
                stats={stats}
                state={connectionState}
                config={currentConfig}
                lang={lang}
                customMediaUrl={customMediaUrl}
                isCustomVideo={isCustomVideo}
                onOpenMediaCustomizer={() => setIsMediaCustomizerOpen(true)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-[#02050c]/90 backdrop-blur-md px-4 py-3 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-200">Elarb Tunnel (تطبيق العرب)</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400 font-mono">Egyptian Carrier Bypass</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 font-mono">الحقوق:</span>
            <a
              href="https://t.me/elarp_vip"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:text-sky-300 font-mono font-bold underline"
            >
              Telegram @elarp_vip
            </a>
            <span className="text-slate-600">·</span>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-mono font-bold underline"
            >
              WhatsApp @uncle_elbhiry
            </a>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-emerald-400 font-bold">100% ONLINE 🇪🇬</span>
            <span>TLS 1.3 · ChaCha20</span>
          </div>
        </div>
      </footer>
      </>
      )}

      {/* Modals & Tools */}
      {isToolsModalOpen && (
        <ToolsModal
          isOpen={isToolsModalOpen}
          onClose={() => setIsToolsModalOpen(false)}
          lang={lang}
          onOpenPresets={() => {
            sfx.playClick();
            setConfigManagerTab('PRESETS');
            setIsConfigManagerOpen(true);
          }}
          onOpenHostChecker={() => {
            sfx.playClick();
            setIsHostCheckerOpen(true);
          }}
          onOpenSettings={() => {
            sfx.playClick();
            setIsSettingsOpen(true);
          }}
          onOpenConfigManager={() => {
            sfx.playClick();
            setConfigManagerTab('EXPORT');
            setIsConfigManagerOpen(true);
          }}
          onOpenMediaCustomizer={() => {
            sfx.playClick();
            setIsMediaCustomizerOpen(true);
          }}
          onOpenRealBrowser={() => {
            sfx.playClick();
            setIsRealBrowserOpen(true);
          }}
          onOpenGamingBooster={() => {
            sfx.playClick();
            setIsGamingBoosterOpen(true);
          }}

        />
      )}

      {isGamingBoosterOpen && (
        <GamingBoosterModal
          isOpen={isGamingBoosterOpen}
          onClose={() => setIsGamingBoosterOpen(false)}
          lang={lang}
          onApplyConfig={handleApplyConfig}
        />
      )}

      {isAPKModalOpen && (
        <APKDownloadModal
          isOpen={isAPKModalOpen}
          onClose={() => setIsAPKModalOpen(false)}
          lang={lang}
        />
      )}

      {isMediaCustomizerOpen && (
        <MediaCustomizerModal
          isOpen={isMediaCustomizerOpen}
          onClose={() => setIsMediaCustomizerOpen(false)}
          lang={lang}
          currentMediaUrl={customMediaUrl}
          isCustomVideo={isCustomVideo}
          onSaveMedia={handleSaveMedia}
        />
      )}

      {isConfigManagerOpen && (
        <ConfigManagerModal
          isOpen={isConfigManagerOpen}
          onClose={() => setIsConfigManagerOpen(false)}
          currentConfig={currentConfig}
          onApplyConfig={handleApplyConfig}
          lang={lang}
          defaultTab={configManagerTab}
        />
      )}

      {isProtocolSelectorOpen && (
        <ProtocolSelectorModal
          isOpen={isProtocolSelectorOpen}
          onClose={() => setIsProtocolSelectorOpen(false)}
          selectedProtocol={currentConfig.protocol}
          onSelectProtocol={handleSelectProtocol}
          lang={lang}
        />
      )}

      {isHostCheckerOpen && (
        <HostCheckerModal
          isOpen={isHostCheckerOpen}
          onClose={() => setIsHostCheckerOpen(false)}
          lang={lang}
          onApplyHost={handleApplyBugHost}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          lang={lang}
          dnsPrimary={currentConfig.dnsPrimary || '1.1.1.1'}
          dnsSecondary={currentConfig.dnsSecondary || '1.0.0.1'}
          onUpdateDNS={(p, s) => setCurrentConfig(prev => ({ ...prev, dnsPrimary: p, dnsSecondary: s }))}
          udpgwPort={currentConfig.udpgwPort || 7300}
          onUpdateUDPGW={(port) => setCurrentConfig(prev => ({ ...prev, udpgwPort: port }))}
        />
      )}

      {currentUser && isProfileModalOpen && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          lang={lang}
          user={currentUser}
          onLogout={() => {
            sfx.playDisconnect();
            authService.logout();
            setCurrentUser(null);
          }}
        />
      )}

      {isVPNPermissionOpen && (
        <VPNPermissionModal
          isOpen={isVPNPermissionOpen}
          onAllow={handleVPNAllow}
          onDeny={handleVPNDeny}
          lang={lang}
          appName="Elarb Tunnel"
        />
      )}

      {isRealBrowserOpen && (
        <RealWebBrowserModal
          isOpen={isRealBrowserOpen}
          onClose={() => setIsRealBrowserOpen(false)}
          lang={lang}
          currentConfig={currentConfig}
          isConnected={connectionState === 'CONNECTED'}
        />
      )}
    </div>
  );
}
