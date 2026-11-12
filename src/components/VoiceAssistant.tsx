import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { AppState, ChatMessage, Language } from '../types';
import { JarvisOrb } from './JarvisOrb';
import { soundEffects } from '../utils/soundEffects';

interface VoiceAssistantProps {
  appState: AppState;
  setAppState: (state: AppState) => void;
  language: Language;
  onSendMessage: (text: string) => Promise<string | void>;
  messages: ChatMessage[];
  onClearHistory: () => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  onSpeakText: (text: string) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  appState,
  setAppState,
  language,
  onSendMessage,
  messages,
  onClearHistory,
  isSpeaking,
  onStopSpeaking,
  onSpeakText,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [liveHeardText, setLiveHeardText] = useState('');

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const isListeningRef = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, appState]);

  // Keep ref in sync
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Initialize Speech Recognition once, dependent only on language
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Stay listening until silence or user taps stop
      recognition.interimResults = true;
      recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setAppState('LISTENING');
        setSpeechError(null);
        transcriptRef.current = '';
        setLiveHeardText('');
        soundEffects.playWake();
      };

      recognition.onresult = (event: any) => {
        let accumulated = '';
        for (let i = 0; i < event.results.length; ++i) {
          accumulated += event.results[i][0].transcript + ' ';
        }
        const text = accumulated.trim();
        if (text) {
          transcriptRef.current = text;
          setLiveHeardText(text);
          setInputText(text);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setSpeechError(
            language === 'bn'
              ? 'মাইক্রোফোন পারমিশন ব্লক রয়েছে। ব্রাউজার অ্যাড্রেস বার থেকে মাইক্রোফোন Allow করুন।'
              : 'Microphone blocked. Please allow microphone in browser address bar.'
          );
          setIsListening(false);
          isListeningRef.current = false;
          setAppState('ERROR');
          soundEffects.playError();
        } else if (event.error === 'no-speech') {
          // Normal silence, don't crash
        } else {
          setSpeechError(
            language === 'bn'
              ? `স্পীচ তথ্য: ${event.error}`
              : `Speech event: ${event.error}`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;

        const spoken = transcriptRef.current.trim();
        if (spoken) {
          transcriptRef.current = '';
          setLiveHeardText('');
          handleSubmit(spoken);
        } else if (appState === 'LISTENING') {
          setAppState('IDLE');
        }
      };

      recognitionRef.current = recognition;
    } catch (err: any) {
      console.warn('Recognition setup error:', err);
      setMicSupported(false);
    }

    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        }
      } catch {}
    };
  }, [language]);

  const toggleListen = async () => {
    if (isSpeaking) {
      onStopSpeaking();
    }

    if (isListeningRef.current) {
      // User tapped stop listening -> process whatever was heard
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      isListeningRef.current = false;
      const spoken = transcriptRef.current.trim() || inputText.trim();
      if (spoken) {
        transcriptRef.current = '';
        setLiveHeardText('');
        handleSubmit(spoken);
      } else {
        setAppState('IDLE');
        soundEffects.playBeep();
      }
    } else {
      // First ensure microphone permission via getUserMedia
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true }).then((mediaStream) => {
            // Close the test stream immediately
            mediaStream.getTracks().forEach((t) => t.stop());
          });
        }
      } catch (err: any) {
        console.warn('Microphone permission check failed:', err);
        setSpeechError(
          language === 'bn'
            ? 'মাইক্রোফোনের অনুমতি দিন (Allow Microphone)।'
            : 'Please grant microphone permission.'
        );
        return;
      }

      try {
        setInputText('');
        setLiveHeardText('');
        transcriptRef.current = '';
        setSpeechError(null);
        recognitionRef.current?.start();
      } catch (err: any) {
        console.warn('Recognition restart:', err);
        try {
          recognitionRef.current?.stop();
          setTimeout(() => {
            recognitionRef.current?.start();
          }, 150);
        } catch {}
      }
    }
  };

  const handleSubmit = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    if (isListeningRef.current) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      isListeningRef.current = false;
    }

    if (isSpeaking) {
      onStopSpeaking();
    }

    soundEffects.playBeep();
    setInputText('');
    setLiveHeardText('');
    transcriptRef.current = '';
    setSpeechError(null);
    setAppState('PROCESSING');

    try {
      const answer = await onSendMessage(text);
      if (answer) {
        soundEffects.playSuccess();
        setAppState('SPEAKING');
        onSpeakText(answer);
      } else {
        setAppState('IDLE');
      }
    } catch {
      setAppState('ERROR');
      soundEffects.playError();
      setTimeout(() => setAppState('IDLE'), 3000);
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] max-w-4xl mx-auto px-3 sm:px-4 py-3">
      {/* Top HUD Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          <h2 className="font-hud font-bold text-sm sm:text-base text-cyan-300 tracking-wider uppercase">
            {language === 'bn' ? 'ভয়েস সহকারী (JARVIS VOICE)' : 'JARVIS Voice Interface'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClearHistory}
              title="কথোপকথন মুছুন"
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 bg-slate-900/60 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{language === 'bn' ? 'মুছুন' : 'Clear'}</span>
            </button>
          )}

          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600/30 text-rose-300 border border-rose-500/40 hover:bg-rose-600/40 transition-colors animate-pulse cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'কথা থামান' : 'Interrupt'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Center Interactive Orb with audio visualization */}
      <div className="flex flex-col items-center justify-center py-4 bg-gradient-to-b from-cyan-950/20 to-transparent rounded-2xl border border-cyan-500/10 my-2 shadow-inner">
        <JarvisOrb
          state={appState}
          isListening={isListening}
          isSpeaking={isSpeaking}
          onClick={toggleListen}
          size="md"
        />

        {/* Live Audio Listening Feedback */}
        <div className="mt-2 text-center max-w-md px-4">
          {isListening ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 animate-pulse">
                <Radio className="w-3.5 h-3.5" />
                <span>
                  {language === 'bn'
                    ? 'মাইক্রোফোন চালু — কথা বলুন...'
                    : 'Microphone Active — Speak Now...'}
                </span>
              </div>
              {liveHeardText ? (
                <div className="p-2 rounded-lg bg-slate-900/90 border border-emerald-500/40 text-xs text-emerald-300 font-medium">
                  "{liveHeardText}"
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">
                  {language === 'bn'
                    ? 'আপনার কণ্ঠস্বর শোনা হচ্ছে... কথা শেষ হলে "উত্তর শুনুন" বাটনে চাপ দিন বা থামুন।'
                    : 'Listening to your speech...'}
                </p>
              )}
              <button
                onClick={toggleListen}
                className="mt-1 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
              >
                {language === 'bn' ? 'কথা শেষ করেছি, উত্তর শুনুন' : 'Done Speaking, Get Reply'}
              </button>
            </div>
          ) : isSpeaking ? (
            <p className="text-xs text-sky-300 animate-pulse font-medium">
              {language === 'bn'
                ? '🔊 FAHIM AI কথা বলছে... (থামাতে অর্ব বা বাটনে চাপুন)'
                : '🔊 FAHIM AI is speaking... (tap to interrupt)'}
            </p>
          ) : appState === 'PROCESSING' ? (
            <p className="text-xs text-cyan-400 animate-pulse font-medium">
              {language === 'bn' ? '⚡ আপনার কথাটি বিশ্লেষণ করছি...' : '⚡ Processing your request...'}
            </p>
          ) : (
            <p className="text-xs text-slate-300">
              {language === 'bn'
                ? 'কথা বলতে নিচের মাইক বা সেন্ট্রাল অর্বে ট্যাপ করুন'
                : 'Tap microphone or Orb to start speaking'}
            </p>
          )}
        </div>

        {speechError && (
          <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
        )}
      </div>

      {/* Conversation Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 px-2 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 text-slate-400 space-y-3">
            <Sparkles className="w-8 h-8 text-cyan-400/80 animate-pulse-slow" />
            <p className="text-sm font-semibold text-slate-200">
              {language === 'bn'
                ? 'FAHIM AI স্মার্ট ভয়েস সহকারী প্রস্তুত।'
                : 'FAHIM AI Smart Voice Assistant Ready.'}
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              {language === 'bn'
                ? 'বাংলায় আপনার স্বাভাবিক ভাষায় কথা বলুন। নিচের যেকোনো প্রশ্নে ট্যাপ করে বা মাইকে বলুন:'
                : 'Speak naturally in Bengali or English. Tap any sample query or use the mic:'}
            </p>

            <div className="flex flex-wrap justify-center gap-2 pt-2 max-w-md">
              {[
                { bn: '👋 কেমন আছো? তোমার পরিচয় দাও', en: '👋 Who are you?' },
                { bn: '📈 ট্রেডিং চার্টের সাপোর্ট রেজিস্ট্যান্স কীভাবে বুঝব?', en: '📈 How to find support & resistance?' },
                { bn: '⚡ Honor X6b ফোনের র‍্যাম কীভাবে বাড়াব?', en: '⚡ Honor X6b RAM Turbo setup' },
                { bn: '🖥️ স্ক্রিন ভিশন কীভাবে কাজ করে?', en: '🖥️ How does Screen Vision work?' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSubmit(language === 'bn' ? chip.bn : chip.en)}
                  className="px-3 py-1.5 rounded-full text-xs bg-slate-900 hover:bg-cyan-950 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  {language === 'bn' ? chip.bn : chip.en}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 mb-1 font-hud">
                <span>{msg.role === 'user' ? 'YOU' : 'FAHIM AI'}</span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-md backdrop-blur-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-cyan-500/30 text-slate-100 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                {msg.role === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-cyan-500/10 flex items-center justify-end gap-2 text-xs text-slate-400">
                    <button
                      onClick={() => onSpeakText(msg.content)}
                      title="অডিও শুনুন"
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 transition-colors cursor-pointer text-[11px]"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'অডিও শুনুন' : 'Speak'}</span>
                    </button>
                    <button
                      onClick={() => copyMessage(msg.content, msg.id)}
                      title="কপি করুন"
                      className="p-1 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input controls (Voice + Text alternative) */}
      <div className="mt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(inputText);
          }}
          className="flex items-center gap-2"
        >
          {/* Main Voice Toggle Button */}
          <button
            type="button"
            onClick={toggleListen}
            disabled={!micSupported}
            className={`p-3 rounded-xl transition-all shadow-md flex-shrink-0 active:scale-95 cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40 ring-2 ring-rose-400'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-black shadow-cyan-500/30'
            }`}
            title={
              !micSupported
                ? 'ব্রাউজারে মাইক্রোফোন সমর্থিত নয়'
                : isListening
                ? 'শোনা শেষ করুন ও উত্তর শুনুন'
                : 'মাইক্রোফোনে কথা বলুন'
            }
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? language === 'bn'
                  ? 'শুনছি... কথা বলা শেষ হলে সেন্ড বা মাইকে চাপ দিন'
                  : 'Listening... tap mic when done'
                : language === 'bn'
                ? 'বাংলায় মেসেজ লিখুন বা মাইকে বলুন...'
                : 'Type message or use voice...'
            }
            className="flex-1 bg-slate-900/90 border border-cyan-500/30 focus:border-cyan-400 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 shadow-inner"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || appState === 'PROCESSING'}
            className="p-3 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0 cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
