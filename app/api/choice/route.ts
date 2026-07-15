import { NextRequest, NextResponse } from 'next/server';
import { addMemory } from '@/lib/supermemory';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionId, sceneId, choiceLabel, trait, memoryText } = body;

  if (!sessionId || !memoryText) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await addMemory(sessionId, memoryText, [
      sessionId,
      `trait:${trait}`,
      `scene:${sceneId}`,
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('choice route error:', err);
    // Non-fatal — the game continues even if the memory write fails
    return NextResponse.json({ ok: true, warning: 'Memory write failed' });
  }
}
