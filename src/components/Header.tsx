import React from 'react';
import { Volume2, VolumeX, Globe, Settings, Cpu, ShieldCheck } from 'lucide-react';
import { Language, NavigationTab } from '../types';

interface HeaderProps {
  currentTab: NavigationTab;
  language: Language;
  onLanguageToggle: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onOpenSettings: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageToggle,
  soundEnabled,
  onSoundToggle,
  onOpenSettings,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#050b14]/85 backdrop-blur-md px-3 py-2.5 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={onNavigateHome}
          role="button"
          tabIndex={0}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
        >
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)] group-hover:scale-105 transition-transform flex-shrink-0">
            <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse-slow" />
            <div className="absolute -inset-0.5 rounded-lg border border-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-hud font-bold tracking-wider text-sm sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                FAHIM AI
              </span>
              <span className="px-1 py-0.5 text-[9px] sm:text-[10px] font-hud rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 tracking-wider">
                v2.4
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              <span className="hidden xxs:inline">Honor X6b</span>
              <span className="text-cyan-500/60">•</span>
              <span className="text-cyan-400/80">Gemini 3.8</span>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Privacy badge */}
          <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-cyan-500/20 text-xs text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>নিরাপদ ও ব্যক্তিগত</span>
          </div>

          {/* Sound toggle button */}
          <button
            onClick={onSoundToggle}
            title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
            aria-label="Toggle JARVIS Audio Effects"
            className={`p-2 rounded-lg border transition-all ${
              soundEnabled
                ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                : 'border-slate-800 bg-slate-900/60 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={onLanguageToggle}
            title="ভাষা পরিবর্তন করুন"
            aria-label="Toggle Language"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 text-xs font-semibold tracking-wide transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)]"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="সেটিংস"
            aria-label="Open Settings"
            className="p-2 rounded-lg border border-slate-700/60 bg-slate-900/60 hover:border-cyan-500/40 hover:text-cyan-300 text-slate-400 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
