import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, Sparkles, Key, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { authService } from '../services/authService';
import { getDeviceHWID } from '../services/configParser';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSuccess
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const deviceHWID = getDeviceHWID();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await authService.login(email, password);
    setIsLoading(false);

    if (res.success) {
      try {
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
      } catch {
        // no-op
      }
      onSuccess();
      onClose();
    } else {
      setError(res.error || (isAr ? 'فشل تسجيل الدخول' : 'Login failed'));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await authService.register(name, email, password, deviceHWID);
    setIsLoading(false);

    if (res.success) {
      try {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      } catch {
        // no-op
      }
      onSuccess();
      onClose();
    } else {
      setError(res.error || (isAr ? 'فشل إنشاء الحساب' : 'Registration failed'));
    }
  };

  const fillQuickDemo = () => {
    setEmail('vip@elarbtunnel.com');
    setPassword('vip123');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-md bg-[#050b18]/90 border border-cyan-500/35 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(6,182,212,0.25)] overflow-hidden">
        
        {/* Cyber Neon Accents */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide text-white font-mono uppercase">
                {mode === 'LOGIN' 
                  ? (isAr ? 'تسجيل الدخول للمنظومة' : 'SECURITY AUTH // LOGIN')
                  : (isAr ? 'إنشاء حساب جديد' : 'SECURITY AUTH // REGISTER')
                }
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'إدارة التراخيص وربط بصمة الجهاز HWID' : 'Encrypted user session & HWID binding'}
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

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 my-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'LOGIN'
                ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-700/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'REGISTER'
                ? 'bg-gradient-to-r from-cyan-950 to-purple-950 text-cyan-300 border border-cyan-700/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAr ? 'حساب جديد' : 'Register'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={mode === 'LOGIN' ? handleLogin : handleRegister} className="space-y-3.5">
          {mode === 'REGISTER' && (
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
                  placeholder={isAr ? 'مثال: أحمد العرب' : 'e.g. John Doe'}
                  className="w-full py-2.5 px-9 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isAr ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 rtl:right-3 rtl:left-auto" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vip@elarbtunnel.com"
                className="w-full py-2.5 px-9 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder:text-slate-600 focus:outline-none"
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
                className="w-full py-2.5 px-9 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          </div>

          {mode === 'REGISTER' && (
            <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-900/40 text-[11px] font-mono text-slate-400">
              <div className="text-cyan-400 font-bold mb-0.5">
                {isAr ? 'بصمة الجهاز المربوطة (HWID Binding):' : 'Bound Hardware ID (HWID):'}
              </div>
              <div className="text-slate-300 truncate">{deviceHWID}</div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="animate-pulse">{isAr ? 'جارٍ التحقق...' : 'AUTHENTICATING...'}</span>
            ) : (
              <>
                <span>{mode === 'LOGIN' ? (isAr ? 'دخول للنظام' : 'AUTHENTICATE') : (isAr ? 'إنشاء حساب جديد' : 'CREATE ACCOUNT')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Test Accounts Filler */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
          <div className="text-[11px] font-semibold text-slate-400 mb-2">
            {isAr ? 'حسابات تجريبية سريعة بضغطة زر:' : 'Quick Demo Credentials:'}
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={fillQuickDemo}
              className="px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 transition-colors"
            >
              VIP User (vip@elarbtunnel.com)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
