import React from 'react';
import {
  Mic,
  Monitor,
  TrendingUp,
  Camera,
  Code2,
  Database,
  Smartphone,
  Sparkles,
  ArrowRight,
  Shield,
  Activity,
  Zap,
} from 'lucide-react';
import { AppState, Language, NavigationTab } from '../types';
import { JarvisOrb } from './JarvisOrb';

interface HomeDashboardProps {
  appState: AppState;
  isListening: boolean;
  isSpeaking: boolean;
  onOrbClick: () => void;
  onNavigate: (tab: NavigationTab) => void;
  language: Language;
  onQuickPrompt: (promptText: string, targetTab: NavigationTab) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  appState,
  isListening,
  isSpeaking,
  onOrbClick,
  onNavigate,
  language,
  onQuickPrompt,
}) => {
  const quickChips = [
    {
      textBn: '📈 ট্রেডিং চার্টের সাপোর্ট ও রেজিস্ট্যান্স কীভাবে নির্ণয় করব?',
      textEn: '📈 How to find support & resistance on a trading chart?',
      tab: 'trading_vision' as NavigationTab,
    },
    {
      textBn: '🖥️ বর্তমান স্ক্রিনের ডেটা ও টেক্সট বিশ্লেষণ করো',
      textEn: '🖥️ Analyze current screen data & text',
      tab: 'screen_vision' as NavigationTab,
    },
    {
      textBn: '⚡ Honor X6b ফোনের র‍্যাম ও ব্যাটারি অপ্টিমাইজেশন টিপস',
      textEn: '⚡ Honor X6b RAM and battery optimization tips',
      tab: 'phone_assistant' as NavigationTab,
    },
    {
      textBn: '💻 একটি পরিচ্ছন্ন পাইথন বা অ্যান্ড্রয়েড ফাংশন লিখো',
      textEn: '💻 Write a clean Android Kotlin or Python function',
      tab: 'coding' as NavigationTab,
    },
  ];

  const features = [
    {
      id: 'voice' as NavigationTab,
      titleBn: 'ভয়েস সহকারী (Voice)',
      titleEn: 'Voice Assistant',
      descBn: 'কথা বলুন এবং বাংলায় তাত্ক্ষণিক উত্তর শুনুন।',
      descEn: 'Natural speech-to-text with bilingual TTS audio.',
      icon: Mic,
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
    },
    {
      id: 'trading_vision' as NavigationTab,
      titleBn: 'ট্রেডিং মার্কেট ভিশন',
      titleEn: 'Trading Market Vision',
      descBn: '১০-দফা চার্ট বিশ্লেষণ, ক্যান্ডেলস্টিক, R:R ও দৃশ্যকল্প।',
      descEn: '10-point chart breakdown: structure, S/R, and scenarios.',
      icon: TrendingUp,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    },
    {
      id: 'screen_vision' as NavigationTab,
      titleBn: 'লাইভ স্ক্রিন ভিশন',
      titleEn: 'Live Screen Vision',
      descBn: 'ব্রাউজার ও অ্যাপস স্ক্রিন ক্যাপচার করে তাৎক্ষণিক ব্যাখ্যা।',
      descEn: 'Capture & explain active apps and browser windows.',
      icon: Monitor,
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400',
    },
    {
      id: 'camera_scanner' as NavigationTab,
      titleBn: 'ক্যামেরা স্ক্যানার',
      titleEn: 'Camera Scanner',
      descBn: 'বাস্তব বস্তু, নথি ও টেক্সট ক্যামেরা দিয়ে স্ক্যান করুন।',
      descEn: 'Capture real-world objects, documents, and charts.',
      icon: Camera,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    },
    {
      id: 'coding' as NavigationTab,
      titleBn: 'কোডিং সহকারী',
      titleEn: 'Coding Assistant',
      descBn: 'কোড জেনারেশন, ত্রুটি সমাধান ও টিউটোরিয়াল।',
      descEn: 'Generate, explain, and debug code snippets.',
      icon: Code2,
      color: 'from-sky-500/20 to-cyan-500/20 border-sky-500/30 text-sky-400',
    },
    {
      id: 'memory_vault' as NavigationTab,
      titleBn: 'মেমোরি ভল্ট (Memory)',
      titleEn: 'Memory Vault',
      descBn: 'আপনার গুরুত্বপূর্ণ তথ্য ও পছন্দ সুরক্ষিতভাবে সংরক্ষণ।',
      descEn: 'Privately store approved user preferences & notes.',
      icon: Database,
      color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-130px)] px-4 py-6 max-w-5xl mx-auto space-y-8">
      {/* Hero Arc-Reactor HUD Section */}
      <div className="w-full flex flex-col items-center justify-center pt-2 relative">
        {/* Futuristic HUD crosshair corners */}
        <div className="absolute top-0 left-4 text-cyan-500/30 text-xs font-mono font-hud hidden sm:block">
          [SYS_ONLINE: 99.8%]
        </div>
        <div className="absolute top-0 right-4 text-cyan-500/30 text-xs font-mono font-hud hidden sm:block">
          [ARCH: JARVIS_CORE_V2]
        </div>

        {/* Central Orb */}
        <div className="my-2">
          <JarvisOrb
            state={appState}
            isListening={isListening}
            isSpeaking={isSpeaking}
            onClick={onOrbClick}
            size="lg"
          />
        </div>

        {/* Action button */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOrbClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-hud font-bold text-sm tracking-wider uppercase transition-all shadow-lg active:scale-95 ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-cyan-500/30'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>
              {isListening
                ? language === 'bn'
                  ? 'শোনা বন্ধ করুন'
                  : 'Stop Listening'
                : language === 'bn'
                ? 'কথা শুরু করুন'
                : 'Initiate Voice Command'}
            </span>
          </button>

          <button
            onClick={() => onNavigate('trading_vision')}
            className="flex items-center gap-2 px-5 py-3 rounded-full font-hud font-semibold text-xs tracking-wider uppercase border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)] active:scale-95"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>{language === 'bn' ? 'ট্রেডিং চার্ট এনালাইসিস' : 'Trading Vision'}</span>
          </button>
        </div>

        {/* Diagnostic Telemetry Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-hud">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900/60 border border-slate-800">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI: Gemini 3.8 Flash</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900/60 border border-slate-800">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target: Honor X6b & Web</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900/60 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Privacy: On-Device & Server Proxy</span>
          </div>
        </div>
      </div>

      {/* Suggested Voice Prompt Chips */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-wider font-hud text-cyan-400/80">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'bn' ? 'দ্রুত শুরু করুন (Quick Prompts)' : 'Quick Voice Prompts'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onQuickPrompt(language === 'bn' ? chip.textBn : chip.textEn, chip.tab)}
              className="text-left p-3 rounded-xl cyber-panel hover:border-cyan-400/60 transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="text-xs sm:text-sm text-slate-200 group-hover:text-cyan-200">
                {language === 'bn' ? chip.textBn : chip.textEn}
              </span>
              <ArrowRight className="w-4 h-4 text-cyan-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Feature Navigation Grid */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3 text-xs uppercase tracking-wider font-hud text-cyan-400/80">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'bn' ? 'প্রধান মডিউলসমূহ' : 'Core Modules'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onNavigate(feat.id)}
                role="button"
                tabIndex={0}
                className={`p-4 rounded-xl border bg-gradient-to-br ${feat.color} backdrop-blur-md cursor-pointer hover:scale-[1.02] transition-all duration-200 shadow-md group`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 group-hover:border-cyan-400/40 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-hud text-[10px] uppercase tracking-wider text-slate-400 group-hover:text-cyan-300">
                    OPEN &rarr;
                  </span>
                </div>
                <h3 className="font-hud font-bold text-sm sm:text-base text-white mt-3 group-hover:text-cyan-300 transition-colors">
                  {language === 'bn' ? feat.titleBn : feat.titleEn}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {language === 'bn' ? feat.descBn : feat.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
