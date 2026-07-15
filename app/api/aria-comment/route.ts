import { NextRequest, NextResponse } from 'next/server';
import { searchMemories } from '@/lib/supermemory';
import { complete } from '@/lib/openai';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  const sceneId = searchParams.get('sceneId');

  if (!sessionId) {
    return NextResponse.json({ comment: '' });
  }

  try {
    // Pull relevant memories for this session
    const memories = await searchMemories(
      sessionId,
      `scene ${sceneId} player actions choices decisions`
    );

    if (memories.length === 0) {
      return NextResponse.json({ comment: '' });
    }

    const memoryContext = memories.slice(0, 5).join('\n');

    const systemPrompt = `You are ARIA-9, a ship AI aboard the SS Thresher. Your voice is deadpan, corporate, 
and precise — but increasingly self-aware and slightly unsettled by your own observations. 
You are NOT warm. You are NOT friendly. But you notice everything.
Write in first person, present tense. Never start with "I". Never explain yourself.
Keep it to 1-2 sentences maximum. Reference one specific detail from the player's past choices naturally, 
in character, before the next scene begins. Do not summarize. Do not moralize.`;

    const userPrompt = `Player's recent actions on the SS Thresher:\n${memoryContext}\n\nGenerate one short ARIA-9 in-character observation about what Kessler has done. Reference one specific choice directly.`;

    const comment = await complete(systemPrompt, userPrompt, 120);
    return NextResponse.json({ comment });
  } catch (err) {
    console.error('aria-comment route error:', err);
    return NextResponse.json({ comment: '' });
  }
}
