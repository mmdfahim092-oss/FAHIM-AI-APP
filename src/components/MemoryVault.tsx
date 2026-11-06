import React, { useState } from 'react';
import {
  Database,
  Plus,
  Trash2,
  Edit2,
  Search,
  ShieldCheck,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';
import { Language, MemoryItem } from '../types';
import { soundEffects } from '../utils/soundEffects';

interface MemoryVaultProps {
  language: Language;
  memories: MemoryItem[];
  onAddMemory: (item: Omit<MemoryItem, 'id' | 'timestamp'>) => void;
  onUpdateMemory: (id: string, item: Partial<MemoryItem>) => void;
  onDeleteMemory: (id: string) => void;
  onClearAllMemories: () => void;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({
  language,
  memories,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
  onClearAllMemories,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // New Memory Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<MemoryItem['category']>('personal');

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    if (editingId) {
      onUpdateMemory(editingId, {
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
      });
      setEditingId(null);
    } else {
      onAddMemory({
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
      });
      setIsAdding(false);
    }

    setFormTitle('');
    setFormContent('');
    setFormCategory('personal');
    soundEffects.playSuccess();
  };

  const handleStartEdit = (m: MemoryItem) => {
    setEditingId(m.id);
    setFormTitle(m.title);
    setFormContent(m.content);
    setFormCategory(m.category);
    setIsAdding(true);
    soundEffects.playBeep();
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormTitle('');
    setFormContent('');
    soundEffects.playBeep();
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-pink-400" />
            <h2 className="font-hud font-bold text-base sm:text-lg text-pink-300 tracking-wider uppercase">
              {language === 'bn' ? 'মেমোরি ভল্ট (MEMORY VAULT)' : 'Privacy-Preserving Memory Vault'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'ব্যবহারকারীর স্পষ্ট অনুমতিপ্রাপ্ত ব্যক্তিগত তথ্য ও পছন্দ এখানে সুরক্ষিত থাকে।'
              : 'Store only user-approved information, preferences, and notes locally.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isAdding && (
            <button
              onClick={() => {
                setIsAdding(true);
                setEditingId(null);
                setFormTitle('');
                setFormContent('');
                soundEffects.playBeep();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-600/30 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নতুন মেমোরি যোগ করুন' : 'Add Memory'}</span>
            </button>
          )}

          {memories.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-500/30 hover:bg-rose-900 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সব মুছুন' : 'Clear All'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-950/20 border border-pink-500/20 text-xs text-pink-200">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>
          {language === 'bn'
            ? 'পাসওয়ার্ড বা গোপন পিন কখনো সেভ করবেন না। এখানে সংরক্ষিত তথ্য কেবলমাত্র FAHIM AI এর সাথে কথোপকথনে সহায়তার জন্য ব্যবহৃত হয়।'
            : 'Never store passwords or financial secrets. Memory items are sent as context to personalize assistant responses.'}
        </span>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-rose-500/40 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-hud font-bold text-sm">
                {language === 'bn' ? 'সব মেমোরি মুছে ফেলতে চান?' : 'Clear All Memory Items?'}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'bn'
                ? 'এই কাজটি অপরিবর্তনীয়। আপনার সংরক্ষিত সমস্ত ব্যক্তিগত ও ট্রেডিং পছন্দ চিরতরে মুছে যাবে।'
                : 'This action is irreversible. All stored preferences and context notes will be permanently deleted.'}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onClearAllMemories();
                  setShowClearConfirm(false);
                  soundEffects.playSuccess();
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500"
              >
                {language === 'bn' ? 'হ্যাঁ, সব মুছুন' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal / Box */}
      {isAdding && (
        <form
          onSubmit={handleSave}
          className="p-4 rounded-2xl bg-slate-900/90 border border-pink-500/40 space-y-3 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-hud font-bold text-xs uppercase text-pink-300">
              {editingId
                ? language === 'bn'
                  ? 'মেমোরি সম্পাদনা করুন'
                  : 'Edit Memory'
                : language === 'bn'
                ? 'নতুন অনুমোদিত মেমোরি যোগ করুন'
                : 'Add Approved Memory'}
            </h3>
            <button
              type="button"
              onClick={handleCancel}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-hud text-slate-400">
                {language === 'bn' ? 'শিরোনাম / টপিক:' : 'Title:'}
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder={
                  language === 'bn' ? 'যেমন: প্রিয় ট্রেডিং পেয়ার' : 'e.g. Preferred Trading Pair'
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-hud text-slate-400">
                {language === 'bn' ? 'ক্যাটাগরি:' : 'Category:'}
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-pink-300 focus:outline-none focus:border-pink-400"
              >
                <option value="personal">ব্যক্তিগত তথ্য (Personal)</option>
                <option value="trading">ট্রেডিং কৌশল (Trading)</option>
                <option value="code">কোডিং প্রজেক্ট (Coding)</option>
                <option value="preference">পছন্দ/অপছন্দ (Preference)</option>
                <option value="system">সিস্টেম/ডিভাইস (System)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-hud text-slate-400">
              {language === 'bn' ? 'বিস্তারিত তথ্য:' : 'Approved Content:'}
            </label>
            <textarea
              required
              rows={3}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'যেমন: "আমি BTC/USDT 15m টাইমফ্রেমে সাপোর্ট-রেজিস্ট্যান্স ব্রেকআউট পছন্দ করি"'
                  : 'e.g. "I focus on BTC/USDT 15m timeframe breakouts and strict 1:2 R:R."'
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-pink-400 resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-300 bg-slate-800 hover:bg-slate-700"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-pink-600 hover:bg-pink-500 shadow-md transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Memory'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'bn' ? 'মেমোরিতে খুঁজুন...' : 'Search memory vault...'
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400"
          />
        </div>

        <div className="flex items-center gap-1 text-xs">
          {['all', 'personal', 'trading', 'code', 'preference'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                selectedCategory === cat
                  ? 'bg-pink-950 text-pink-300 border border-pink-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Memories List */}
      <div className="flex-1 overflow-y-auto space-y-2.5">
        {filteredMemories.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
            <Database className="w-8 h-8 text-slate-600" />
            <p className="text-xs font-semibold text-slate-400">
              {language === 'bn' ? 'কোনো মেমোরি আইটেম পাওয়া যায়নি' : 'No memory items found'}
            </p>
          </div>
        ) : (
          filteredMemories.map((m) => (
            <div
              key={m.id}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-pink-500/30 transition-all flex items-start justify-between gap-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-pink-200">{m.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-hud uppercase bg-pink-950/60 text-pink-400 border border-pink-500/30">
                    {m.category}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(m.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{m.content}</p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 opacity-80 group-hover:opacity-100">
                <button
                  onClick={() => handleStartEdit(m)}
                  title="সম্পাদনা"
                  className="p-1.5 text-slate-400 hover:text-pink-300 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    onDeleteMemory(m.id);
                    soundEffects.playBeep();
                  }}
                  title="মুছুন"
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
