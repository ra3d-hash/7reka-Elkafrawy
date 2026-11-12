import React, { useState } from 'react';
import { X, Sliders, Shield, Wifi, Smartphone, Copy, Check, BatteryCharging, Share2 } from 'lucide-react';
import { getDeviceHWID } from '../services/configParser';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  dnsPrimary: string;
  dnsSecondary: string;
  onUpdateDNS: (primary: string, secondary: string) => void;
  udpgwPort: number;
  onUpdateUDPGW: (port: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  dnsPrimary,
  dnsSecondary,
  onUpdateDNS,
  udpgwPort,
  onUpdateUDPGW
}) => {
  const [primary, setPrimary] = useState(dnsPrimary);
  const [secondary, setSecondary] = useState(dnsSecondary);
  const [port, setPort] = useState(udpgwPort);
  const [wakeLock, setWakeLock] = useState(true);
  const [antiDPIFrag, setAntiDPIFrag] = useState(true);
  const [copiedHWID, setCopiedHWID] = useState(false);

  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const hwid = getDeviceHWID();

  const dnsPresets = [
    { label: 'Cloudflare (1.1.1.1)', p: '1.1.1.1', s: '1.0.0.1' },
    { label: 'Google (8.8.8.8)', p: '8.8.8.8', s: '8.8.4.4' },
    { label: 'AdGuard AdBlock', p: '94.140.14.14', s: '94.140.15.15' },
    { label: 'Quad9 Secure', p: '9.9.9.9', s: '149.112.112.112' }
  ];

  const handleCopyHWID = () => {
    navigator.clipboard.writeText(hwid);
    setCopiedHWID(true);
    setTimeout(() => setCopiedHWID(false), 2000);
  };

  const handleSave = () => {
    onUpdateDNS(primary, secondary);
    onUpdateUDPGW(port);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-xl max-h-[90vh] bg-[#070e20] border border-cyan-800/60 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              {isAr ? 'إعدادات النفق المتقدمة' : 'Advanced Tunnel Settings'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr ? 'تخصيص خوادم DNS، بوابة الألعاب UDPGW، ومشاركة النفق' : 'Configure DNS, gaming UDPGW port, and VPN tethering'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* HWID Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-900/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                {isAr ? 'معرف جهازك الخاص (Hardware ID):' : 'Your Hardware ID (HWID):'}
              </span>
              <button
                type="button"
                onClick={handleCopyHWID}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                {copiedHWID ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHWID ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ البصمة' : 'Copy HWID')}</span>
              </button>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
              {hwid}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {isAr ? 'أرسل هذا الكود لمنشئ الكونفج إذا كان يريد قفله على جهازك فقط.' : 'Share this HWID with config creators to lock .hat to your device.'}
            </p>
          </div>

          {/* DNS Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'خادم الأسماء (DNS Resolver)' : 'DNS Resolver'}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {dnsPresets.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setPrimary(preset.p);
                    setSecondary(preset.s);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                    primary === preset.p
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-0.5">Primary DNS</label>
                <input
                  type="text"
                  value={primary}
                  onChange={e => setPrimary(e.target.value)}
                  className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-0.5">Secondary DNS</label>
                <input
                  type="text"
                  value={secondary}
                  onChange={e => setSecondary(e.target.value)}
                  className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300"
                />
              </div>
            </div>
          </div>

          {/* UDP Gateway Port */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isAr ? 'منفذ بوابة الألعاب (UDPGW Port)' : 'Gaming UDP Gateway Port'}
            </label>
            <input
              type="number"
              value={port}
              onChange={e => setPort(parseInt(e.target.value, 10) || 7300)}
              className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400"
            />
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isAr ? 'ضروري لتشغيل محادثات وألعاب الأونلاين (ببجي، فري فاير، كول أوف ديوتي).' : 'Required for low ping voice chat and online multiplayer.'}
            </p>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 cursor-pointer">
              <span className="text-xs text-slate-300 flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-cyan-400" />
                {isAr ? 'منع وضع السكون (WakeLock)' : 'Keep Awake / WakeLock'}
              </span>
              <input
                type="checkbox"
                checked={wakeLock}
                onChange={e => setWakeLock(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 cursor-pointer">
              <span className="text-xs text-slate-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                {isAr ? 'تجزئة حزم SNI (Anti-DPI Fragmentation)' : 'SNI Packet Fragmentation (Anti-DPI)'}
              </span>
              <input
                type="checkbox"
                checked={antiDPIFrag}
                onChange={e => setAntiDPIFrag(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
              />
            </label>
          </div>

          {/* Hotspot VPN Tethering Info */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'مشاركة النفق عبر نقطة الاتصال (Hotspot Tethering)' : 'Hotspot VPN Sharing'}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isAr
                ? 'لمشاركة نت النفق مع الأجهزة الأخرى: شغّل نقطة الاتصال وضع في إعدادات بروكسي الواي فاي بالجهاز الثاني: IP: 192.168.43.1 والمنفذ: 8080'
                : 'To share bypassed connection: Enable hotspot and configure other device proxy to IP: 192.168.43.1, Port: 8080'}
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            type="button"
            className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            {isAr ? 'حفظ وتطبيق الإعدادات' : 'Save & Apply Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};
