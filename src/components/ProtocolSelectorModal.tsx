import React from 'react';
import { X, Check, Shield, Zap, Lock, Radio, Cpu, Network } from 'lucide-react';
import { ProtocolType } from '../types/tunnel';

interface ProtocolSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProtocol: ProtocolType;
  onSelectProtocol: (proto: ProtocolType) => void;
  lang: 'ar' | 'en';
}

interface ProtocolDef {
  type: ProtocolType;
  title: string;
  titleAr: string;
  desc: string;
  descAr: string;
  tag: string;
  speed: string;
  icon: React.ReactNode;
}

export const ProtocolSelectorModal: React.FC<ProtocolSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedProtocol,
  onSelectProtocol,
  lang
}) => {
  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const protocols: ProtocolDef[] = [
    {
      type: 'SSH_SSL',
      title: 'SSH + SSL/TLS (Stunnel)',
      titleAr: 'SSH + SSL/TLS (ستانل مشفر)',
      desc: 'Encrypted TLS 1.3 handshake with Bug SNI spoofing. Best for Vodafone & Etisalat free net.',
      descAr: 'مصافحة مشفرة بتزييف هوست SNI. الأفضل لثغرات فودافون واتصالات بدون رصيد.',
      tag: 'RECOMMENDED',
      speed: '95 MB/s',
      icon: <Lock className="w-5 h-5 text-cyan-400" />
    },
    {
      type: 'HYSTERIA_UDP',
      title: 'Hysteria UDP v2 (Low Ping)',
      titleAr: 'Hysteria UDP v2 (بنج منخفض للألعاب)',
      desc: 'Brutal UDP congestion protocol that pushes through throttle limits with 25ms ping.',
      descAr: 'بروتوكول UDP متطور مضاد لتقطيع وبطء مزودي الخدمة، مخصص للألعاب والبث المباشر.',
      tag: 'GAMING / LOW PING',
      speed: '120 MB/s',
      icon: <Zap className="w-5 h-5 text-amber-400" />
    },
    {
      type: 'V2RAY_VMESS',
      title: 'V2Ray VMess + WebSocket',
      titleAr: 'V2Ray VMess + ويب سوكيت',
      desc: 'Camouflages traffic as standard HTTPS CDN browsing to bypass deep state firewalls.',
      descAr: 'تمويه حركة البيانات كأنها تصفح ويب عادي عبر شبكات CDN لتخطي جدران الحماية.',
      tag: 'ANTI-DPI',
      speed: '85 MB/s',
      icon: <Network className="w-5 h-5 text-purple-400" />
    },
    {
      type: 'V2RAY_VLESS',
      title: 'V2Ray VLESS (XTLS)',
      titleAr: 'V2Ray VLESS (بدون تشفير مضاعف)',
      desc: 'Next-gen lightweight tunnel with direct TLS pass-through for maximum mobile battery efficiency.',
      descAr: 'بروتوكول فائق السرعة وخفيف جداً على بطارية الهاتف ومخصص للأداء العالي.',
      tag: 'ULTRA FAST',
      speed: '110 MB/s',
      icon: <Radio className="w-5 h-5 text-blue-400" />
    },
    {
      type: 'SSH_PAYLOAD',
      title: 'SSH + HTTP Custom Payload',
      titleAr: 'SSH + حقن بايلود مخصص',
      desc: 'Injects custom HTTP headers (Host, User-Agent, X-Online) with HTTP 101 Switching Protocols.',
      descAr: 'حقن ترويسات HTTP مخصصة لتجاوز بوابات شبكات أورنج وفودافون المفتوحة.',
      tag: 'CUSTOM PAYLOAD',
      speed: '70 MB/s',
      icon: <Cpu className="w-5 h-5 text-emerald-400" />
    },
    {
      type: 'OPENVPN',
      title: 'OpenVPN (TCP / UDP)',
      titleAr: 'أوبن في بي إن (OpenVPN Core)',
      desc: 'Industry standard open-source tunnel with military-grade AES-256-GCM encryption.',
      descAr: 'المعيار العالمي للشبكات الافتراضية بتشفير عسكري AES-256 مع أقصى درجات الخصوصية.',
      tag: 'ENTERPRISE',
      speed: '65 MB/s',
      icon: <Shield className="w-5 h-5 text-sky-400" />
    },
    {
      type: 'WIREGUARD',
      title: 'WireGuard (Noise Protocol)',
      titleAr: 'واير جارد (WireGuard)',
      desc: 'High-speed kernel level modern crypto with near-instant handshake in 50ms.',
      descAr: 'تشفير حديث فائق السرعة يتم الاتصال به خلال أجزاء من الثانية.',
      tag: 'MODERN CRYPTO',
      speed: '115 MB/s',
      icon: <Zap className="w-5 h-5 text-yellow-400" />
    },
    {
      type: 'SLOWDNS',
      title: 'SlowDNS / DNSTT',
      titleAr: 'سلو دي إن إس (SlowDNS / DNSTT)',
      desc: 'DNS tunneling over UDP port 53. Works in extreme situations even without active SIM data!',
      descAr: 'نفق عبر استعلامات DNS على منفذ 53. يعمل في أصعب الظروف حتى لو تم قطع باقة النت كلياً!',
      tag: 'EMERGENCY BYPASS',
      speed: '25 MB/s',
      icon: <Network className="w-5 h-5 text-rose-400" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[90vh] bg-[#070e20] border border-cyan-800/60 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div>
            <h3 className="text-base font-bold text-white">
              {isAr ? 'اختر بروتوكول النفق' : 'Select Tunnel Protocol'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr ? 'بروتوكولات متعددة لتجاوز كافة أنواع الحجب وفحص الحزم' : 'Multi-protocol engine for advanced evasion'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Protocols */}
        <div className="p-4 overflow-y-auto space-y-2.5">
          {protocols.map(proto => {
            const isSelected = selectedProtocol === proto.type;
            return (
              <div
                key={proto.type}
                onClick={() => {
                  onSelectProtocol(proto.type);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                    {proto.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {isAr ? proto.titleAr : proto.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                        {proto.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                      {isAr ? proto.descAr : proto.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 hidden sm:inline">
                    {proto.speed}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
