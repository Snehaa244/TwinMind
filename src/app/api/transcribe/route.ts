import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/groq';
import { toFile } from 'groq-sdk';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('file') as File;
    const apiKey = formData.get('apiKey') as string;

    if (!audioFile || !apiKey) {
      return NextResponse.json({ error: 'Missing file or API key' }, { status: 400 });
    }

    const groq = getGroqClient(apiKey);

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Skip Whisper request if audio chunk is empty or too short. Provide an error for user to understand 'nothing is happening'
    if (buffer.length < 500) {
      return NextResponse.json({ error: 'Audio recording was empty or too short.' }, { status: 400 });
    }

    const groqFile = await toFile(buffer, 'audio.webm', { type: 'audio/webm' });

    // Groq transcription requires a file-like object
    const transcription = await groq.audio.transcriptions.create({
      file: groqFile,
      model: 'whisper-large-v3',
      response_format: 'json',
      language: 'en', // Optional, can be made configurable
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: error.message || 'Transcription failed' }, { status: 500 });
  }
}
