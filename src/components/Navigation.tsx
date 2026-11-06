import React from 'react';
import {
  Mic,
  Monitor,
  Camera,
  TrendingUp,
  FileSearch,
  Code2,
  Database,
  Smartphone,
  History,
  Home,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  language: 'bn' | 'en';
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  language,
}) => {
  const tabs = [
    {
      id: 'home' as NavigationTab,
      labelBn: 'হোম',
      labelEn: 'Home',
      icon: Home,
    },
    {
      id: 'voice' as NavigationTab,
      labelBn: 'ভয়েস',
      labelEn: 'Voice',
      icon: Mic,
      glow: true,
    },
    {
      id: 'screen_vision' as NavigationTab,
      labelBn: 'লাইভ স্ক্রিন',
      labelEn: 'Screen Vision',
      icon: Monitor,
    },
    {
      id: 'trading_vision' as NavigationTab,
      labelBn: 'ট্রেডিং চার্ট',
      labelEn: 'Trading Vision',
      icon: TrendingUp,
    },
    {
      id: 'manual_screen' as NavigationTab,
      labelBn: 'স্ক্রিনশট',
      labelEn: 'Screenshot',
      icon: FileSearch,
    },
    {
      id: 'camera_scanner' as NavigationTab,
      labelBn: 'ক্যামেরা',
      labelEn: 'Camera',
      icon: Camera,
    },
    {
      id: 'coding' as NavigationTab,
      labelBn: 'কোডিং',
      labelEn: 'Coding',
      icon: Code2,
    },
    {
      id: 'memory_vault' as NavigationTab,
      labelBn: 'মেমোরি',
      labelEn: 'Memory',
      icon: Database,
    },
    {
      id: 'phone_assistant' as NavigationTab,
      labelBn: 'ডিভাইস টিপস',
      labelEn: 'Phone Help',
      icon: Smartphone,
    },
    {
      id: 'history' as NavigationTab,
      labelBn: 'হিস্ট্রি',
      labelEn: 'History',
      icon: History,
    },
  ];

  return (
    <nav className="w-full bg-[#030812]/90 border-t sm:border-t-0 sm:border-b border-cyan-500/20 px-2 py-1.5 sm:px-4 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-start sm:justify-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const label = language === 'bn' ? tab.labelBn : tab.labelEn;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 select-none ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'text-slate-400 hover:text-cyan-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform ${
                  isActive ? 'scale-110 text-cyan-400' : 'text-slate-400'
                }`}
              />
              <span className="text-[11px] sm:text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
