'use client';

import React, { useEffect, useRef } from 'react';
import { ScrollText, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TranscriptItem {
  text: string;
  timestamp: string;
}

interface TranscriptPanelProps {
  transcript: TranscriptItem[];
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ transcript }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="glass-panel flex flex-col h-full rounded-3xl overflow-hidden shadow-2xl relative">
      <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/20 z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <ScrollText size={16} className="text-emerald-400" />
          </div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-widest">Live Transcript</h2>
        </div>
        <span className="text-[9px] font-bold tracking-[0.2em] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          SYNCING
        </span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-5 scroll-smooth relative z-10"
      >
        <AnimatePresence>
          {transcript.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-slate-500 italic text-sm text-center"
            >
              <Clock size={36} className="mb-3 opacity-20 text-slate-300" />
              <p className="font-medium tracking-wide">Transcript stream empty.</p>
              <p className="text-xs mt-1 opacity-70">Turn on microphone to begin text streaming.</p>
            </motion.div>
          ) : (
            transcript.map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative"
              >
                <div className="absolute -inset-y-2 -inset-x-4 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl -z-10" />
                <div className="flex items-baseline gap-3 mb-1.5 pl-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                  <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-wider bg-black/30 px-1.5 rounded">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-[15px] text-slate-300 leading-relaxed font-normal pl-6">
                  {item.text}
                </p>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
