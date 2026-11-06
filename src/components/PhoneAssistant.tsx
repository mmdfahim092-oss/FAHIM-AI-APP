import React, { useState } from 'react';
import {
  Smartphone,
  BatteryCharging,
  Cpu,
  ShieldCheck,
  Sliders,
  Sparkles,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { Language } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface PhoneAssistantProps {
  language: Language;
}

export const PhoneAssistant: React.FC<PhoneAssistantProps> = ({ language }) => {
  const [activeTopic, setActiveTopic] = useState<'honor_opt' | 'accessibility' | 'permissions' | 'voice_tips'>('honor_opt');

  const honorGuides = [
    {
      titleBn: 'Honor X6b র‍্যাম টার্বো (HONOR RAM Turbo) সক্রিয়করণ',
      titleEn: 'Honor X6b RAM Turbo Optimization',
      descBn: 'Honor X6b-তে অতিরিক্ত 4GB/6GB ভার্চুয়াল র‍্যাম যুক্ত করে মাল্টিটাস্কিং এবং FAHIM AI দ্রুত চালান।',
      descEn: 'Utilize virtual RAM to maintain smooth AI performance and app multitasking on Honor X6b.',
      stepsBn: [
        'ফোনের Settings (সেটিংস) এ প্রবেশ করুন।',
        'নিচে স্ক্রল করে "System & updates" বা "About phone" অপশনে যান।',
        'RAM Turbo বা Memory Expansion অপশনটি চালু (Enable) করুন।',
        'ফোনটি একবার Restart দিন।',
      ],
      stepsEn: [
        'Open Settings on your Honor X6b.',
        'Scroll down and tap "System & updates" or "About phone".',
        'Toggle ON "RAM Turbo" / "Memory Extension".',
        'Restart your phone to apply the boost.',
      ],
    },
    {
      titleBn: 'ব্যাটারি অপ্টিমাইজেশন ও ব্যাকগ্রাউন্ড পারমিশন',
      titleEn: 'Battery Saver & Background Permissions',
      descBn: 'স্ক্রিন ভিশন বা ভয়েস চলাকালীন ফোন যাতে অ্যাপ বন্ধ না করে দেয়।',
      descEn: 'Prevent MagicOS battery manager from killing assistant background services.',
      stepsBn: [
        'Settings -> Apps -> App launch এ যান।',
        'FAHIM AI বা ব্রাউজার অ্যাপটি নির্বাচন করুন।',
        '"Manage automatically" বন্ধ করে "Auto-launch", "Secondary launch", এবং "Run in background" সক্রিয় করুন।',
      ],
      stepsEn: [
        'Go to Settings -> Apps -> App launch.',
        'Locate your browser or FAHIM AI application.',
        'Switch from "Manage automatically" to manual and enable "Run in background".',
      ],
    },
    {
      titleBn: '৯০Hz স্মুথ রিফ্রেশ রেট চালু করা',
      titleEn: 'Enable 90Hz Display Refresh Rate',
      descBn: 'Honor X6b এর 90Hz ডিসপ্লেতে জারভিস এনিমেশন মসৃণভাবে উপভোগ করুন।',
      descEn: 'Enjoy ultra-smooth JARVIS HUD animations with 90Hz display enabled.',
      stepsBn: [
        'Settings -> Display & brightness এ যান।',
        '"Screen refresh rate" নির্বাচন করুন।',
        '"High (90Hz)" অথবা "Dynamic" নির্বাচন করুন।',
      ],
      stepsEn: [
        'Go to Settings -> Display & brightness.',
        'Tap "Screen refresh rate".',
        'Choose "High (90Hz)" for smoothest HUD visuals.',
      ],
    },
  ];

  const accessibilityGuides = [
    {
      titleBn: 'অ্যান্ড্রয়েড অ্যাক্সেসিবিলিটি সার্ভিস কীভাবে সক্রিয় করবেন',
      titleEn: 'How to Enable Android Accessibility Services',
      descBn: 'স্ক্রিন রিডিং এবং অন-স্ক্রিন সহায়তা পেতে অফিসিয়াল অ্যান্ড্রয়েড অ্যাক্সেসিবিলিটি সেটিংস ব্যবহার করুন।',
      descEn: 'Use Android accessibility for voice guidance and on-screen reading.',
      stepsBn: [
        'Settings -> Accessibility features -> Accessibility এ যান।',
        'ইনস্টল করা অ্যাক্সেসিবিলিটি সার্ভিস বা স্ক্রিন রিডার দেখুন।',
        'প্রয়োজনে সার্ভিসটি চালু করুন এবং অ্যান্ড্রয়েডের সতর্কবার্তা নিশ্চিত করুন।',
        'মনে রাখবেন: কোনো অ্যাপকে অপ্রয়োজনীয় বা সন্দেহজনক অনুমতি দেবেন না।',
      ],
      stepsEn: [
        'Go to Settings -> Accessibility features -> Accessibility.',
        'Locate your installed helper or screen reader service.',
        'Enable permissions only after reading the Android security warning.',
        'Never grant accessibility permissions to untrusted sources.',
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h2 className="font-hud font-bold text-base sm:text-lg text-emerald-300 tracking-wider uppercase">
              {language === 'bn' ? 'ডিভাইস ও অ্যাক্সেসিবিলিটি গাইড' : 'Device & Accessibility Assistant'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'Honor X6b ও অ্যান্ড্রয়েড ফোনের পারফরম্যান্স, স্ক্রিন পারমিশন ও অ্যাক্সেসিবিলিটি গাইড।'
              : 'Targeted configuration, RAM/battery tuning, and accessibility guidance for Honor X6b.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-hud text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Honor X6b (MagicOS)</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => {
            setActiveTopic('honor_opt');
            soundEffects.playBeep();
          }}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTopic === 'honor_opt'
              ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          {language === 'bn' ? 'Honor X6b অপ্টিমাইজেশন' : 'Honor X6b Tuning'}
        </button>
        <button
          onClick={() => {
            setActiveTopic('accessibility');
            soundEffects.playBeep();
          }}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTopic === 'accessibility'
              ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          {language === 'bn' ? 'অ্যাক্সেসিবিলিটি ও স্ক্রিন সার্ভিস' : 'Accessibility & Privacy'}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {activeTopic === 'honor_opt' &&
          honorGuides.map((guide, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/30 transition-all space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <h3 className="font-hud font-bold text-sm text-emerald-300">
                  {language === 'bn' ? guide.titleBn : guide.titleEn}
                </h3>
              </div>
              <p className="text-xs text-slate-300">{language === 'bn' ? guide.descBn : guide.descEn}</p>

              <div className="space-y-1.5 pt-1">
                {(language === 'bn' ? guide.stepsBn : guide.stepsEn).map((step, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

        {activeTopic === 'accessibility' &&
          accessibilityGuides.map((guide, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-hud font-bold text-sm text-cyan-300">
                  {language === 'bn' ? guide.titleBn : guide.titleEn}
                </h3>
              </div>
              <p className="text-xs text-slate-300">{language === 'bn' ? guide.descBn : guide.descEn}</p>

              <div className="space-y-1.5 pt-1">
                {(language === 'bn' ? guide.stepsBn : guide.stepsEn).map((step, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
