import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  Sparkles, 
  Video, 
  Globe,
  Radio,
  Zap,
  Key
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { authService } from '../services/authService';
import { getDeviceHWID } from '../services/configParser';
import { sfx } from '../services/soundEffects';

interface AuthGateScreenProps {
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  onSuccess: () => void;
  customMediaUrl: string;
  isCustomVideo: boolean;
  onOpenMediaCustomizer: () => void;
}

export const AuthGateScreen: React.FC<AuthGateScreenProps> = ({
  lang,
  onToggleLang,
  onSuccess,
  customMediaUrl,
  isCustomVideo,
  onOpenMediaCustomizer
}) => {
  const isAr = lang === 'ar';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const deviceHWID = getDeviceHWID();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(isAr ? 'يرجى إدخال اسم المستخدم أو البريد وكلمة المرور' : 'Please enter credentials');
      return;
    }

    setIsLoading(true);
    setError(null);

    let res;
    if (isRegister) {
      res = await authService.register(name || 'Tunnel Member', email, password, deviceHWID);
    } else {
      res = await authService.login(email, password);
    }

    setIsLoading(false);

    if (res.success) {
      sfx.playSuccess();
      try {
        confetti({ particleCount: 65, spread: 80, origin: { y: 0.6 } });
      } catch {
        // no-op
      }
      onSuccess();
    } else {
      sfx.playError();
      setError(res.error || (isAr ? 'فشل تسجيل الدخول' : 'Authentication failed'));
    }
  };

  const handleQuickFill = () => {
    sfx.playSwitch();
    setEmail('vip@elarbtunnel.com');
    setPassword('vip123');
    setName('VIP Member');
    setError(null);
  };

  return (
    <div 
      dir={isAr ? 'rtl' : 'ltr'} 
      className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 bg-[#020617] relative overflow-hidden"
    >
      {/* Background Cyber Glow & Animated Beams */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Luxury Chassis */}
      <div className="relative z-10 w-full max-w-md flex flex-col gap-4 animate-float">
        
        {/* Top Header outside the video frame */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-600/40 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <Shield className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <span className="text-xs font-black tracking-wider text-white uppercase font-mono">
                ELARB TUNNEL <span className="text-cyan-400">PLUS</span>
              </span>
              <span className="block text-[9px] font-mono text-cyan-300">
                {isAr ? 'تطبيق العرب المشفر' : 'ELARB SECURE GATEWAY'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sfx.playClick();
                onOpenMediaCustomizer();
              }}
              type="button"
              className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-cyan-300 border border-cyan-500/30 transition-colors"
              title={isAr ? 'تغيير رابط الفيديو أو الصورة' : 'Change Video/Image URL'}
            >
              <Video className="w-3.5 h-3.5 text-rose-400" />
            </button>
            <button
              onClick={() => {
                sfx.playSwitch();
                onToggleLang();
              }}
              type="button"
              className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/90 border border-white/20 text-[10px] font-mono font-bold text-white transition-colors"
            >
              {isAr ? 'EN' : 'عربي'}
            </button>
          </div>
        </div>

        {/* SECTION 1: Top Persistent Luxury Mirror Video Screen (100% PURE & CLEAN - NO TEXT OVERLAY) */}
        <div className="relative w-full">
          <div className="relative w-full h-48 sm:h-56 rounded-3xl overflow-hidden glass-mirror border border-cyan-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.25)] glass-sheen bg-black">
            {isCustomVideo ? (
              <video
                src={customMediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={customMediaUrl}
                alt="Tunnel Visualizer"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Luxury Mirror Reflection Base ("المراية") */}
          <div className="w-full h-3.5 -mt-1 rounded-b-3xl bg-gradient-to-b from-cyan-400/30 via-purple-500/15 to-transparent blur-[2px] opacity-85 pointer-events-none" />
        </div>

        {/* SECTION 2: Luxury Glassmorphic Login Box ("تسجيل دخول اجباري... نصين فخم") */}
        <div className="w-full glass-card rounded-3xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] border border-cyan-500/30 flex flex-col gap-3.5">
          
          <div className="text-center">
            <h2 className="text-base font-black text-white font-mono uppercase tracking-wide">
              {isRegister 
                ? (isAr ? 'إنشاء حساب جديد مشفر' : 'REGISTER ENCRYPTED ACCOUNT') 
                : (isAr ? 'تسجيل الدخول الإجباري' : 'MANDATORY AUTHENTICATION')}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr ? 'أدخل بيانات حسابك أو اختر الدخول السريع' : 'Enter your credentials to enter the tunnel dashboard'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`py-2 rounded-lg transition-all ${
                !isRegister
                  ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-700/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`py-2 rounded-lg transition-all ${
                isRegister
                  ? 'bg-gradient-to-r from-cyan-950 to-purple-950 text-cyan-300 border border-cyan-700/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'حساب جديد' : 'Register'}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-3">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'الاسم بالكامل' : 'Full Name'}
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 rtl:right-3 rtl:left-auto" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Ahmed VIP"
                    className="w-full py-2.5 px-9 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAr ? 'اسم المستخدم أو البريد الإلكتروني' : 'Username or Email'}
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 rtl:right-3 rtl:left-auto" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vip@elarbtunnel.com"
                  className="w-full py-2.5 px-9 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 rtl:right-3 rtl:left-auto" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-2.5 px-9 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="animate-pulse">{isAr ? 'جارٍ التحقق...' : 'AUTHENTICATING...'}</span>
              ) : (
                <>
                  <span>{isRegister ? (isAr ? 'إنشاء الحساب والدخول' : 'REGISTER & ENTER') : (isAr ? 'دخول التطبيق' : 'ENTER TUNNEL APP')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* Quick Auto-Fill Credentials */}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2 text-center">
            <div className="text-[10px] font-mono text-slate-400">
              {isAr ? 'تعبئة سريعة للبيانات بضغطة زر:' : 'Quick Fill Demo Credentials:'}
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full py-2 px-3 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-200 text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'الدخول السريع (عضوية VIP Pro)' : 'Quick Fill (VIP Pro Member)'}</span>
            </button>
          </div>

          {/* Author Rights & Social Channels (الحقوق) */}
          <div className="pt-3 border-t border-white/10 flex flex-col items-center gap-1.5 text-center text-[11px] font-mono">
            <span className="text-slate-400 font-semibold">
              {isAr ? 'الحقوق والتواصل والدعم الفني:' : 'Credits & Support:'}
            </span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <a
                href="https://t.me/elarp_vip"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 text-sky-300 font-bold transition-all flex items-center gap-1 shadow-sm"
              >
                <span>Telegram:</span>
                <span className="text-white underline">@elarp_vip</span>
              </a>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-bold transition-all flex items-center gap-1 shadow-sm"
              >
                <span>WhatsApp:</span>
                <span className="text-white underline">@uncle_elbhiry</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
