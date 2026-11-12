import React from 'react';
import { 
  X, 
  Search, 
  Lock, 
  Sliders, 
  Sparkles, 
  Share2, 
  Zap, 
  ShieldCheck, 
  Video, 
  ChevronRight,
  Cpu,
  Globe,
  Smartphone,
  Gamepad2
} from 'lucide-react';

import { sfx } from '../services/soundEffects';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  onOpenPresets: () => void;
  onOpenHostChecker: () => void;
  onOpenSettings: () => void;
  onOpenConfigManager: () => void;
  onOpenMediaCustomizer: () => void;
  onOpenRealBrowser?: () => void;
  onOpenGamingBooster?: () => void;
}

export const ToolsModal: React.FC<ToolsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onOpenPresets,
  onOpenHostChecker,
  onOpenSettings,
  onOpenConfigManager,
  onOpenMediaCustomizer,
  onOpenRealBrowser,
  onOpenGamingBooster
}) => {
  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const toolItems = [
    {
      id: 'gaming-booster',
      title: isAr ? 'ببجي وألعاب الأونلاين - تثبيت البنج 🎮' : 'PUBG & Gaming Anti-Lag Booster',
      desc: isAr ? 'سيرفرات UDP ومحسن البنج لمنع اللاج والتقطيع في الألعاب' : 'Low ping UDP routing & anti-lag for mobile gaming',
      icon: <Gamepad2 className="w-5 h-5 text-cyan-400" />,
      action: () => { sfx.playClick(); onClose(); onOpenGamingBooster?.(); }
    },
    {
      id: 'real-browser',
      title: isAr ? 'متصفح النفق الحقيقي 🌐' : 'Real Tunnel Browser',
      desc: isAr ? 'تصفح المواقع المحجوبة مباشرة عبر بايلود النفق' : 'Unblocked web browsing via active tunnel proxy',
      icon: <Globe className="w-5 h-5 text-emerald-400" />,
      action: () => { sfx.playClick(); onClose(); onOpenRealBrowser?.(); }
    },

    {
      id: 'presets',
      title: isAr ? 'سيرفرات شبكات مصر الجاهزة' : 'Egyptian Carrier Presets',
      desc: isAr ? 'سيرفرات جاهزة لفودافون وأورنج واتصالات ووي' : 'Vodafone, Orange, Etisalat, and WE configs',
      icon: <Sparkles className="w-5 h-5 text-blue-400" />,
      action: () => { sfx.playClick(); onClose(); onOpenPresets(); }
    },
    {
      id: 'hostchecker',
      title: isAr ? 'صائد الثغرات وفاحص الهوست' : 'Host Checker & Bug Hunter',
      desc: isAr ? 'فحص استجابة الهوستات وأكواد HTTP 101/200' : 'Test Bug SNI, response codes & headers',
      icon: <Search className="w-5 h-5 text-blue-400" />,
      action: () => { sfx.playClick(); onClose(); onOpenHostChecker(); }
    },
    {
      id: 'lockhat',
      title: isAr ? 'إنشاء وقفل كونفجات .hat' : 'Create & Lock .hat Config',
      desc: isAr ? 'قفل ببصمة الجهاز HWID وكلمة سر وتاريخ انتهاء' : 'Lock with HWID, password & expiration date',
      icon: <Lock className="w-5 h-5 text-amber-400" />,
      action: () => { sfx.playClick(); onClose(); onOpenConfigManager(); }
    },
    {
      id: 'media',
      title: isAr ? 'تخصيص شاشة الفيديو والصورة' : 'Customize Video / Media Screen',
      desc: isAr ? 'ضع رابط الفيديو أو الصورة المفضلة في الشاشة' : 'Paste custom video loop or image background',
      icon: <Video className="w-5 h-5 text-rose-400" />,
      action: () => { sfx.playClick(); onClose(); onOpenMediaCustomizer(); }
    },
    {
      id: 'settings',
      title: isAr ? 'إعدادات النفق وDNS وUDPGW' : 'Tunnel Settings & DNS',
      desc: isAr ? 'مغير DNS ومنافذ بوابة الألعاب 7300 وبصمة HWID' : 'DNS switcher, UDPGW 7300, and Hotspot proxy',
      icon: <Sliders className="w-5 h-5 text-emerald-400" />,
      action: () => { onClose(); onOpenSettings(); }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl">
      <div className="relative w-full max-w-lg bg-[#050b18]/90 border border-cyan-500/35 rounded-3xl p-5 sm:p-6 shadow-[0_8px_32px_0_rgba(6,182,212,0.25)] overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/30 border border-cyan-500/40">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide text-white font-mono uppercase">
                {isAr ? 'ترسانة الأدوات والخدمات' : 'TOOLS & UTILITIES'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'كافة أدوات النفق، فحص الثغرات، وإدارة النظام' : 'Advanced tunneling tools, bypasses & admin'}
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

        {/* Tools Grid / List */}
        <div className="my-4 space-y-2.5 max-h-[65vh] overflow-y-auto">
          {toolItems.map(item => (
            <div
              key={item.id}
              onClick={item.action}
              className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/60 cursor-pointer transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-cyan-500/40 transition-colors shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0 rtl:rotate-180" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
