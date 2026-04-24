'use client';

import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { SuggestionBatch, Suggestion } from '@/lib/groq';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SuggestionsPanelProps {
  batches: SuggestionBatch[];
  onSuggestionClick: (suggestion: Suggestion) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ batches, onSuggestionClick, onRefresh, isLoading }) => {
  return (
    <div className="glass-panel-heavy flex flex-col h-full rounded-3xl overflow-hidden shadow-2xl relative">
      <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/20 z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-violet-500/10 rounded-lg border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <Sparkles size={16} className="text-violet-400" />
          </div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Live Suggestions</h2>
        </div>
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent"
        >
          <RefreshCw size={16} className={cn(isLoading && "animate-spin")} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 scroll-smooth relative z-10">
        <AnimatePresence mode="popLayout">
          {batches.length === 0 && !isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-slate-500 italic text-sm text-center px-6"
            >
              <div className="relative mb-4">
                <Sparkles size={40} className="opacity-20 text-slate-300 relative z-10" />
                <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
              </div>
              <p className="font-medium tracking-wide">Awaiting conversation flow...</p>
              <p className="text-xs mt-2 opacity-70">Suggestions will synthesize here securely.</p>
            </motion.div>
          ) : (
            <>
              {isLoading && batches.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                  ))}
                </motion.div>
              )}
              {batches.map((batch, batchIndex) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: batchIndex === 0 ? 1 : 0.4, y: 0, scale: 1 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  key={batch.id} 
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 px-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-2">
                      {batchIndex === 0 && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />}
                      Batch {batches.length - batchIndex} • {batch.timestamp}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                  <div className="grid gap-3">
                    {batch.suggestions.map((suggestion, idx) => (
                      <SuggestionCard 
                        key={idx} 
                        suggestion={suggestion} 
                        onClick={() => onSuggestionClick(suggestion)} 
                        index={idx}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface SuggestionCardProps {
  suggestion: Suggestion;
  onClick: () => void;
  index: number;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onClick, index }) => {
  const typeStyles = {
    question: "from-blue-500/20 to-blue-900/20 border-blue-500/30 text-blue-300",
    insight: "from-violet-500/20 to-violet-900/20 border-violet-500/30 text-violet-300",
    fact: "from-amber-500/20 to-amber-900/20 border-amber-500/30 text-amber-300",
    answer: "from-emerald-500/20 to-emerald-900/20 border-emerald-500/30 text-emerald-300",
  };

  const currentStyle = typeStyles[suggestion.type] || "from-slate-500/20 to-slate-900/20 border-slate-500/30 text-slate-300";

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onClick={onClick}
      className="group relative text-left w-full focus:outline-none"
    >
      <div className={cn(
        "absolute inset-0 rounded-2xl bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md -z-10",
        currentStyle.split(' ')[0], currentStyle.split(' ')[1]
      )} />
      <div className={cn(
        "p-4 rounded-2xl bg-[#0a0a0c]/80 backdrop-blur-md border hover:ml-1 relative shrink-0 z-10 transition-all duration-300 shadow-xl",
        currentStyle.split(' ')[2]
      )}>
        <div className="flex items-center gap-2 mb-2.5">
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border bg-black/40",
            currentStyle.split(' ')[2], currentStyle.split(' ')[3]
          )}>
            {suggestion.type}
          </span>
        </div>
        <p className="text-sm text-slate-200 group-hover:text-white transition-colors leading-relaxed font-medium">
          {suggestion.text}
        </p>
      </div>
    </motion.button>
  );
};
