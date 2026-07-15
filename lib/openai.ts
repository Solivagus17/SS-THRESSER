// lib/openai.ts — Thin OpenAI client wrapper (server-side only)
import OpenAI from 'openai';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

/**
 * Single non-streaming chat completion.
 */
export async function complete(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 300
): Promise<string> {
  const client = getClient();
  const resp = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.85,
  });
  return resp.choices[0]?.message?.content?.trim() ?? '';
}
