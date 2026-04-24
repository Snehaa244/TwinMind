import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const { recentTranscript, prompt, apiKey, model, temperature } = await req.json();

    if (!apiKey || !recentTranscript) {
      return NextResponse.json({ error: 'Missing transcript or API key' }, { status: 400 });
    }

    const groq = getGroqClient(apiKey);
    const finalPrompt = prompt.replace('{{recent_transcript}}', recentTranscript);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: finalPrompt,
        },
      ],
      model: model || 'llama-3.3-70b-versatile',
      temperature: temperature ?? 0.7,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    let suggestions = JSON.parse(content || '[]');
    
    // Ensure it's an array if the prompt returns an object with a key
    if (!Array.isArray(suggestions) && typeof suggestions === 'object') {
      suggestions = suggestions.suggestions || Object.values(suggestions)[0] || [];
    }

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Suggestions error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate suggestions' }, { status: 500 });
  }
}
