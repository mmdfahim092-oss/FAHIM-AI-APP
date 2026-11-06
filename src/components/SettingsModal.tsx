import React from 'react';
import {
  X,
  Settings,
  Volume2,
  Globe,
  Shield,
  Smartphone,
  Cpu,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { Language } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  soundEnabled,
  onToggleSound,
  speechRate,
  onSpeechRateChange,
  onClearAllData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-cyan-500/30 p-5 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="font-hud font-bold text-base text-cyan-300 tracking-wider uppercase">
              {language === 'bn' ? 'FAHIM AI সেটিংস' : 'FAHIM AI Configuration'}
            </h2>
          </div>
          <button
            onClick={() => {
              onClose();
              soundEffects.playBeep();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-hud font-semibold text-slate-300 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>{language === 'bn' ? 'ডিফল্ট ভাষা (Language)' : 'Default Language'}</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onLanguageChange('bn')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                language === 'bn'
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              বাংলা (Bengali - Default)
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              English (United States)
            </button>
          </div>
        </div>

        {/* Audio & Sound Effects */}
        <div className="space-y-3">
          <label className="text-xs font-hud font-semibold text-slate-300 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>{language === 'bn' ? 'সাউন্ড ও ভয়েস সেটিংস' : 'Audio & Voice Configuration'}</span>
          </label>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-200">
                {language === 'bn' ? 'জারভিস সাউন্ড ইফেক্টস' : 'JARVIS Audio Effects'}
              </div>
              <div className="text-[11px] text-slate-400">
                {language === 'bn' ? 'ওয়েব অডিও সাই-ফাই বিপ ও স্ক্যান সাউন্ড' : 'Synthesized sci-fi UI beeps & alerts'}
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                soundEnabled
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {soundEnabled ? 'সক্রিয় (ON)' : 'বন্ধ (OFF)'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>{language === 'bn' ? 'কণ্ঠস্বরের গতি (Speech Speed):' : 'Speech Speed:'}</span>
              <span className="font-mono text-cyan-400">{speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={speechRate}
              onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>

        {/* Device Information */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-hud text-slate-300">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>{language === 'bn' ? 'টার্গেট ডিভাইস ও এআই আর্কিটেকচার' : 'Device Target & AI Architecture'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div>ডিভাইস: <span className="text-white font-mono">Honor X6b & Web</span></div>
            <div>এআই ইঞ্জিন: <span className="text-cyan-400 font-mono">Gemini 3.8 Flash</span></div>
            <div>কোর UI: <span className="text-emerald-400 font-mono">JARVIS HUD React 19</span></div>
            <div>সিকিউরিটি: <span className="text-purple-400 font-mono">Server-Side Proxy</span></div>
          </div>
        </div>

        {/* Clear Data */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm(language === 'bn' ? 'সমস্ত লোকাল ডেটা ও ক্যাশ মুছে ফেলতে চান?' : 'Clear all local cache and memory?')) {
                onClearAllData();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-950 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সমস্ত ক্যাশ ও ডেটা মুছুন' : 'Reset All App Data'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md transition-all"
          >
            {language === 'bn' ? 'সম্পন্ন' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
