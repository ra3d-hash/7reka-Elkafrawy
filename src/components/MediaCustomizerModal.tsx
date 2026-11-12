import React, { useState } from 'react';
import { X, Video, Image, Check, Sparkles, RefreshCw, Link as LinkIcon } from 'lucide-react';

interface MediaCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  currentMediaUrl: string;
  isCustomVideo: boolean;
  onSaveMedia: (url: string, isVideo: boolean) => void;
}

export const MediaCustomizerModal: React.FC<MediaCustomizerModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentMediaUrl,
  isCustomVideo,
  onSaveMedia
}) => {
  const [url, setUrl] = useState(currentMediaUrl);
  const [isVideo, setIsVideo] = useState(isCustomVideo);

  if (!isOpen) return null;
  const isAr = lang === 'ar';

  const presets = [
    {
      name: isAr ? 'فيديو تطبيق العرب الرسمي (Elarb Official Loop)' : 'Elarb Official Loop',
      url: 'https://www.image2url.com/r2/default/videos/1794337076226-1a13d9ab-55b6-453c-9cc1-cc68b3716c81.mp4',
      isVideo: true
    },
    {
      name: isAr ? 'نفق النيون السيبراني (Cyber Matrix)' : 'Cyber Matrix Loop',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-technology-loop-animation-41553-large.mp4',
      isVideo: true
    },
    {
      name: isAr ? 'حلقات الطاقة الزمردية (Energy Pulse)' : 'Energy Matrix Loop',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-glowing-lines-in-motion-31998-large.mp4',
      isVideo: true
    }
  ];

  const handleApply = () => {
    onSaveMedia(url.trim(), isVideo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-2xl">
      <div className="relative w-full max-w-md bg-[#050b18]/95 border border-cyan-500/35 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(6,182,212,0.25)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/30 border border-cyan-500/40">
              <Video className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAr ? 'تخصيص شاشة الفيديو والصورة' : 'Customize Media Screen'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'ضع رابط الفيديو أو الصورة المفضلة في الشاشة' : 'Set custom video or image link'}
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

        {/* Form */}
        <div className="my-4 space-y-3.5">
          {/* Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {isAr ? 'اختر من الخلفيات الحركية الجاهزة:' : 'Quick Presets:'}
            </label>
            <div className="space-y-1.5">
              {presets.map(p => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => {
                    setUrl(p.url);
                    setIsVideo(p.isVideo);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left rtl:text-right text-xs transition-all flex items-center justify-between ${
                    url === p.url
                      ? 'bg-cyan-950/70 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span className="font-medium">{p.name}</span>
                  {url === p.url && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Custom URL Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isAr ? 'أو ضع رابط الفيديو أو الصورة المباشر هنا:' : 'Or paste direct Video / Image URL:'}
            </label>
            <div className="relative flex items-center">
              <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/video.mp4 or image.jpg"
                className="w-full py-2.5 px-9 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Media Type Toggle */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-300 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="mediaType"
                checked={isVideo}
                onChange={() => setIsVideo(true)}
                className="w-3.5 h-3.5 text-cyan-500 bg-slate-900 border-slate-700"
              />
              <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" /> فيديو (Video Loop)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="mediaType"
                checked={!isVideo}
                onChange={() => setIsVideo(false)}
                className="w-3.5 h-3.5 text-cyan-500 bg-slate-900 border-slate-700"
              />
              <span className="flex items-center gap-1"><Image className="w-3.5 h-3.5" /> صورة (Static Image)</span>
            </label>
          </div>

          {/* Apply button */}
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{isAr ? 'تطبيق وحفظ الشاشة' : 'Save & Apply'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
