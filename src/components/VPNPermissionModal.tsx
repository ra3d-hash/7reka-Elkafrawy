import React from 'react';
import { ShieldCheck, Info, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sfx } from '../services/soundEffects';

interface VPNPermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
  lang: 'ar' | 'en';
  appName: string;
}

export const VPNPermissionModal: React.FC<VPNPermissionModalProps> = ({
  isOpen,
  onAllow,
  onDeny,
  lang,
  appName
}) => {
  const isAr = lang === 'ar';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {/* System Icon */}
              <div className="flex justify-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                  <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'طلب اتصال' : 'Connection Request'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isAr 
                    ? `يرغب تطبيق ${appName} في إعداد اتصال VPN يتيح له مراقبة ترافيك الشبكة.`
                    : `${appName} wants to set up a VPN connection that allows it to monitor network traffic.`}
                </p>
              </div>

              {/* Security Warning */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl flex gap-3">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-normal">
                  {isAr 
                    ? 'يجب ألا توافق على هذا الطلب إلا إذا كنت تثق في المصدر. يظهر رمز (المفتاح) في الجزء العلوي من شاشتك عند نشاط الـ VPN.'
                    : 'Only allow this if you trust the source. A key icon appears at the top of your screen when VPN is active.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    sfx.playSuccess();
                    onAllow();
                  }}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all active:scale-[0.98]"
                >
                  {isAr ? 'موافق' : 'OK'}
                </button>
                <button
                  onClick={() => {
                    sfx.playClick();
                    onDeny();
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all active:scale-[0.98]"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
