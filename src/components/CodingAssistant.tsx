import React, { useState } from 'react';
import {
  Code2,
  Sparkles,
  Bug,
  BookOpen,
  Copy,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Language } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface CodingAssistantProps {
  language: Language;
  onCodeTask: (prompt: string, code: string, mode: 'explain' | 'debug' | 'generate') => Promise<string>;
}

export const CodingAssistant: React.FC<CodingAssistantProps> = ({
  language,
  onCodeTask,
}) => {
  const [selectedLang, setSelectedLang] = useState('Kotlin (Android)');
  const [mode, setMode] = useState<'explain' | 'debug' | 'generate'>('generate');
  const [userPrompt, setUserPrompt] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const templates = [
    {
      titleBn: 'Android কোটলিন স্পীচ লিসেনার',
      titleEn: 'Kotlin Android SpeechRecognizer',
      lang: 'Kotlin (Android)',
      code: `// Honor X6b & Android Speech Recognition Helper
class VoiceHelper(private val context: Context) {
    private val speechRecognizer = SpeechRecognition.createSpeechRecognizer(context)
    
    fun startListening(onResult: (String) -> Unit) {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "bn-BD")
        }
        speechRecognizer.startListening(intent)
    }
}`,
    },
    {
      titleBn: 'জাভাস্ক্রিপ্ট স্ক্রিন ক্যাপচার API',
      titleEn: 'Web Screen Capture getDisplayMedia',
      lang: 'JavaScript',
      code: `async function startScreenStream() {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: "browser" },
            audio: false
        });
        return stream;
    } catch (err) {
        console.error("Screen capture failed:", err);
    }
}`,
    },
    {
      titleBn: 'পাইথন ট্রেডিং RSI ও EMA ইন্ডিকেটর',
      titleEn: 'Python Trading RSI & EMA',
      lang: 'Python',
      code: `import pandas as pd

def calculate_indicators(df):
    # 14-period RSI and 50 EMA
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))
    df['ema_50'] = df['close'].ewm(span=50, adjust=False).mean()
    return df`,
    },
  ];

  const handleRun = async () => {
    if (!userPrompt.trim() && !codeSnippet.trim()) return;

    setIsLoading(true);
    soundEffects.playScan();

    try {
      const response = await onCodeTask(userPrompt, codeSnippet, mode);
      setResult(response);
      soundEffects.playSuccess();
    } catch {
      soundEffects.playError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-sky-400" />
            <h2 className="font-hud font-bold text-base sm:text-lg text-sky-300 tracking-wider uppercase">
              {language === 'bn' ? 'কোডিং সহকারী (CODING ASSISTANT)' : 'JARVIS Coding Assistant'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'Kotlin, Java, Python, JavaScript কোড তৈরি, ব্যাখ্যা ও বাগ সমাধান করুন।'
              : 'Write, debug, and understand Android Kotlin, Java, Python, and JavaScript code.'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setMode('generate')}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
              mode === 'generate' ? 'bg-sky-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'কোড লিখুন' : 'Generate'}</span>
          </button>
          <button
            onClick={() => setMode('debug')}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
              mode === 'debug' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ত্রুটি সমাধান' : 'Debug'}</span>
          </button>
          <button
            onClick={() => setMode('explain')}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
              mode === 'explain' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ব্যাখ্যা করুন' : 'Explain'}</span>
          </button>
        </div>
      </div>

      {/* Preset Code Snippets */}
      <div className="space-y-1">
        <span className="text-[11px] font-hud text-slate-400 uppercase tracking-wider">
          {language === 'bn' ? 'দ্রুত রেডিমেড টেমপ্লেট:' : 'Quick Templates:'}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {templates.map((tpl, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedLang(tpl.lang);
                setCodeSnippet(tpl.code);
                setUserPrompt(`Explain and optimize this ${tpl.lang} code`);
                soundEffects.playBeep();
              }}
              className="text-left p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 text-xs text-slate-300 transition-all group"
            >
              <div className="font-bold text-sky-300 group-hover:text-sky-200">
                {language === 'bn' ? tpl.titleBn : tpl.titleEn}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tpl.lang}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Input */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 font-hud">
              {language === 'bn' ? 'প্রোগ্রামিং ভাষা:' : 'Language:'}
            </label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 focus:outline-none"
            >
              <option value="Kotlin (Android)">Kotlin (Android / Honor X6b)</option>
              <option value="Java">Java (Android / Sketchware)</option>
              <option value="Python">Python (Trading / Data / AI)</option>
              <option value="JavaScript / TypeScript">JavaScript / TypeScript (Web / Node)</option>
              <option value="HTML / Tailwind CSS">HTML / CSS / Tailwind</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-hud text-slate-400">
              {language === 'bn' ? 'আপনার নির্দেশ / প্রশ্ন:' : 'Prompt or Instructions:'}
            </label>
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder={
                mode === 'debug'
                  ? language === 'bn'
                    ? 'যেমন: "App crash করছে, NullPointerException দিচ্ছে"'
                    : 'e.g. "App crashes with NullPointerException"'
                  : mode === 'explain'
                  ? language === 'bn'
                    ? 'যেমন: "এই কোডটি লাইন বাই লাইন বাংলায় বুঝিয়ে দাও"'
                    : 'e.g. "Explain this code line by line"'
                  : language === 'bn'
                  ? 'যেমন: "অ্যান্ড্রয়েডে ভয়েস টু টেক্সট চালু করার সহজ ফাংশন লিখো"'
                  : 'e.g. "Write a clean Kotlin function to handle voice input"'
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="space-y-1.5 flex-1 flex flex-col">
            <label className="text-xs font-hud text-slate-400">
              {language === 'bn' ? 'কোড বা এরর লগ পেস্ট করুন:' : 'Paste Code or Error Log:'}
            </label>
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="// Paste your code or error stack trace here..."
              rows={8}
              className="w-full flex-1 min-h-[160px] bg-slate-950 font-code text-xs text-emerald-300 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-sky-400 resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={handleRun}
            disabled={isLoading || (!userPrompt.trim() && !codeSnippet.trim())}
            className="w-full py-3 rounded-xl font-hud font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 disabled:opacity-40 text-black shadow-lg shadow-sky-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>
              {isLoading
                ? language === 'bn'
                  ? 'কোড প্রসেস করা হচ্ছে...'
                  : 'Processing Code...'
                : language === 'bn'
                ? 'সমাধান ও কোড তৈরি করুন'
                : 'Run Coding Task'}
            </span>
          </button>
        </div>

        {/* Right Column: Code Result */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2 text-xs font-hud text-sky-400">
              <Code2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'কোডিং সহকারীর ফলাফল' : 'GENERATED CODE & EXPLANATION'}</span>
            </div>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-sky-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[380px] p-4 rounded-2xl bg-slate-950/90 border border-sky-500/30 overflow-y-auto font-sans text-sm leading-relaxed text-slate-200 shadow-inner">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-sky-400">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <p className="text-xs font-hud tracking-wider animate-pulse">
                  {language === 'bn' ? 'কোড বিশ্লেষণ ও জেনারেট হচ্ছে...' : 'GENERATING CODE SOLUTION...'}
                </p>
              </div>
            ) : result ? (
              <div className="whitespace-pre-wrap font-sans">{result}</div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Code2 className="w-10 h-10 text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">
                  {language === 'bn' ? 'কোনো কোড তৈরি হয়নি' : 'No Code Generated Yet'}
                </p>
                <p className="text-xs max-w-xs">
                  {language === 'bn'
                    ? 'বাম পাশে আপনার প্রশ্ন বা কোড দিয়ে বাটনে ক্লিক করুন।'
                    : 'Provide code or prompt on the left to see solutions.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
