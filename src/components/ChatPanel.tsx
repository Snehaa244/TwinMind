'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, MessageSquare } from 'lucide-react';
import { ChatMessage } from '@/lib/groq';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="glass-panel flex flex-col h-full rounded-3xl overflow-hidden shadow-2xl relative">
      <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/20 z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <MessageSquare size={16} className="text-cyan-400" />
          </div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Session Insight Chat</h2>
        </div>
        <span className="text-[9px] font-bold tracking-[0.2em] bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
          ASSISTANT
        </span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth relative z-10"
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-slate-500 italic text-sm text-center px-8"
            >
              <div className="relative mb-4">
                <Bot size={44} className="opacity-20 text-slate-300 relative z-10" />
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
              </div>
              <p className="font-medium tracking-wide">AI Assistant is ready.</p>
              <p className="text-xs mt-2 opacity-70 leading-relaxed">Click a suggestion to expand on it,<br/>or type a custom question below.</p>
            </motion.div>
          ) : (
            messages.map((msg) => (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={msg.id} 
                className={cn(
                  "flex gap-4",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border",
                  msg.role === 'user' ? "bg-slate-800 border-slate-700" : "bg-cyan-500/20 border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                )}>
                  {msg.role === 'user' ? <User size={14} className="text-slate-300" /> : <Bot size={14} className="text-cyan-300" />}
                </div>
                <div className={cn(
                  "max-w-[85%] space-y-1.5",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-5 py-4 text-[14.5px] leading-relaxed shadow-lg font-medium",
                    msg.role === 'user' 
                      ? "bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100 rounded-[20px] rounded-tr-sm border border-slate-600/50" 
                      : "bg-[#0a0a0c]/80 backdrop-blur-md border border-cyan-500/20 text-slate-200 rounded-[20px] rounded-tl-sm relative"
                  )}>
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={cn(line.startsWith('-') || line.startsWith('*') ? "ml-4 -indent-3" : "mb-2")}>
                        {line}
                      </p>
                    ))}
                  </div>
                  <span className={cn(
                    "block text-[10px] text-slate-500 uppercase font-mono font-semibold tracking-wider",
                    msg.role === 'user' ? "text-right pr-2" : "text-left pl-2"
                  )}>
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            ))
          )}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <Bot size={14} className="text-cyan-300" />
              </div>
              <div className="bg-[#0a0a0c]/80 backdrop-blur-md border border-cyan-500/20 p-4 rounded-[20px] rounded-tl-sm shadow-lg flex items-center relative">
                <div className="absolute inset-0 bg-cyan-500/5 animate-pulse rounded-[20px] rounded-tl-sm" />
                <Loader2 size={16} className="animate-spin text-cyan-400" />
                <span className="ml-3 text-sm text-cyan-400/80 font-medium tracking-wide animate-pulse">Computing insight...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="p-5 bg-black/30 border-t border-white/5 relative z-10 backdrop-blur-md">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/30 to-violet-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type anything to the AI Copilot..."
            className="relative w-full bg-[#0a0a0c]/90 border border-slate-800 rounded-xl px-5 py-3.5 pr-12 text-[14px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 shadow-inner font-medium transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-all active:scale-90 shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:shadow-none"
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  );
};
