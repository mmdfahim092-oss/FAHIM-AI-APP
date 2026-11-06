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

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, appState]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setAppState('LISTENING');
      setSpeechError(null);
      soundEffects.playWake();
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setInputText(transcript);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setSpeechError(
          language === 'bn'
            ? 'মাইক্রোফোন অনুমতি পাওয়া যায়নি। ব্রাউজার সেটিংস থেকে অনুমতি দিন।'
            : 'Microphone permission denied. Please grant microphone access.'
        );
      } else if (event.error !== 'no-speech') {
        setSpeechError(
          language === 'bn'
            ? `স্পীচ রিকগনিশন ত্রুটি: ${event.error}`
            : `Speech error: ${event.error}`
        );
      }
      setAppState('ERROR');
      soundEffects.playError();
      setTimeout(() => setAppState('IDLE'), 2500);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (inputText.trim()) {
        handleSubmit(inputText);
      } else if (appState === 'LISTENING') {
        setAppState('IDLE');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        // Safe cleanup
      }
    };
  }, [language, appState, inputText]);

  const toggleListen = () => {
    if (isSpeaking) {
      onStopSpeaking();
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setAppState('IDLE');
      soundEffects.playBeep();
    } else {
      try {
        setInputText('');
        setSpeechError(null);
        recognitionRef.current?.start();
      } catch (err: any) {
        console.warn('Recognition start error:', err);
        // If already started, stop then restart
        recognitionRef.current?.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 150);
      }
    }
  };

  const handleSubmit = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    }

    if (isSpeaking) {
      onStopSpeaking();
    }

    soundEffects.playBeep();
    setInputText('');
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
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 bg-slate-900/60 border border-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{language === 'bn' ? 'মুছুন' : 'Clear'}</span>
            </button>
          )}

          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600/30 text-rose-300 border border-rose-500/40 hover:bg-rose-600/40 transition-colors animate-pulse"
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

        <div className="mt-2 text-center">
          <p className="text-xs text-slate-300">
            {isListening
              ? language === 'bn'
                ? 'বলুন, আমি শুনছি...'
                : 'Listening to your voice...'
              : isSpeaking
              ? language === 'bn'
                ? 'FAHIM AI উত্তর দিচ্ছে (থামাতে বাটনে ট্যাপ করুন)...'
                : 'FAHIM AI is speaking (tap to interrupt)...'
              : appState === 'PROCESSING'
              ? language === 'bn'
                ? 'বিশ্লেষণ ও ভাবছি...'
                : 'Processing your request...'
              : language === 'bn'
              ? 'কথা বলতে নিচের মাইক বাটনে বা কোর অর্বে ট্যাপ করুন'
              : 'Tap microphone or Orb to start speaking'}
          </p>
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
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
            <Sparkles className="w-8 h-8 text-cyan-400/60 animate-pulse-slow" />
            <p className="text-sm font-semibold text-slate-300">
              {language === 'bn'
                ? 'FAHIM AI ভয়েস সহকারী প্রস্তুত।'
                : 'FAHIM AI Voice Assistant Ready.'}
            </p>
            <p className="text-xs text-slate-500 max-w-sm">
              {language === 'bn'
                ? 'বাংলা বা ইংরেজিতে কথা বলুন। ট্রেডিং, কোডিং, স্ক্রিন ভিশন বা যেকোনো তথ্য জিজ্ঞাসা করতে পারেন।'
                : 'Speak in Bengali or English. Ask about charts, coding, device settings, or screen vision.'}
            </p>
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
                      title="পুনরায় অডিও শুনুন"
                      className="p-1 hover:text-cyan-300 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyMessage(msg.content, msg.id)}
                      title="কপি করুন"
                      className="p-1 hover:text-cyan-300 transition-colors"
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
            className={`p-3 rounded-xl transition-all shadow-md flex-shrink-0 active:scale-95 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-black shadow-cyan-500/30'
            }`}
            title={
              !micSupported
                ? 'ব্রাউজারে মাইক্রোফোন সমর্থিত নয়'
                : isListening
                ? 'শোনা বন্ধ করুন'
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
                  ? 'শুনছি...'
                  : 'Listening...'
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
            className="p-3 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
