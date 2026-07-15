import { NextRequest, NextResponse } from 'next/server';
import { getAllMemories } from '@/lib/supermemory';
import { complete } from '@/lib/openai';
import { getEndingCategory } from '@/lib/scenes';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId, traitCounts } = body as {
    sessionId: string;
    traitCounts: Record<string, number>;
  };

  if (!sessionId) {
    return NextResponse.json({ epilogue: 'Session error. No record found.' }, { status: 400 });
  }

  try {
    const memories = await getAllMemories(sessionId);
    const endingCategory = getEndingCategory(traitCounts ?? {});
    const memoryDump = memories.join('\n');
    const traitSummary = Object.entries(traitCounts ?? {})
      .map(([t, c]) => `${t}: ${c}`)
      .join(', ');

    const systemPrompt = `You are writing the final ship log entry for the SS Thresher's maintenance terminal.
The voice is the ship's log — terse, factual, slightly poetic in the way exhausted people write things down.
Ending category: "${endingCategory}".
Write 150–200 words. Reference at least two specific choices by name (e.g. "the tech who left Doss banging on a sealed door", not just "a reckless choice").
Do not use the word "epilogue". Do not address the player directly. Write in third person about Kessler.
Match tone to the ending category:
- "The Reckless Hero" = grudging admiration, chaos, cost
- "Company Man" = bureaucratic coldness, loss buried in paperwork  
- "Alone in the Black" = dark corporate-memo comedy, hollow victory
- "Found Family" = warmth, earned relief, small human moments
- "Ghost in the Machine" = ambiguity, sequel hook, ARIA still out there`;

    const userPrompt = `Full choice history:\n${memoryDump || 'No memories recorded.'}\n\nTrait tally: ${traitSummary || 'unknown'}\n\nWrite the personalized ship log epilogue.`;

    const epilogue = await complete(systemPrompt, userPrompt, 350);
    return NextResponse.json({ epilogue, endingCategory });
  } catch (err) {
    console.error('ending route error:', err);
    return NextResponse.json({
      epilogue: 'Ship log corrupted. Some records are better lost.',
      endingCategory: 'Unknown',
    });
  }
}
