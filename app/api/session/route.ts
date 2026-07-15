import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  const sessionId = `session:kessler-${uuidv4()}`;
  return NextResponse.json({ sessionId });
}
