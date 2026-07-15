// lib/supermemory.ts — Thin Supermemory REST client (server-side only)

const BASE_URL = 'https://api.supermemory.ai/v3';

function getHeaders() {
  const key = process.env.SUPERMEMORY_API_KEY;
  if (!key) throw new Error('SUPERMEMORY_API_KEY is not set');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
  };
}

/**
 * Add a memory document tagged with session + trait tags.
 */
export async function addMemory(
  sessionId: string,
  content: string,
  tags: string[]
): Promise<void> {
  const res = await fetch(`${BASE_URL}/memories`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      content,
      metadata: {
        sessionId,
        tags,
      },
      containerTags: [sessionId, ...tags],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Supermemory addMemory error:', res.status, body);
    // Non-fatal — game continues even if memory write fails
  }
}

/**
 * Search memories for a session and return relevant text chunks.
 */
export async function searchMemories(
  sessionId: string,
  query: string
): Promise<string[]> {
  const params = new URLSearchParams({
    q: query,
    containerTags: sessionId,
    limit: '10',
  });

  const res = await fetch(`${BASE_URL}/memories/search?${params}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!res.ok) {
    console.error('Supermemory search error:', res.status);
    return [];
  }

  const data = await res.json();
  // Supermemory returns an array of results with a content/text field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: string[] = (data?.results ?? data?.memories ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => r.content ?? r.text ?? ''
  );
  return results.filter(Boolean);
}

/**
 * Pull ALL memories for a session (for ending synthesis).
 */
export async function getAllMemories(sessionId: string): Promise<string[]> {
  const params = new URLSearchParams({
    containerTags: sessionId,
    limit: '50',
  });

  const res = await fetch(`${BASE_URL}/memories?${params}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!res.ok) {
    console.error('Supermemory getAllMemories error:', res.status);
    return [];
  }

  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: string[] = (data?.results ?? data?.memories ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => r.content ?? r.text ?? ''
  );
  return results.filter(Boolean);
}
