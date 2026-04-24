'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MicRecorderProps {
  onTranscription: (text: string) => void;
  isRecording: boolean;
  setIsRecording: (val: boolean) => void;
}

export const MicRecorder: React.FC<MicRecorderProps> = ({ onTranscription, isRecording, setIsRecording }) => {
  const { settings } = useSettings();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      audioChunksRef.current.push(event.data);
    }
  };

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) {
      alert("No audio data captured. Please check if your microphone is functioning.");
      return;
    }

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];
    
    if (!settings.apiKey) return;

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('apiKey', settings.apiKey);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.text) {
        onTranscription(data.text);
      } else if (data.error) {
        alert(`Transcription Error: ${data.error}`);
      } else {
        alert('Empty transcription returned or audio rejected.');
      }
    } catch (error: any) {
      console.error('Transcription failed', error);
      alert('Transcription API call failed. Check your Groq Key and network connection.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleStop = async () => {
    if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = async () => {
             // Stop microphone tracks cleanly
             const tracks = mediaRecorderRef.current?.stream.getTracks() || [];
             tracks.forEach(track => track.stop());

            await processAudio();
            if (isRecording) {
                startRecording();
            }
        };
        mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    if (!settings.apiKey) {
      alert("Please configure your Groq API Key in the Settings (Gear Icon) before starting!");
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start(1000); // 1-second timeslices to ensure continuous flushing

      intervalRef.current = setTimeout(() => {
          if (isRecording) {
              handleStop();
          }
      }, 30000);

    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.onstop = async () => {
              // Stop microphone tracks cleanly
              const tracks = mediaRecorderRef.current?.stream.getTracks() || [];
              tracks.forEach(track => track.stop());
              await processAudio();
          };
          mediaRecorderRef.current.stop();
      }
    }
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          const tracks = mediaRecorderRef.current.stream.getTracks() || [];
          tracks.forEach(track => track.stop());
          mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  return (
    <div className="glass-panel shrink-0 flex flex-col items-center gap-5 p-8 rounded-3xl relative overflow-hidden group">
      {/* Dynamic Background Glow */}
      <motion.div 
        animate={{ opacity: isRecording ? 0.15 : 0 }}
        className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"
      />

      <div className="relative flex items-center justify-center">
        <AnimatePresence>
          {isRecording && (
            <>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
              />
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute inset-0 rounded-full border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
              />
            </>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsRecording(!isRecording)}
          className={cn(
            "relative z-10 flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-xl",
            isRecording 
              ? "bg-slate-900 text-red-400 border border-red-500/50 shadow-red-900/20" 
              : "bg-slate-900 text-emerald-400 border border-emerald-500/50 hover:bg-slate-800 shadow-emerald-900/10"
          )}
        >
          {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
        </motion.button>
      </div>

      <div className="text-center z-10">
        <h3 className="font-semibold text-slate-200 tracking-wide">
          {isRecording ? "Listening Live..." : "Microphone Idle"}
        </h3>
        <AnimatePresence mode="wait">
          {isTranscribing ? (
            <motion.div 
              key="transcribing"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center justify-center gap-2 text-xs font-medium text-cyan-400 mt-2 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20"
            >
              <Loader2 size={12} className="animate-spin" />
              Processing audio...
            </motion.div>
          ) : (
            <motion.p 
              key="status"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-slate-500 mt-2 font-medium"
            >
              {isRecording ? "Auto-transcribing 30s chunks" : "Click mic to start session"}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
