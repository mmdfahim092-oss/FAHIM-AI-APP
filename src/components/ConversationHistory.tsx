import React, { useState } from 'react';
import {
  History,
  Trash2,
  MessageSquare,
  Clock,
  Sparkles,
  ExternalLink,
  Search,
  CheckCircle,
} from 'lucide-react';
import { Conversation, Language, NavigationTab } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface ConversationHistoryProps {
  language: Language;
  conversations: Conversation[];
  onSelectConversation: (convo: Conversation) => void;
  onDeleteConversation: (id: string) => void;
  onClearAllHistory: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  language,
  conversations,
  onSelectConversation,
  onDeleteConversation,
  onClearAllHistory,
}) => {
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h2 className="font-hud font-bold text-base sm:text-lg text-cyan-300 tracking-wider uppercase">
              {language === 'bn' ? 'কথোপকথন ইতিহাস (HISTORY)' : 'Conversation History'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'আপনার পূর্ববর্তী ভয়েস ও চ্যাট সেশনগুলোর লোকাল হিস্ট্রি।'
              : 'Stored session transcripts stored strictly within your browser locally.'}
          </p>
        </div>

        {conversations.length > 0 && (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-500/30 hover:bg-rose-900 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সব ইতিহাস মুছুন' : 'Clear History'}</span>
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-between text-xs text-rose-200">
          <span>{language === 'bn' ? 'সমস্ত হিস্ট্রি মুছে ফেলতে নিশ্চিত?' : 'Delete all conversation history?'}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-2.5 py-1 rounded bg-slate-800 text-slate-300"
            >
              না
            </button>
            <button
              onClick={() => {
                onClearAllHistory();
                setShowConfirm(false);
                soundEffects.playSuccess();
              }}
              className="px-3 py-1 rounded font-bold bg-rose-600 text-white"
            >
              হ্যাঁ, মুছুন
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={language === 'bn' ? 'হিস্ট্রিতে খুঁজুন...' : 'Search history...'}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5">
        {filtered.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
            <History className="w-8 h-8 text-slate-600" />
            <p className="text-xs font-semibold text-slate-400">
              {language === 'bn' ? 'কোনো সংরক্ষিত ইতিহাস নেই' : 'No stored conversations'}
            </p>
          </div>
        ) : (
          filtered.map((convo) => (
            <div
              key={convo.id}
              onClick={() => {
                onSelectConversation(convo);
                soundEffects.playBeep();
              }}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-xs sm:text-sm text-slate-200 group-hover:text-cyan-300">
                    {convo.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-hud uppercase bg-slate-800 text-cyan-400">
                    {convo.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(convo.updatedAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>{convo.messages.length} টি মেসেজ</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(convo.id);
                  soundEffects.playBeep();
                }}
                className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                title="মুছুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
