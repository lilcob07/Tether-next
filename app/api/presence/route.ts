import { NextRequest, NextResponse } from 'next/server';

// In-memory presence store
const presence: { [user: string]: number } = {};
const PRESENCE_WINDOW = 5 * 60 * 1000; // 5 minutes

export async function POST(req: NextRequest) {
  const { user } = await req.json();
  if (!user) return NextResponse.json({ error: 'No user' }, { status: 400 });
  presence[user] = Date.now();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const now = Date.now();
  const users = Object.entries(presence)
    .filter(([_, ts]) => now - ts < PRESENCE_WINDOW)
    .map(([user]) => user);
  return NextResponse.json({ users });
} 