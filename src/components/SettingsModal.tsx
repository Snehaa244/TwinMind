'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Settings, X, Save, Key, ScrollText, MessageSquare, Thermometer, Cpu } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Session Settings</h2>
              <p className="text-xs text-zinc-500">Configure AI models and prompts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* API Key Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-300 font-medium">
              <Key size={16} className="text-emerald-500" />
              <label htmlFor="apiKey">Groq API Key</label>
            </div>
            <input
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="gsk_..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />
            <p className="text-[10px] text-zinc-500 italic">Saved locally in your browser. Never shared.</p>
          </section>

          {/* Prompt Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-300 font-medium">
                <ScrollText size={16} className="text-blue-500" />
                <label htmlFor="suggestionsPrompt">Suggestions Prompt</label>
              </div>
              <textarea
                id="suggestionsPrompt"
                rows={6}
                value={formData.suggestionsPrompt}
                onChange={(e) => setFormData({ ...formData, suggestionsPrompt: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-400 focus:outline-none focus:border-blue-500/50 resize-none font-mono"
              />
            </section>
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-300 font-medium">
                <MessageSquare size={16} className="text-purple-500" />
                <label htmlFor="chatPrompt">Chat Prompt</label>
              </div>
              <textarea
                id="chatPrompt"
                rows={6}
                value={formData.chatPrompt}
                onChange={(e) => setFormData({ ...formData, chatPrompt: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-400 focus:outline-none focus:border-purple-500/50 resize-none font-mono"
              />
            </section>
          </div>

          {/* Model Params */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-800/50">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
                <Cpu size={14} />
                <label>Model</label>
              </div>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300"
              >
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
                <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
              </select>
            </section>
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
                <Thermometer size={14} />
                <label>Temperature ({formData.temperature})</label>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 bg-zinc-800 rounded-lg h-2 appearance-none"
              />
            </section>
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
                <ScrollText size={14} />
                <label>Context Window (lines)</label>
              </div>
              <input
                type="number"
                value={formData.contextWindow}
                onChange={(e) => setFormData({ ...formData, contextWindow: parseInt(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300"
              />
            </section>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
