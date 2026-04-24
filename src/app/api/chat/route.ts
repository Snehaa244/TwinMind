import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { message, fullTranscript, suggestion, prompt, apiKey, model, temperature } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 400 });
    }

    const groq = getGroqClient(apiKey);
    
    let finalPrompt = prompt
      .replace('{{full_transcript}}', fullTranscript || 'No transcript available.')
      .replace('{{suggestion}}', suggestion || message);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: finalPrompt,
        },
      ],
      model: model || 'llama-3.3-70b-versatile',
      temperature: temperature ?? 0.7,
    });

    const content = completion.choices[0].message.content;
    return NextResponse.json({ text: content });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate response' }, { status: 500 });
  }
}
