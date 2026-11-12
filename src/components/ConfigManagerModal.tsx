import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  Lock, 
  Sparkles, 
  FileCode, 
  Check, 
  AlertCircle, 
  Key, 
  Calendar, 
  ShieldAlert, 
  EyeOff, 
  Copy, 
  Smartphone,
  Save
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TunnelConfig, ConfigLockOptions, NetworkPreset, ProtocolType } from '../types/tunnel';
import { parseConfigFile, exportEncryptedHat, getDeviceHWID } from '../services/configParser';
import { DEFAULT_PRESETS } from '../constants/presets';

interface ConfigManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: TunnelConfig;
  onApplyConfig: (config: TunnelConfig) => void;
  lang: 'ar' | 'en';
  defaultTab?: 'IMPORT' | 'EXPORT' | 'PRESETS';
}

export const ConfigManagerModal: React.FC<ConfigManagerModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onApplyConfig,
  lang,
  defaultTab = 'PRESETS'
}) => {
  const [activeTab, setActiveTab] = useState<'PRESETS' | 'IMPORT' | 'EXPORT'>(defaultTab);

  // Import states
  const [importText, setImportText] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Export / Lock states
  const [lockName, setLockName] = useState(currentConfig.name + ' [PRO]');
  const [lockNote, setLockNote] = useState(currentConfig.configNote || 'تم إنشاء هذا الكونفج بواسطة Elarb Tunnel (العرب) · حقوق @elarb_vip');
  const [lockPassword, setLockPassword] = useState('');
  const [lockHWID, setLockHWID] = useState('');
  const [enableHWIDLock, setEnableHWIDLock] = useState(false);
  const [expiryDays, setExpiryDays] = useState('30');
  const [preventRoot, setPreventRoot] = useState(true);
  const [hidePayload, setHidePayload] = useState(true);

  // Edit fields for new config
  const [editServer, setEditServer] = useState(currentConfig.serverHost);
  const [editPort, setEditPort] = useState(String(currentConfig.serverPort));
  const [editSNI, setEditSNI] = useState(currentConfig.bugHostSNI || '');
  const [editProtocol, setEditProtocol] = useState<ProtocolType>(currentConfig.protocol);
  const [editPayload, setEditPayload] = useState(currentConfig.payload || '');

  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const myHWID = getDeviceHWID();

  // Handle file drop / upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
      executeParse(content);
    };
    reader.readAsText(file);
  };

  const executeParse = (content: string, pass?: string) => {
    setImportError(null);
    setImportSuccessMsg(null);

    const result = parseConfigFile(content, pass || importPassword);
    if (result.success && result.config) {
      onApplyConfig(result.config);
      setImportSuccessMsg(
        isAr ? `تم استيراد الكونفج بنجاح: ${result.config.name}` : `Imported successfully: ${result.config.name}`
      );
      setPasswordRequired(false);
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      } catch {
        // no-op
      }
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      if (result.isPasswordRequired) {
        setPasswordRequired(true);
        setImportError(result.error || 'Password required');
      } else {
        setImportError(result.error || 'Failed to import config');
      }
    }
  };

  const handleExportHat = () => {
    let calculatedExpiry: string | undefined = undefined;
    if (expiryDays !== 'never') {
      const d = new Date();
      d.setDate(d.getDate() + parseInt(expiryDays, 10));
      calculatedExpiry = d.toISOString();
    }

    const options: ConfigLockOptions = {
      name: lockName,
      note: lockNote,
      password: lockPassword.trim() || undefined,
      lockHWID: enableHWIDLock ? (lockHWID.trim() || myHWID) : undefined,
      expiryDate: calculatedExpiry,
      preventRoot,
      hidePayload
    };

    const targetConfig: TunnelConfig = {
      ...currentConfig,
      name: lockName,
      serverHost: editServer,
      serverPort: parseInt(editPort, 10) || 443,
      bugHostSNI: editSNI,
      protocol: editProtocol,
      payload: editPayload
    };

    const { filename, content } = exportEncryptedHat(targetConfig, options);

    // Trigger file download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    try {
      confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    } catch {
      // no-op
    }

    alert(isAr ? `تم تصدير وتشفير الكونفج بنجاح!\nالملف: ${filename}` : `Exported encrypted .hat file: ${filename}`);
  };

  const insertPayloadTag = (tag: string) => {
    setEditPayload(prev => prev + tag);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[92vh] bg-[#070e20] border border-cyan-800/60 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileCode className="w-5 h-5 text-cyan-400" />
              {isAr ? 'مدير وتشفير كونفجات .hat' : '.HAT Encrypted Config Manager'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr ? 'استيراد، قفل بالبصمة، وتصدير كونفجات Elarb Tunnel (العرب) المشفرة' : 'Import, lock with HWID/password & export Elarb .hat'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-900/50 shrink-0 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('PRESETS')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors border-b-2 text-center ${
              activeTab === 'PRESETS'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{isAr ? 'سيرفرات جاهزة' : 'Presets'}</span>
          </button>

          <button
            onClick={() => setActiveTab('IMPORT')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors border-b-2 text-center ${
              activeTab === 'IMPORT'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4 shrink-0" />
            <span>{isAr ? 'استيراد .hat' : 'Import Config'}</span>
          </button>

          <button
            onClick={() => setActiveTab('EXPORT')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors border-b-2 text-center ${
              activeTab === 'EXPORT'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>{isAr ? 'إنشاء وقفل .hat' : 'Create & Lock'}</span>
          </button>
        </div>

        {/* Tab 1: Presets */}
        {activeTab === 'PRESETS' && (
          <div className="p-4 overflow-y-auto space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              {isAr ? 'اختر أي من السيرفرات المجهزة لتخطي حجب شبكات مصر والخليج فوراً:' : 'Select any pre-configured telecom bypass server:'}
            </div>

            {DEFAULT_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{preset.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {isAr ? preset.titleAr : preset.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                        {preset.config.protocol}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {isAr ? preset.descriptionAr : preset.description}
                    </p>
                    <div className="text-[11px] font-mono text-slate-500 mt-1">
                      SNI: <span className="text-slate-300">{preset.config.bugHostSNI}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onApplyConfig(preset.config);
                    onClose();
                  }}
                  type="button"
                  className="px-3.5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors whitespace-nowrap shrink-0"
                >
                  {isAr ? 'تفعيل' : 'Use'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Import */}
        {activeTab === 'IMPORT' && (
          <div className="p-4 overflow-y-auto space-y-4">
            {/* File Drag Drop Area */}
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-cyan-800/60 rounded-xl bg-slate-900/40 hover:bg-slate-900/70 hover:border-cyan-400 transition-all cursor-pointer">
              <Upload className="w-8 h-8 text-cyan-400 mb-2" />
              <span className="text-sm font-semibold text-slate-200">
                {isAr ? 'اختر ملف .hat أو .json من جهازك' : 'Choose or drop .hat / .json file'}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                {isAr ? 'يدعم كافة كونفجات Elarb Tunnel و HTTP Custom' : 'Supports Elarb Tunnel and HTTP Custom configs'}
              </span>
              <input
                type="file"
                accept=".hat,.json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Paste Config Text or V2Ray URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isAr ? 'أو الصق كود الكونفج المشفر / رابط V2Ray هنا:' : 'Or paste encrypted config / vmess / vless URI:'}
              </label>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="ELARB_TUNNEL_PLUS_V2::... or vmess://... or JSON"
                rows={4}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Password input if protected */}
            {passwordRequired && (
              <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <Key className="w-4 h-4" />
                  <span>{isAr ? 'الكونفج محمي بكلمة سر:' : 'Password Protected Config:'}</span>
                </div>
                <input
                  type="password"
                  value={importPassword}
                  onChange={e => setImportPassword(e.target.value)}
                  placeholder={isAr ? 'أدخل كلمة المرور لفك التشفير...' : 'Enter password to unlock...'}
                  className="w-full p-2 rounded bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            {/* Status alerts */}
            {importError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{importError}</span>
              </div>
            )}

            {importSuccessMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300">
                <Check className="w-4 h-4 shrink-0" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            <button
              onClick={() => executeParse(importText, importPassword)}
              type="button"
              disabled={!importText.trim()}
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{isAr ? 'فك التشفير وتطبيق الكونفج' : 'Parse & Apply Config'}</span>
            </button>
          </div>
        )}

        {/* Tab 3: Create & Lock .hat */}
        {activeTab === 'EXPORT' && (
          <div className="p-4 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'اسم الكونفج' : 'Config Name'}
                </label>
                <input
                  type="text"
                  value={lockName}
                  onChange={e => setLockName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'البروتوكول' : 'Protocol'}
                </label>
                <select
                  value={editProtocol}
                  onChange={e => setEditProtocol(e.target.value as ProtocolType)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300"
                >
                  <option value="SSH_SSL">SSH + SSL/TLS Stunnel</option>
                  <option value="SSH_PAYLOAD">SSH + Custom Payload</option>
                  <option value="HYSTERIA_UDP">Hysteria UDP v2</option>
                  <option value="V2RAY_VMESS">V2Ray VMess WebSocket</option>
                  <option value="V2RAY_VLESS">V2Ray VLESS XTLS</option>
                  <option value="OPENVPN">OpenVPN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'عنوان السيرفر' : 'Server Host'}
                </label>
                <input
                  type="text"
                  value={editServer}
                  onChange={e => setEditServer(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'المنفذ' : 'Port'}
                </label>
                <input
                  type="number"
                  value={editPort}
                  onChange={e => setEditPort(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            {/* Bug SNI */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAr ? 'هوست الثغرة والتجاوز (Bug SNI)' : 'Bug Host / SNI'}
              </label>
              <input
                type="text"
                value={editSNI}
                onChange={e => setEditSNI(e.target.value)}
                placeholder="e.g. cdn.vodafone.com.eg or free.orange.eg"
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono"
              />
            </div>

            {/* Custom Payload with quick tags */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'البايلود وترويسات الطلب' : 'Payload Headers'}
                </label>
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  {['[crlf]', '[host]', '[protocol]', '[ua]', '[split]'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertPayloadTag(tag)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={editPayload}
                onChange={e => setEditPayload(e.target.value)}
                rows={3}
                placeholder="CONNECT [host_port] [protocol][crlf]Host: [host][crlf]..."
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200"
              />
            </div>

            {/* Message/Note for users */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAr ? 'رسالة ترحيبية للمستخدمين' : 'Notes / Message to Users'}
              </label>
              <input
                type="text"
                value={lockNote}
                onChange={e => setLockNote(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>

            {/* Security & HWID Lock Enclosure */}
            <div className="p-3 rounded-xl bg-slate-950 border border-cyan-900/40 space-y-3">
              <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span>{isAr ? 'خيارات القفل والتشفير المتقدمة' : 'Advanced Encryption & Locks'}</span>
              </div>

              {/* HWID Lock */}
              <div>
                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    {isAr ? 'قفل الكونفج على جهاز محدد (HWID Lock)' : 'Lock to Hardware ID (HWID)'}
                  </span>
                  <input
                    type="checkbox"
                    checked={enableHWIDLock}
                    onChange={e => setEnableHWIDLock(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                  />
                </label>
                {enableHWIDLock && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={lockHWID}
                      onChange={e => setLockHWID(e.target.value)}
                      placeholder={isAr ? 'أدخل معرف الجهاز المطلوب' : 'Enter target HWID'}
                      className="flex-1 p-1.5 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300"
                    />
                    <button
                      type="button"
                      onClick={() => setLockHWID(myHWID)}
                      className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs whitespace-nowrap"
                    >
                      {isAr ? 'جهازي الحالي' : 'My HWID'}
                    </button>
                  </div>
                )}
              </div>

              {/* Password Protection */}
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  {isAr ? 'قفل بكلمة سر (اختياري)' : 'Password Lock (Optional)'}
                </label>
                <input
                  type="password"
                  value={lockPassword}
                  onChange={e => setLockPassword(e.target.value)}
                  placeholder={isAr ? 'اتركه فارغاً لكونفج عام' : 'Leave empty for public config'}
                  className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              {/* Expiry Date */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">
                    {isAr ? 'صلاحية الكونفج' : 'Expiry Period'}
                  </label>
                  <select
                    value={expiryDays}
                    onChange={e => setExpiryDays(e.target.value)}
                    className="w-full p-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200"
                  >
                    <option value="7">{isAr ? '7 أيام' : '7 Days'}</option>
                    <option value="15">{isAr ? '15 يوماً' : '15 Days'}</option>
                    <option value="30">{isAr ? '30 يوماً (شهر)' : '30 Days'}</option>
                    <option value="90">{isAr ? '90 يوماً (3 أشهر)' : '90 Days'}</option>
                    <option value="never">{isAr ? 'بدون انتهاء' : 'Never Expire'}</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preventRoot}
                      onChange={e => setPreventRoot(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-cyan-500 bg-slate-900 border-slate-700"
                    />
                    <span>{isAr ? 'حظر أجهزة الروت' : 'Block Root Devices'}</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hidePayload}
                      onChange={e => setHidePayload(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-cyan-500 bg-slate-900 border-slate-700"
                    />
                    <span>{isAr ? 'إخفاء وحماية البايلود' : 'Lock & Hide Payload'}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Export Action */}
            <button
              onClick={handleExportHat}
              type="button"
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تشفير وتنزيل ملف .hat الآن' : 'Encrypt & Download .hat File'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
