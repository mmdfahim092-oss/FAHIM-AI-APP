import React, { useState, useEffect, useRef } from 'react';
import {
  AppState,
  ChatMessage,
  Conversation,
  Language,
  MemoryItem,
  NavigationTab,
} from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeDashboard } from './components/HomeDashboard';
import { VoiceAssistant } from './components/VoiceAssistant';
import { LiveScreenVision } from './components/LiveScreenVision';
import { TradingMarketVision } from './components/TradingMarketVision';
import { ManualScreenAnalysis } from './components/ManualScreenAnalysis';
import { CameraScanner } from './components/CameraScanner';
import { CodingAssistant } from './components/CodingAssistant';
import { MemoryVault } from './components/MemoryVault';
import { PhoneAssistant } from './components/PhoneAssistant';
import { ConversationHistory } from './components/ConversationHistory';
import { SettingsModal } from './components/SettingsModal';
import { soundEffects } from './utils/soundEffects';
import {
  buildSystemPrompt,
  buildTradingVisionPrompt,
  buildScreenVisionPrompt,
  buildCodingPrompt,
} from './utils/aiPrompts';

export default function App() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [language, setLanguage] = useState<Language>('bn');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Stored state with localStorage persistence
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('fahim_ai_memories');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'default-1',
        title: 'টার্গেট ডিভাইস',
        content: 'ব্যবহারকারীর প্রধান ডিভাইস Honor X6b (Android)',
        category: 'system',
        timestamp: Date.now(),
      },
      {
        id: 'default-2',
        title: 'ভাষা পছন্দ',
        content: 'বাংলায় বন্ধুত্বপূর্ণ ও স্পষ্ট ব্যাখ্যা পছন্দ করেন',
        category: 'preference',
        timestamp: Date.now(),
      },
    ];
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('fahim_ai_conversations');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fahim_ai_memories', JSON.stringify(memories));
    } catch {}
  }, [memories]);

  useEffect(() => {
    try {
      localStorage.setItem('fahim_ai_conversations', JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  useEffect(() => {
    soundEffects.enabled = soundEnabled;
  }, [soundEnabled]);

  // Text-To-Speech (TTS)
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    if (appState === 'SPEAKING') {
      setAppState('IDLE');
    }
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Clean markdown code blocks from speech for natural audio
    const cleanSpeech = text
      .replace(/```[\s\S]*?```/g, 'কোড ব্লক বিস্তারিত স্ক্রিনে প্রদর্শিত হচ্ছে।')
      .replace(/[#*`_]/g, '')
      .slice(0, 450); // Keep voice response digestible

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Pick best voice for Bengali or English
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find((v) => v.lang.includes('bn') || v.lang.includes('BD') || v.lang.includes('IN'));
    if (bnVoice && language === 'bn') {
      utterance.voice = bnVoice;
      utterance.lang = bnVoice.lang;
    } else {
      utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setAppState('SPEAKING');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setAppState('IDLE');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setAppState('IDLE');
    };

    window.speechSynthesis.speak(utterance);
  };

  // API Call helper for Chat
  const handleSendMessage = async (text: string): Promise<string> => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newHistory = [...currentMessages, userMsg];
    setCurrentMessages(newHistory);

    try {
      const systemInstruction = buildSystemPrompt(language, memories);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          systemInstruction,
          history: newHistory,
        }),
      });

      const data = await res.json();
      const assistantText = data.text || 'কোনো উত্তর পাওয়া যায়নি।';

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        role: 'assistant',
        content: assistantText,
        timestamp: Date.now(),
      };

      const finalMessages = [...newHistory, assistantMsg];
      setCurrentMessages(finalMessages);

      // Save/update conversation
      const convoId = currentMessages.length > 0 ? conversations[0]?.id || `convo-${Date.now()}` : `convo-${Date.now()}`;
      const title = text.slice(0, 30);
      setConversations((prev) => {
        const existingIndex = prev.findIndex((c) => c.id === convoId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            messages: finalMessages,
            updatedAt: Date.now(),
          };
          return updated;
        } else {
          return [
            {
              id: convoId,
              title: title,
              category: activeTab,
              messages: finalMessages,
              updatedAt: Date.now(),
            },
            ...prev,
          ];
        }
      });

      return assistantText;
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorText = 'দুঃখিত, সংযোগে একটি সমস্যা দেখা দিয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: errorText,
        timestamp: Date.now(),
      };
      setCurrentMessages([...newHistory, errorMsg]);
      return errorText;
    }
  };

  // Vision API Call helper
  const handleAnalyzeVision = async (imageBase64: string, prompt: string, systemInstruction?: string): Promise<string> => {
    try {
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
          prompt,
          systemInstruction: systemInstruction || buildSystemPrompt(language, memories),
        }),
      });

      const data = await res.json();
      return data.text || 'কোনো ফলাফল পাওয়া যায়নি।';
    } catch (err: any) {
      console.error('Vision API error:', err);
      return 'চিত্র বিশ্লেষণে ত্রুটি দেখা দিয়েছে: ' + (err.message || 'Network failure');
    }
  };

  // Quick Prompt Launcher from Dashboard
  const handleQuickPrompt = (promptText: string, targetTab: NavigationTab) => {
    setActiveTab(targetTab);
    soundEffects.playBeep();
    if (targetTab === 'voice') {
      handleSendMessage(promptText);
    }
  };

  // Memory Vault Handlers
  const handleAddMemory = (item: Omit<MemoryItem, 'id' | 'timestamp'>) => {
    const newItem: MemoryItem = {
      ...item,
      id: `mem-${Date.now()}`,
      timestamp: Date.now(),
    };
    setMemories([newItem, ...memories]);
  };

  const handleUpdateMemory = (id: string, updated: Partial<MemoryItem>) => {
    setMemories(memories.map((m) => (m.id === id ? { ...m, ...updated } : m)));
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(memories.filter((m) => m.id !== id));
  };

  const handleClearAllMemories = () => {
    setMemories([]);
  };

  // History Handlers
  const handleSelectConversation = (convo: Conversation) => {
    setCurrentMessages(convo.messages);
    setActiveTab(convo.category || 'voice');
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(conversations.filter((c) => c.id !== id));
  };

  const handleClearAllHistory = () => {
    setConversations([]);
    setCurrentMessages([]);
  };

  const handleClearAllData = () => {
    setMemories([]);
    setConversations([]);
    setCurrentMessages([]);
    localStorage.clear();
    soundEffects.playSuccess();
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Cyber Glow Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* Futuristic HUD Header */}
      <Header
        currentTab={activeTab}
        language={language}
        onLanguageToggle={() => {
          setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
          soundEffects.playBeep();
        }}
        soundEnabled={soundEnabled}
        onSoundToggle={() => {
          setSoundEnabled((prev) => !prev);
        }}
        onOpenSettings={() => {
          setIsSettingsOpen(true);
          soundEffects.playBeep();
        }}
        onNavigateHome={() => {
          setActiveTab('home');
          soundEffects.playBeep();
        }}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          soundEffects.playBeep();
        }}
        language={language}
      />

      {/* Main View Area */}
      <main className="flex-1 relative z-10 overflow-y-auto">
        {activeTab === 'home' && (
          <HomeDashboard
            appState={appState}
            isListening={appState === 'LISTENING'}
            isSpeaking={isSpeaking}
            onOrbClick={() => {
              setActiveTab('voice');
              soundEffects.playWake();
            }}
            onNavigate={(tab) => {
              setActiveTab(tab);
              soundEffects.playBeep();
            }}
            language={language}
            onQuickPrompt={handleQuickPrompt}
          />
        )}

        {activeTab === 'voice' && (
          <VoiceAssistant
            appState={appState}
            setAppState={setAppState}
            language={language}
            onSendMessage={handleSendMessage}
            messages={currentMessages}
            onClearHistory={() => {
              setCurrentMessages([]);
              soundEffects.playBeep();
            }}
            isSpeaking={isSpeaking}
            onStopSpeaking={stopSpeaking}
            onSpeakText={speakText}
          />
        )}

        {activeTab === 'screen_vision' && (
          <LiveScreenVision
            appState={appState}
            setAppState={setAppState}
            language={language}
            onAnalyzeFrame={(img, prompt) =>
              handleAnalyzeVision(img, prompt, buildScreenVisionPrompt(language))
            }
          />
        )}

        {activeTab === 'trading_vision' && (
          <TradingMarketVision
            setAppState={setAppState}
            language={language}
            onAnalyzeChart={(img, notes) =>
              handleAnalyzeVision(
                img,
                buildTradingVisionPrompt(language, notes),
                'You are an expert trading market analyst in Bengali and English. Follow strict educational guidelines and 10-point analysis format.'
              )
            }
          />
        )}

        {activeTab === 'manual_screen' && (
          <ManualScreenAnalysis
            setAppState={setAppState}
            language={language}
            onAnalyzeScreenshot={(img, prompt) =>
              handleAnalyzeVision(img, prompt, buildScreenVisionPrompt(language))
            }
          />
        )}

        {activeTab === 'camera_scanner' && (
          <CameraScanner
            setAppState={setAppState}
            language={language}
            onAnalyzeImage={(img, prompt) => handleAnalyzeVision(img, prompt)}
          />
        )}

        {activeTab === 'coding' && (
          <CodingAssistant
            language={language}
            onCodeTask={async (prompt, code, mode) => {
              const fullPrompt = buildCodingPrompt(language, code ? `${prompt}\n\n${code}` : prompt, mode);
              return handleSendMessage(fullPrompt);
            }}
          />
        )}

        {activeTab === 'memory_vault' && (
          <MemoryVault
            language={language}
            memories={memories}
            onAddMemory={handleAddMemory}
            onUpdateMemory={handleUpdateMemory}
            onDeleteMemory={handleDeleteMemory}
            onClearAllMemories={handleClearAllMemories}
          />
        )}

        {activeTab === 'phone_assistant' && <PhoneAssistant language={language} />}

        {activeTab === 'history' && (
          <ConversationHistory
            language={language}
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
            onClearAllHistory={handleClearAllHistory}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={(lang) => {
          setLanguage(lang);
          soundEffects.playSuccess();
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        speechRate={speechRate}
        onSpeechRateChange={setSpeechRate}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}
