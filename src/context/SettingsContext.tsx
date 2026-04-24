'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_SUGGESTIONS_PROMPT, DEFAULT_CHAT_PROMPT } from '@/lib/prompts';

interface Settings {
  apiKey: string;
  suggestionsPrompt: string;
  chatPrompt: string;
  contextWindow: number; // number of lines
  temperature: number;
  model: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  apiKey: '',
  suggestionsPrompt: DEFAULT_SUGGESTIONS_PROMPT,
  chatPrompt: DEFAULT_CHAT_PROMPT,
  contextWindow: 10,
  temperature: 0.7,
  model: 'llama-3.3-70b-versatile',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('twinmind_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Auto-upgrade if users have decommissioned models cached in their browser
        if (parsed.model === 'llama3-70b-8192' || parsed.model === 'llama3-8b-8192') {
          parsed.model = 'llama-3.3-70b-versatile';
          localStorage.setItem('twinmind_settings', JSON.stringify({ ...defaultSettings, ...parsed }));
        }
        
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    setIsInitialized(true);
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('twinmind_settings', JSON.stringify(updated));
  };

  if (!isInitialized) return null;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
