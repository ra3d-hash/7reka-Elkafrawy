import React, { useState } from 'react';
import { X, User as UserIcon, Shield, Smartphone, HardDrive, Key, LogOut, Copy, Check, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types/auth';

import { sfx } from '../services/soundEffects';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  user: User;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  lang,
  user,
  onLogout
}) => {
  const [copiedHwid, setCopiedHwid] = useState(false);

  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const handleCopyHWID = () => {
    navigator.clipboard.writeText(user.hwid);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 2000);
  };

  const formatGb = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl">
      <div className="relative w-full max-w-md bg-[#050b18]/90 border border-cyan-500/35 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(6,182,212,0.25)] overflow-hidden">
        
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/30 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <UserIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{user.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  VIP PRO
                </span>
              </div>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Details */}
        <div className="my-5 space-y-3">
          {/* Plan & Status */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-400 mb-0.5">{isAr ? 'الباقة النشطة' : 'Current Plan'}</div>
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {user.plan}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] text-slate-400 mb-0.5">{isAr ? 'حالة الحساب' : 'Account Status'}</div>
              <div className="font-bold text-emerald-400">
                {user.status === 'active' ? (isAr ? 'مفعل ومحمي 100%' : 'Active & Secured') : 'Suspended'}
              </div>
            </div>
          </div>

          {/* Bound HWID */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-900/40">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                {isAr ? 'بصمة الجهاز المربوطة (HWID):' : 'Bound Device HWID:'}
              </span>
              <button
                type="button"
                onClick={handleCopyHWID}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copiedHwid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHwid ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ' : 'Copy')}</span>
              </button>
            </div>
            <div className="font-mono text-xs text-cyan-300 truncate select-all">
              {user.hwid}
            </div>
          </div>

          {/* Traffic stats */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-white">{isAr ? 'استهلاك البيانات' : 'Personal Traffic'}</div>
                <div className="text-[10px] text-slate-400">{isAr ? 'نفق مشفر بدون حدود' : 'Unlimited high-speed tunneling'}</div>
              </div>
            </div>
            <span className="text-sm font-mono font-bold text-purple-300">{formatGb(user.bandwidthUsedBytes)}</span>
          </div>
        </div>

        {/* Author Rights & Social Channels (الحقوق) */}
        <div className="mb-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center text-xs">
          <div className="text-[10px] text-slate-400 font-semibold mb-2">
            {isAr ? 'الحقوق والدعم والتواصل المباشر:' : 'Official Support & Developer Channels:'}
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <a
              href="https://t.me/elarp_vip"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 text-sky-300 font-mono text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
            >
              <span>Telegram:</span>
              <span className="text-white underline">@elarp_vip</span>
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-mono text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
            >
              <span>WhatsApp:</span>
              <span className="text-white underline">@uncle_elbhiry</span>
            </a>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={() => {
            sfx.playDisconnect();
            onLogout();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-800/60 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{isAr ? 'تسجيل الخروج من الحساب' : 'Sign Out'}</span>
        </button>

      </div>
    </div>
  );
};
