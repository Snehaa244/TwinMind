'use client';

import React, { useState } from 'react';
import { MicRecorder } from '@/components/MicRecorder';
import { TranscriptPanel } from '@/components/TranscriptPanel';
import { SuggestionsPanel } from '@/components/SuggestionsPanel';
import { ChatPanel } from '@/components/ChatPanel';
import { SettingsModal } from '@/components/SettingsModal';
import { Suggestion, SuggestionBatch, ChatMessage, SessionData } from '@/lib/groq';
import { Settings, Download } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { formatTime } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Home() {
  const { settings } = useSettings();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<{ text: string; timestamp: string }[]>([]);
  const [suggestionBatches, setSuggestionBatches] = useState<SuggestionBatch[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const fullTranscriptText = transcript.map(t => t.text).join('\n');

  const handleTranscription = async (text: string) => {
    const timestamp = formatTime(new Date());
    setTranscript((prev) => [...prev, { text, timestamp }]);
    generateSuggestions([...transcript.map(t => t.text), text].join('\n'));
  };

  const generateSuggestions = async (currentTranscriptContext?: string) => {
    if (!settings.apiKey) {
        setShowSettings(true);
        return;
    }

    const contextText = currentTranscriptContext || fullTranscriptText;
    if (!contextText.trim()) return;

    const lines = contextText.split('\n');
    const recentTranscript = lines.slice(-settings.contextWindow).join('\n');

    setIsGeneratingSuggestions(true);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recentTranscript,
          prompt: settings.suggestionsPrompt,
          apiKey: settings.apiKey,
          model: settings.model,
          temperature: settings.temperature,
        }),
      });

      const data = await response.json();
      if (data.suggestions && data.suggestions.length > 0) {
        const newBatch: SuggestionBatch = {
          id: Math.random().toString(36).substring(7),
          timestamp: formatTime(new Date()),
          suggestions: data.suggestions,
        };
        setSuggestionBatches((prev) => [newBatch, ...prev]);
      }
    } catch (error) {
      console.error('Error generating suggestions', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    handleSendMessage(suggestion.text, suggestion.text);
  };

  const handleSendMessage = async (displayMessage: string, suggestionContext?: string) => {
    if (!settings.apiKey) {
        setShowSettings(true);
        return;
    }

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: displayMessage,
      timestamp: formatTime(new Date()),
    };

    setChatHistory((prev) => [...prev, newMessage]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: displayMessage,
          suggestion: suggestionContext,
          fullTranscript: fullTranscriptText,
          prompt: settings.chatPrompt,
          apiKey: settings.apiKey,
          model: settings.model,
          temperature: settings.temperature,
        }),
      });

      const data = await response.json();
      if (data.text) {
        setChatHistory((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            role: 'assistant',
            content: data.text,
            timestamp: formatTime(new Date()),
          },
        ]);
      }
    } catch (error) {
      console.error('Chat error', error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleExport = () => {
    const sessionData: SessionData = {
      transcript,
      suggestion_batches: suggestionBatches,
      chat_history: chatHistory,
    };
    
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `twinmind-session-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col bg-[#020617] text-slate-200">
      {/* Background Glowing Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-900/40 blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-violet-900/30 blur-[150px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]" 
        />
      </div>

      <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden p-4 md:p-6 lg:p-8 gap-6 max-w-[1920px] mx-auto w-full">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center justify-between shrink-0 px-2"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              TwinMind
            </h1>
            <span className="text-[11px] md:text-sm text-slate-400 font-medium tracking-wide uppercase">
              Live Edge Copilot
            </span>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={transcript.length === 0 && suggestionBatches.length === 0 && chatHistory.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all border border-white/10 shadow-lg shadow-black/20 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export Session</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => setShowSettings(true)}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all border border-white/10 shadow-lg shadow-black/20 relative"
            >
              <Settings size={18} />
              {!settings.apiKey && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping border-2 border-[#020617]" />
              )}
              {!settings.apiKey && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#020617]" />
              )}
            </motion.button>
          </div>
        </motion.header>

        {/* 3-Column Layout */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Panel 1: Mic & Transcript */}
          <section className="flex flex-col gap-6 min-h-0">
            <MicRecorder 
                onTranscription={handleTranscription} 
                isRecording={isRecording}
                setIsRecording={setIsRecording}
            />
            <div className="flex-1 min-h-0">
              <TranscriptPanel transcript={transcript} />
            </div>
          </section>

          {/* Panel 2: Live Suggestions */}
          <section className="min-h-0">
            <SuggestionsPanel 
              batches={suggestionBatches} 
              onSuggestionClick={handleSuggestionClick}
              onRefresh={() => generateSuggestions()}
              isLoading={isGeneratingSuggestions}
            />
          </section>

          {/* Panel 3: Chat */}
          <section className="min-h-0">
            <ChatPanel 
              messages={chatHistory} 
              onSendMessage={(msg) => handleSendMessage(msg)}
              isLoading={isChatLoading}
            />
          </section>
        </motion.div>

        <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </main>
    </div>
  );
}
