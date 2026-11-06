import React, { useState } from 'react';
import {
  FileSearch,
  Upload,
  Sparkles,
  RefreshCw,
  Trash2,
  Crop,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { AppState, Language } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface ManualScreenAnalysisProps {
  setAppState: (state: AppState) => void;
  language: Language;
  onAnalyzeScreenshot: (imageBase64: string, prompt: string) => Promise<string>;
}

export const ManualScreenAnalysis: React.FC<ManualScreenAnalysisProps> = ({
  setAppState,
  language,
  onAnalyzeScreenshot,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setResult(null);
      soundEffects.playBeep();
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
    setPrompt('');
    setZoomLevel(100);
    soundEffects.playBeep();
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setAppState('IMAGE_ANALYZING');
    soundEffects.playScan();

    try {
      const promptToUse =
        prompt.trim() ||
        (language === 'bn'
          ? 'এই স্ক্রিনশটের সমস্ত উপাদান বিশদভাবে বিশ্লেষণ করুন। দৃশ্যমান বাটন, ফিল্ড, টেবিল, ডেটা এবং নির্দেশাবলী বাংলায় সুস্পষ্টভাবে ব্যাখ্যা করুন। নিশ্চিত তথ্য এবং অনুমানের মধ্যে স্পষ্ট পার্থক্য রাখুন।'
          : 'Analyze this screenshot in detail. Clearly describe visible buttons, fields, tables, and instructions. Distinguish visible facts from assumptions.');

      const response = await onAnalyzeScreenshot(image, promptToUse);
      setResult(response);
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
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-cyan-400" />
            <h2 className="font-hud font-bold text-base sm:text-lg text-cyan-300 tracking-wider uppercase">
              {language === 'bn'
                ? 'ম্যানুয়াল স্ক্রিনশট বিশ্লেষণ (SCREENSHOT ANALYZER)'
                : 'Manual Screenshot Analysis'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'মোবাইল বা পিসির যেকোনো স্ক্রিনশট আপলোড করে উপাদান ও অর্থ বুঝে নিন।'
              : 'Upload any app or browser screenshot to extract text, buttons, and action points.'}
          </p>
        </div>

        {image && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-500/30 hover:bg-rose-900 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Clear'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upload & Preview Area */}
        <div className="flex flex-col space-y-3">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 flex items-center justify-center shadow-lg group">
            {image ? (
              <div className="w-full h-full overflow-auto flex items-center justify-center p-2">
                <img
                  src={image}
                  alt="Screenshot Preview"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
                  className="max-h-full max-w-full object-contain transition-transform"
                />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2 cursor-pointer w-full h-full hover:bg-slate-900/40 transition-colors">
                <Upload className="w-10 h-10 text-cyan-500/60 animate-pulse-slow" />
                <span className="text-sm font-semibold text-slate-300">
                  {language === 'bn'
                    ? 'স্ক্রিনশট নির্বাচন বা ড্রপ করুন'
                    : 'Select or Drop Screenshot'}
                </span>
                <span className="text-xs text-slate-500">JPG, PNG, WebP সমর্থিত</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Zoom / Area Controls */}
          {image && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Crop className="w-3.5 h-3.5 text-cyan-400" />
                <span>জুম / আকার:</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="w-24 accent-cyan-400"
                />
                <span className="font-mono text-cyan-400">{zoomLevel}%</span>
              </div>
              <label className="text-cyan-400 hover:underline cursor-pointer">
                নতুন ছবি নির্বাচন
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Prompt input */}
          <div className="space-y-1.5">
            <label className="text-xs font-hud text-slate-400">
              {language === 'bn' ? 'কী জানতে চান? (ঐচ্ছিক প্রশ্ন):' : 'Specific question (optional):'}
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'যেমন: "কোন বাটনে চাপ দিতে হবে?", "এর মূল মেসেজ কী?"'
                  : 'e.g. "What is the error on screen?", "Explain the buttons"'
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!image || isAnalyzing}
            className="w-full py-3 rounded-xl font-hud font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 disabled:opacity-40 text-black shadow-lg shadow-cyan-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>
              {isAnalyzing
                ? language === 'bn'
                  ? 'বিশ্লেষণ চলছে...'
                  : 'Analyzing...'
                : language === 'bn'
                ? 'স্ক্রিনশট বিশ্লেষণ করুন'
                : 'Analyze Screenshot'}
            </span>
          </button>
        </div>

        {/* Output Box */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-2 text-xs font-hud text-cyan-400 pb-1">
            <CheckCircle className="w-4 h-4" />
            <span>{language === 'bn' ? 'বিশ্লেষণ ফলাফল' : 'SCREENSHOT ANALYSIS RESULT'}</span>
          </div>

          <div className="flex-1 min-h-[360px] p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 overflow-y-auto text-sm leading-relaxed text-slate-200 font-sans shadow-inner">
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-cyan-400">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <p className="text-xs font-hud tracking-wider animate-pulse">
                  {language === 'bn' ? 'স্ক্রিনশট স্ক্যান হচ্ছে...' : 'SCANNING SCREENSHOT...'}
                </p>
              </div>
            ) : result ? (
              <div className="whitespace-pre-wrap">{result}</div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <FileSearch className="w-10 h-10 text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">
                  {language === 'bn'
                    ? 'কোনো স্ক্রিনশট এখনও বিশ্লেষণ করা হয়নি'
                    : 'No Screenshot Analyzed Yet'}
                </p>
                <p className="text-xs max-w-xs">
                  {language === 'bn'
                    ? 'ছবি আপলোড করে "বিশ্লেষণ করুন"-এ চাপ দিন।'
                    : 'Upload a screenshot and click "Analyze Screenshot".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
