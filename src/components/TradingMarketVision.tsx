import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Upload,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  Target,
  BarChart2,
  FileImage,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { AppState, Language } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface TradingMarketVisionProps {
  setAppState: (state: AppState) => void;
  language: Language;
  onAnalyzeChart: (imageBase64: string, notes: string) => Promise<string>;
}

export const TradingMarketVision: React.FC<TradingMarketVisionProps> = ({
  setAppState,
  language,
  onAnalyzeChart,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMarkdown, setAnalysisMarkdown] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<string | null>(null);

  // Preset sample charts drawn on SVG/Canvas for instant testing
  const samplePresets = [
    {
      id: 'btc-15m',
      title: 'BTC/USDT 15m (Ascending Triangle Breakout)',
      instrument: 'BTC/USDT',
      timeframe: '15m',
      svgData: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350" style="background:%230b1320;font-family:sans-serif">
        <text x="20" y="30" fill="%2338bdf8" font-size="16" font-weight="bold">BTC/USDT - 15m - Binance</text>
        <line x1="50" y1="80" x2="550" y2="80" stroke="%23ef4444" stroke-width="2" stroke-dasharray="4"/>
        <text x="460" y="75" fill="%23ef4444" font-size="12">Resistance: $68,800</text>
        <line x1="80" y1="280" x2="480" y2="100" stroke="%2310b981" stroke-width="2"/>
        <text x="320" y="240" fill="%2310b981" font-size="12">Ascending Trendline Support</text>
        <rect x="100" y="220" width="10" height="40" fill="%2310b981"/>
        <rect x="140" y="190" width="10" height="30" fill="%23ef4444"/>
        <rect x="180" y="140" width="10" height="60" fill="%2310b981"/>
        <rect x="220" y="90" width="10" height="40" fill="%23ef4444"/>
        <rect x="260" y="160" width="10" height="50" fill="%2310b981"/>
        <rect x="300" y="130" width="10" height="35" fill="%23ef4444"/>
        <rect x="340" y="95" width="10" height="45" fill="%2310b981"/>
        <rect x="380" y="115" width="10" height="25" fill="%23ef4444"/>
        <rect x="420" y="90" width="10" height="30" fill="%2310b981"/>
        <rect x="460" y="70" width="12" height="50" fill="%2310b981"/>
        <text x="480" y="65" fill="%2310b981" font-size="12" font-weight="bold">Breakout Candle: $69,150</text>
        <text x="20" y="330" fill="%2364748b" font-size="11">RSI(14): 64.2 (Bullish Momentum) | Vol: 1.42K</text>
      </svg>`,
    },
    {
      id: 'eurusd-1h',
      title: 'EUR/USD 1h (Double Top & Neckline Retest)',
      instrument: 'EUR/USD',
      timeframe: '1h',
      svgData: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350" style="background:%230b1320;font-family:sans-serif">
        <text x="20" y="30" fill="%2338bdf8" font-size="16" font-weight="bold">EUR/USD - 1H - Forex MT5</text>
        <line x1="50" y1="70" x2="550" y2="70" stroke="%23ef4444" stroke-width="2"/>
        <text x="420" y="65" fill="%23ef4444" font-size="12">Peak Resistance: 1.0920</text>
        <line x1="50" y1="180" x2="550" y2="180" stroke="%2338bdf8" stroke-width="2" stroke-dasharray="4"/>
        <text x="420" y="175" fill="%2338bdf8" font-size="12">Neckline Level: 1.0850</text>
        <rect x="140" y="70" width="12" height="40" fill="%23ef4444"/>
        <text x="130" y="55" fill="%23f59e0b" font-size="11">Top 1</text>
        <rect x="220" y="160" width="12" height="30" fill="%2310b981"/>
        <rect x="300" y="70" width="12" height="40" fill="%23ef4444"/>
        <text x="290" y="55" fill="%23f59e0b" font-size="11">Top 2</text>
        <rect x="380" y="180" width="14" height="60" fill="%23ef4444"/>
        <text x="400" y="210" fill="%23ef4444" font-size="11">Breakdown</text>
        <rect x="450" y="185" width="10" height="20" fill="%2310b981"/>
        <text x="470" y="180" fill="%23f59e0b" font-size="11">Retest 1.0850</text>
        <rect x="500" y="210" width="12" height="50" fill="%23ef4444"/>
        <text x="20" y="330" fill="%2364748b" font-size="11">MACD: Bearish Crossover Below 0 | EMA 50: 1.0870</text>
      </svg>`,
    },
  ];

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setSelectedSample(null);
      soundEffects.playBeep();
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: (typeof samplePresets)[0]) => {
    setSelectedImage(sample.svgData);
    setSelectedSample(sample.id);
    setUserNotes(`Analyzing ${sample.title}`);
    soundEffects.playBeep();
  };

  const handleStartAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAppState('PROCESSING');
    soundEffects.playScan();

    try {
      const result = await onAnalyzeChart(selectedImage, userNotes);
      setAnalysisMarkdown(result);
      soundEffects.playSuccess();
    } catch {
      soundEffects.playError();
    } finally {
      setIsAnalyzing(false);
      setAppState('IDLE');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="font-hud font-bold text-base sm:text-lg text-emerald-300 tracking-wider uppercase">
              {language === 'bn'
                ? 'ট্রেডিং মার্কেট ভিশন (TRADING MARKET VISION)'
                : 'Trading Market Vision AI'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'TradingView, MT5 বা যেকোনো চার্ট স্ক্রিনশট আপলোড করে ১০-দফা কাঠামোগত বিশ্লেষণ পান।'
              : 'Upload TradingView/MT5 screenshots for structured 10-point educational market structure analysis.'}
          </p>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-hud bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
          PRO CHART SCANNER
        </div>
      </div>

      {/* Strict Trading Risk & Educational Disclaimer Banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">
            {language === 'bn' ? 'সতর্কতা ও ঝুঁকি নীতিমালা:' : 'Educational Disclaimer & Risk Policy:'}
          </span>{' '}
          {language === 'bn'
            ? 'এই টুলটি সম্পূর্ণ শিক্ষামূলক চার্ট বিশ্লেষণের জন্য। এটি কোনো নিশ্চিত প্রফিট সিগন্যাল বা আর্থিক পরামর্শ নয়। স্ক্রিনশট রিয়েল-টাইম লাইভ ফিড নয়। স্বয়ংক্রিয় ট্রেডিং কখনো করবেন না এবং সর্বদা রিস্ক ম্যানেজমেন্ট মেনে চলুন।'
            : 'For educational purposes only. Not financial advice. Screenshots may be delayed. Never trade with money you cannot afford to lose.'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Image Selection & Chart Controls */}
        <div className="flex flex-col space-y-3">
          {/* Sample Preset Buttons for Quick Testing */}
          <div className="space-y-1.5">
            <label className="text-xs font-hud text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'bn' ? 'নমুনা চার্ট দিয়ে দ্রুত পরীক্ষা:' : 'Quick Sample Charts:'}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {samplePresets.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    selectedSample === sample.id
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold truncate">{sample.instrument}</div>
                  <div className="text-[10px] text-slate-400 truncate">{sample.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Chart Preview / Upload Box */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-emerald-500/30 flex items-center justify-center shadow-lg group">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Selected Trading Chart"
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <label className="flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2 cursor-pointer w-full h-full hover:bg-slate-900/40 transition-colors">
                <Upload className="w-10 h-10 text-emerald-500/60 animate-pulse-slow" />
                <span className="text-sm font-semibold text-slate-300">
                  {language === 'bn'
                    ? 'ট্রেডিং চার্ট স্ক্রিনশট আপলোড করুন'
                    : 'Upload Trading Chart Screenshot'}
                </span>
                <span className="text-xs text-slate-500">
                  TradingView, MT4/MT5, Binance, বা বাইনান্স চার্ট (PNG, JPG)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {selectedImage && (
              <label className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-cyan-300 text-xs font-semibold cursor-pointer border border-cyan-500/40 flex items-center gap-1.5 backdrop-blur-md">
                <FileImage className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'অন্য চার্ট নির্বাচন' : 'Change Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* User Notes Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-hud text-slate-400">
              {language === 'bn'
                ? 'অতিরিক্ত নোট / প্রশ্ন (ঐচ্ছিক):'
                : 'Additional context or question:'}
            </label>
            <input
              type="text"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'যেমন: "১৫ মিনিটের টাইমফ্রেমে ব্রেকআউট কনফার্মেশন আছে কি?"'
                  : 'e.g. "Is the breakout on 15m confirmed with volume?"'
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleStartAnalysis}
            disabled={!selectedImage || isAnalyzing}
            className="w-full py-3 rounded-xl font-hud font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>
              {isAnalyzing
                ? language === 'bn'
                  ? 'চার্ট বিশ্লেষণ হচ্ছে...'
                  : 'Analyzing Chart...'
                : language === 'bn'
                ? '১০-দফা পূর্ণাঙ্গ বিশ্লেষণ শুরু করুন'
                : 'Run 10-Point Chart Analysis'}
            </span>
          </button>
        </div>

        {/* Right Column: 10-Point Analysis Output */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2 text-xs font-hud text-emerald-400">
              <BarChart2 className="w-4 h-4" />
              <span>{language === 'bn' ? '১০-দফা কাঠামোগত বিশ্লেষণ রিপোর্ট' : '10-POINT ANALYSIS REPORT'}</span>
            </div>
            {analysisMarkdown && (
              <span className="text-[11px] text-slate-400">Gemini 3.8 Flash</span>
            )}
          </div>

          <div className="flex-1 min-h-[420px] max-h-[550px] p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 overflow-y-auto text-sm leading-relaxed text-slate-200 font-sans shadow-inner">
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-emerald-400">
                <RefreshCw className="w-10 h-10 animate-spin text-emerald-400" />
                <p className="text-xs font-hud tracking-wider animate-pulse">
                  {language === 'bn'
                    ? 'ক্যান্ডেলস্টিক, সাপোর্ট/রেজিস্ট্যান্স ও ট্রেন্ড বিশ্লেষণ করা হচ্ছে...'
                    : 'PARSING CANDLESTICK STRUCTURE, S/R ZONES & BIAS...'}
                </p>
              </div>
            ) : analysisMarkdown ? (
              <div className="space-y-3">
                <div className="whitespace-pre-wrap">{analysisMarkdown}</div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                <Target className="w-12 h-12 text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">
                  {language === 'bn'
                    ? 'কোনো চার্ট বিশ্লেষণ রিপোর্ট তৈরি হয়নি'
                    : 'No Analysis Report Generated Yet'}
                </p>
                <p className="text-xs max-w-sm">
                  {language === 'bn'
                    ? 'বাম পাশ থেকে যেকোনো নমুনা চার্ট সিলেক্ট করুন বা আপনার নিজের চার্ট আপলোড করে "বিশ্লেষণ শুরু করুন"-এ ক্লিক করুন।'
                    : 'Select a sample chart on the left or upload your TradingView/MT5 chart to generate a 10-point analysis.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
