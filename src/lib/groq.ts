import Groq from 'groq-sdk';

export const getGroqClient = (apiKey: string) => {
  return new Groq({
    apiKey: apiKey,
  });
};

export interface Suggestion {
  type: 'question' | 'insight' | 'fact' | 'answer';
  text: string;
}

export interface SuggestionBatch {
  id: string;
  timestamp: string;
  suggestions: Suggestion[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SessionData {
  transcript: { text: string; timestamp: string }[];
  suggestion_batches: SuggestionBatch[];
  chat_history: ChatMessage[];
}
