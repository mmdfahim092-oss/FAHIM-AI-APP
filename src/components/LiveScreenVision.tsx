import React, { useState, useRef, useEffect } from 'react';
import {
  Monitor,
  Play,
  Pause,
  Square,
  Sparkles,
  Camera,
  ShieldAlert,
  Clock,
  Eye,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { AppState, Language } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface LiveScreenVisionProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
  language: Language;
  onAnalyzeFrame: (imageBase64: string, prompt: string) => Promise<string>;
}

export const LiveScreenVision: React.FC<LiveScreenVisionProps> = ({
  setAppState,
  language,
  onAnalyzeFrame,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [autoSampleInterval, setAutoSampleInterval] = useState<number>(0); // 0 = manual only, 15 = 15s, 30 = 30s
  const [countdown, setCountdown] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<any>(null);

  // Start Screen Capture
  const startCapture = async () => {
    try {
      setAppState('SCREEN_CAPTURE_STARTING');
      soundEffects.playBeep();

      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        },
        audio: false,
      });

      setStream(mediaStream);
      setIsCapturing(true);
      setIsPaused(false);
      setAppState('SCREEN_CAPTURE_ACTIVE');
      soundEffects.playSuccess();

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Listen for stream ended by user via browser native bar
      mediaStream.getVideoTracks()[0].onended = () => {
        stopCapture();
      };
    } catch (err: any) {
      console.warn('Screen capture cancelled or failed:', err);
      setAppState('ERROR');
      soundEffects.playError();
      setTimeout(() => setAppState('IDLE'), 2000);
    }
  };

  const stopCapture = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsCapturing(false);
    setIsPaused(false);
    setAppState('IDLE');
    soundEffects.playBeep();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const togglePause = () => {
    if (!stream) return;
    const tracks = stream.getVideoTracks();
    if (tracks.length > 0) {
      const willBePaused = !isPaused;
      tracks[0].enabled = !willBePaused;
      setIsPaused(willBePaused);
      soundEffects.playBeep();
    }
  };

  // Capture frame from active video element
  const captureCurrentFrame = (): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setLastCapturedImage(dataUrl);
    soundEffects.playScan();
    return dataUrl;
  };

  // Trigger frame analysis with Gemini
  const handleAnalyzeNow = async () => {
    let image = lastCapturedImage;
    if (isCapturing && !isPaused) {
      const newImage = captureCurrentFrame();
      if (newImage) image = newImage;
    }

    if (!image) return;

    setIsAnalyzing(true);
    setAppState('IMAGE_ANALYZING');
    soundEffects.playBeep();

    try {
      const promptToUse =
        customPrompt.trim() ||
        (language === 'bn'
          ? 'এই স্ক্রিনের সবকিছু পুঙ্খানুপুঙ্খভাবে বিশ্লেষণ করুন। দৃশ্যমান বাটন, ফিল্ড, টেবিল, ডেটা এবং ব্যবহারকারীর জন্য সহায়ক তথ্য বাংলায় তুলে ধরুন।'
          : 'Analyze all visible elements on this captured screen. Explain buttons, form fields, charts, tables, and provide practical next steps.');

      const result = await onAnalyzeFrame(image, promptToUse);
      setAnalysisResult(result);
      soundEffects.playSuccess();
    } catch {
      soundEffects.playError();
    } finally {
      setIsAnalyzing(false);
      setAppState(isCapturing ? 'SCREEN_CAPTURE_ACTIVE' : 'IDLE');
    }
  };

  // Automatic sampling timer
  useEffect(() => {
    if (!isCapturing || isPaused || autoSampleInterval === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCountdown(0);
      return;
    }

    setCountdown(autoSampleInterval);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          captureCurrentFrame();
          handleAnalyzeNow();
          return autoSampleInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isCapturing, isPaused, autoSampleInterval]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <h2 className="font-hud font-bold text-base sm:text-lg text-cyan-300 tracking-wider uppercase">
              {language === 'bn'
                ? 'লাইভ স্ক্রিন ভিশন (LIVE SCREEN VISION)'
                : 'Live Screen Vision AI'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'অ্যান্ড্রয়েড/ব্রাউজার স্ক্রিন শেয়ার করে যেকোনো অ্যাপ বা ওয়েবসাইটের তথ্য বুঝুন।'
              : 'Share browser window or screen to detect buttons, UI elements, charts, and text.'}
          </p>
        </div>

        {/* Status Pill */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-hud border transition-all ${
            isCapturing
              ? isPaused
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isCapturing
                ? isPaused
                  ? 'bg-amber-400'
                  : 'bg-emerald-400 animate-pulse'
                : 'bg-slate-500'
            }`}
          />
          <span>
            {isCapturing
              ? isPaused
                ? 'PAUSED'
                : 'CAPTURE ACTIVE'
              : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Security and Privacy Notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-300">
        <ShieldAlert className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-cyan-300">
            {language === 'bn' ? 'গোপনীয়তা নীতি:' : 'Privacy Protection:'}
          </span>{' '}
          {language === 'bn'
            ? 'স্ক্রিন ক্যাপচার সম্পূর্ণ আপনার নিয়ন্ত্রণে। অনুমতি ছাড়া কোনো ফ্রেম পাঠানো হয় না। সংবেদনশীল পাসওয়ার্ড বা পেমেন্ট স্ক্রিন শেয়ার করবেন না।'
            : 'Screen capture runs strictly with your explicit permission. No background recording is performed.'}
        </div>
      </div>

      {/* Main Viewport & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Left: Video / Canvas Stream View */}
        <div className="flex flex-col space-y-3">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 flex items-center justify-center shadow-lg group">
            {isCapturing ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-contain ${isPaused ? 'opacity-50' : 'opacity-100'}`}
              />
            ) : lastCapturedImage ? (
              <img
                src={lastCapturedImage}
                alt="Captured Frame"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                <Monitor className="w-12 h-12 text-slate-600 animate-pulse-slow" />
                <p className="text-sm font-semibold text-slate-400">
                  {language === 'bn' ? 'স্ক্রিন সংযোগ নেই' : 'No Active Screen Feed'}
                </p>
                <p className="text-xs max-w-xs">
                  {language === 'bn'
                    ? '"স্ক্রিন শুরু করুন" বাটনে চাপ দিয়ে উইন্ডো বা ট্যাব নির্বাচন করুন।'
                    : 'Click "Start Screen Capture" to select an app, tab, or screen.'}
                </p>
              </div>
            )}

            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none scanline opacity-30" />

            {/* In-viewport banner when capturing */}
            {isCapturing && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[11px] font-hud text-cyan-300 border border-cyan-500/30">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>LIVE FEED</span>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Capture Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20">
            <div className="flex items-center gap-2">
              {!isCapturing ? (
                <button
                  onClick={startCapture}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-hud font-semibold text-xs tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>{language === 'bn' ? 'স্ক্রিন শুরু করুন' : 'Start Capture'}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={togglePause}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-hud text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all"
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={stopCapture}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-hud text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition-all"
                  >
                    <Square className="w-3.5 h-3.5 fill-rose-300" />
                    <span>{language === 'bn' ? 'বন্ধ করুন' : 'Stop'}</span>
                  </button>

                  <button
                    onClick={() => captureCurrentFrame()}
                    title="স্নাপশট নিন"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-hud text-xs font-semibold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ফ্রেম নিন' : 'Snap'}</span>
                  </button>
                </>
              )}
            </div>

            {/* Sampling Rate Control */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'bn' ? 'অটো স্ক্যান:' : 'Auto Scan:'}</span>
              <select
                value={autoSampleInterval}
                onChange={(e) => setAutoSampleInterval(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value={0}>ম্যানুয়াল (Manual)</option>
                <option value={15}>১৫ সেকেন্ড পর পর</option>
                <option value={30}>৩০ সেকেন্ড পর পর</option>
              </select>
              {countdown > 0 && (
                <span className="font-mono text-cyan-400 font-bold">({countdown}s)</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: AI Vision Analysis Result */}
        <div className="flex flex-col space-y-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20 space-y-2">
            <label className="text-xs font-semibold text-cyan-300 font-hud">
              {language === 'bn'
                ? 'বিশেষ কী জানতে চান? (ঐচ্ছিক প্রশ্ন):'
                : 'Focus question (optional):'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'যেমন: "পরবর্তী কোন বাটনে ক্লিক করতে হবে?", "টেবিলের সারসংক্ষেপ বলো"'
                    : 'e.g. "What button should I click next?", "Summarize data"'
                }
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleAnalyzeNow}
                disabled={(!isCapturing && !lastCapturedImage) || isAnalyzing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-hud text-xs font-bold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black shadow-md transition-all active:scale-95 flex-shrink-0"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isAnalyzing ? 'বিশ্লেষণ হচ্ছে...' : 'বিশ্লেষণ করুন'}</span>
              </button>
            </div>
          </div>

          {/* Analysis Output Box */}
          <div className="flex-1 min-h-[260px] p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 overflow-y-auto font-sans text-sm leading-relaxed text-slate-200">
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-cyan-400">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <p className="text-xs font-hud tracking-wider animate-pulse">
                  {language === 'bn'
                    ? 'GEMINI 3.8 FLASH ফ্রেমটি বিশ্লেষণ করছে...'
                    : 'GEMINI 3.8 FLASH IS ANALYZING FRAME...'}
                </p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/20 text-xs font-hud text-cyan-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'bn' ? 'বিশ্লেষণ সম্পন্ন' : 'ANALYSIS COMPLETE'}</span>
                </div>
                <div className="whitespace-pre-wrap">{analysisResult}</div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Eye className="w-8 h-8 text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">
                  {language === 'bn'
                    ? 'স্ক্রিনের ফ্রেম নিয়ে "বিশ্লেষণ করুন" বাটনে ক্লিক করুন।'
                    : 'Capture a frame and click "Analyze" to see breakdown.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
