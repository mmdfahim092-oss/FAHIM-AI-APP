import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Sparkles,
  CameraOff,
  SwitchCamera,
  CheckCircle,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { AppState, Language } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface CameraScannerProps {
  setAppState: (state: AppState) => void;
  language: Language;
  onAnalyzeImage: (imageBase64: string, prompt: string) => Promise<string>;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  setAppState,
  language,
  onAnalyzeImage,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Start Camera
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      soundEffects.playBeep();
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(newStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      soundEffects.playSuccess();
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setIsCameraActive(false);
      setCameraError(
        language === 'bn'
          ? 'ক্যামেরা চালু করা যায়নি। ব্রাউজারে ক্যামেরার অনুমতি দিন।'
          : 'Could not access camera. Please allow camera permissions.'
      );
      soundEffects.playError();
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsCameraActive(false);
    soundEffects.playBeep();
  };

  // Flip camera (environment/user)
  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      startCamera(nextMode);
    }
  };

  // Capture frame
  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    soundEffects.playScan();
  };

  // Analyze snapshot with Gemini
  const handleAnalyzeSnapshot = async () => {
    if (!capturedPhoto) return;

    setIsAnalyzing(true);
    setAppState('IMAGE_ANALYZING');
    soundEffects.playBeep();

    try {
      const promptToUse =
        prompt.trim() ||
        (language === 'bn'
          ? 'এই ক্যামেরায় তোলা ছবিতে কী দেখা যাচ্ছে? টেক্সট (OCR), বস্তু, নথি, বা চার্ট থাকলে তা বাংলায় বিস্তারিতভাবে ব্যাখ্যা করুন।'
          : 'Analyze this photo taken by the camera. Identify visible objects, OCR text, document details, and explain clearly.');

      const result = await onAnalyzeImage(capturedPhoto, promptToUse);
      setAnalysisResult(result);
      soundEffects.playSuccess();
    } catch {
      soundEffects.playError();
    } finally {
      setIsAnalyzing(false);
      setAppState('IDLE');
    }
  };

  // Clean up camera when leaving view
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h2 className="font-hud font-bold text-base sm:text-lg text-amber-300 tracking-wider uppercase">
              {language === 'bn' ? 'ক্যামেরা স্ক্যানার (CAMERA SCANNER)' : 'Camera Vision Scanner'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'মোবাইল বা ওয়েবক্যাম দিয়ে বই, ডকুমেন্ট, চার্ট বা যেকোনো বস্তু স্ক্যান করুন।'
              : 'Scan real-world objects, documents, physical charts, or text via camera.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCameraActive && (
            <button
              onClick={flipCamera}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 hover:text-cyan-300 transition-colors"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
              <span>{facingMode === 'environment' ? 'ব্যাক ক্যামেরা' : 'ফ্রন্ট ক্যামেরা'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Viewport / Controls */}
        <div className="flex flex-col space-y-3">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-amber-500/30 flex items-center justify-center shadow-lg group">
            {capturedPhoto ? (
              <img
                src={capturedPhoto}
                alt="Captured Snapshot"
                className="w-full h-full object-contain"
              />
            ) : isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                <Camera className="w-12 h-12 text-slate-600 animate-pulse-slow" />
                <p className="text-sm font-semibold text-slate-400">
                  {language === 'bn' ? 'ক্যামেরা বন্ধ রয়েছে' : 'Camera is Idle'}
                </p>
                <p className="text-xs max-w-xs">
                  {language === 'bn'
                    ? 'অনুমতি দিয়ে ক্যামেরা চালু করতে নিচের বাটনে চাপ দিন।'
                    : 'Click "Start Camera" to capture and analyze physical items.'}
                </p>
              </div>
            )}

            {isCameraActive && !capturedPhoto && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[11px] font-hud text-amber-300 border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SECURE CAMERA ACTIVE</span>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {cameraError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-xs text-rose-300">
              {cameraError}
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/80 border border-amber-500/20">
            <div className="flex items-center gap-2">
              {!isCameraActive && !capturedPhoto ? (
                <button
                  onClick={() => startCamera()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-hud font-semibold text-xs tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-black shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>{language === 'bn' ? 'ক্যামেরা চালু করুন' : 'Start Camera'}</span>
                </button>
              ) : isCameraActive && !capturedPhoto ? (
                <>
                  <button
                    onClick={takeSnapshot}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl font-hud font-bold text-xs tracking-wider uppercase bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-500/30 transition-all active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{language === 'bn' ? 'ছবি তুলুন (SNAP)' : 'Capture Photo'}</span>
                  </button>

                  <button
                    onClick={stopCamera}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-hud text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-500/40 hover:bg-rose-900 transition-all"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'বন্ধ করুন' : 'Stop'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setCapturedPhoto(null);
                    setAnalysisResult(null);
                    if (!isCameraActive) startCamera();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-hud text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'পুনরায় ছবি তুলুন' : 'Retake'}</span>
                </button>
              )}
            </div>
          </div>

          {capturedPhoto && (
            <div className="space-y-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'কী জানতে চান? (যেমন: "টেক্সটগুলো পড়ে দাও", "নথিটির সারাংশ বলো")'
                    : 'Specific focus (e.g. "Extract text", "Explain document")'
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />

              <button
                onClick={handleAnalyzeSnapshot}
                disabled={isAnalyzing}
                className="w-full py-3 rounded-xl font-hud font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 disabled:opacity-40 text-black shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>
                  {isAnalyzing
                    ? language === 'bn'
                      ? 'ছবি বিশ্লেষণ হচ্ছে...'
                      : 'Analyzing Snapshot...'
                    : language === 'bn'
                    ? 'এআই দিয়ে স্ক্যান করুন'
                    : 'Analyze with Gemini AI'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Output */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-2 text-xs font-hud text-amber-400 pb-1">
            <CheckCircle className="w-4 h-4" />
            <span>{language === 'bn' ? 'ক্যামেরা ভিশন ফলাফল' : 'CAMERA VISION RESULT'}</span>
          </div>

          <div className="flex-1 min-h-[360px] p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 overflow-y-auto text-sm leading-relaxed text-slate-200 font-sans shadow-inner">
            {isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-amber-400">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <p className="text-xs font-hud tracking-wider animate-pulse">
                  {language === 'bn' ? 'চিত্র ও ওসিআর বিশ্লেষণ হচ্ছে...' : 'PARSING OBJECTS & TEXT...'}
                </p>
              </div>
            ) : analysisResult ? (
              <div className="whitespace-pre-wrap">{analysisResult}</div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <Camera className="w-10 h-10 text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">
                  {language === 'bn' ? 'কোনো স্ক্যান ফলাফল নেই' : 'No Scan Result Yet'}
                </p>
                <p className="text-xs max-w-xs">
                  {language === 'bn'
                    ? 'ক্যামেরা দিয়ে ছবি তুলে "এআই দিয়ে স্ক্যান করুন" চাপুন।'
                    : 'Snap a picture and click "Analyze with Gemini AI".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
