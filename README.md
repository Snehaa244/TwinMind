# 🧠 TwinMind: Live Edge AI Copilot

TwinMind is a premium, real-time AI assistant designed to act as your "second brain" during meetings, interviews, and live conversations. It listens, transcribes, and provides proactive suggestions and deep-context chat capabilities in real-time.

![TwinMind Banner](https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2070&auto=format&fit=crop)

---

## 🎯 The Task
The goal was to build a low-latency, context-aware AI companion that could seamlessly integrate into a user's workflow without being intrusive. The application needed to handle continuous audio streams, convert them to text accurately, and use that text to provide meaningful, real-time insights.

## 🚀 The Problem It Solves
Modern meetings are fast-paced and often overwhelming.
- **Context Loss**: Hard to remember everything said 10 minutes ago.
- **Cognitive Load**: Hard to think of the next best question while actively listening.
- **Action Items**: Important tasks often get buried in the conversation.
- **Delayed Insights**: Most AI tools analyze meetings *after* they end; TwinMind does it *while* they happen.

## 🛠️ How It Was Built
TwinMind was architected for speed and aesthetics using a modern full-stack approach:

### 1. The Engine (Next.js & Groq)
- **High-Speed Transcription**: Leverages **Groq's Whisper-large-v3** implementation for near-instant speech-to-text.
- **Contextual Intelligence**: Uses **Llama-3-70b/Mixtral** models via Groq SDK to analyze transcripts and generate proactive suggestions.
- **State Management**: Implemented with React Context API and custom hooks for smooth, non-flickering audio processing.

### 2. The Experience (UI/UX)
- **Fluid Design**: Built with **Tailwind CSS** and **Framer Motion** for a premium "glassmorphism" aesthetic with dynamic glowing orbs and micro-animations.
- **Continuous Recording**: Custom logic that chunks audio into 30-second segments for reliable, long-running session stability.
- **Responsive Layout**: A 3-column dashboard that fits perfectly on all screen sizes.

### 3. Key Features
- 🎙️ **Live Transcription**: Real-time audio capture with timestamped logs.
- 💡 **Proactive Suggestions**: Intelligent prompts generated based on the last few minutes of conversation.
- 💬 **Context-Aware Chat**: Ask questions like "What was the budget mentioned?" or "Summarize our progress so far."
- 📥 **Session Export**: Save your entire session (transcript + chat + suggestions) as a structured JSON file.

---

## 🛠️ Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Integration**: [Groq SDK](https://groq.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🏃 Getting Started

### 1. Prerequisites
- A Groq API Key (Get it at [console.groq.com](https://console.groq.com/))

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Snehaa244/TwinMind.git

# Install dependencies
npm install

# Run the development server
npm run dev
```

### 3. Setup
Open the app, click the **Settings** icon (top right), and paste your **Groq API Key**. You're ready to go!

---

## ✨ Developed with ❤️ by
**Sneha Parmar**
*Crafting the future of intelligent human-AI collaboration.*
